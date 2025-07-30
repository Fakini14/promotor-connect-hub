import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, FileText, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface UploadFile {
  file: File;
  preview?: string;
  progress: number;
  id: string;
}

interface UploadButtonProps {
  onFilesChange?: (files: File[]) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (urls: string[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // em MB
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const UploadButton: React.FC<UploadButtonProps> = ({
  onFilesChange,
  onUploadProgress,
  onUploadComplete,
  multiple = false,
  accept = "image/*,.pdf",
  maxSize = 5, // 5MB padrão
  maxFiles = 5,
  disabled = false,
  className,
  children
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const compressImage = (file: File, quality: number = 0.7): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcula dimensões mantendo proporção
        const maxDimension = 1200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const validateFile = (file: File): boolean => {
    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: `O arquivo ${file.name} excede o limite de ${maxSize}MB.`,
        variant: 'destructive',
      });
      return false;
    }

    // Validar tipo
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.match(type.replace('*', '.*'));
    });

    if (!isValidType) {
      toast({
        title: 'Tipo de arquivo não permitido',
        description: `O arquivo ${file.name} não é um tipo permitido.`,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const processFiles = async (fileList: FileList) => {
    const newFiles: UploadFile[] = [];
    
    // Limitar número de arquivos
    const filesToProcess = Array.from(fileList).slice(0, maxFiles - files.length);

    for (const file of filesToProcess) {
      if (!validateFile(file)) continue;

      // Comprimir se for imagem
      const processedFile = await compressImage(file);
      const preview = await createPreview(processedFile);

      const uploadFile: UploadFile = {
        file: processedFile,
        preview,
        progress: 0,
        id: Date.now() + Math.random().toString(36),
      };

      newFiles.push(uploadFile);
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    
    if (onFilesChange) {
      onFilesChange(updatedFiles.map(f => f.file));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      processFiles(fileList);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const fileList = e.dataTransfer.files;
    if (fileList) {
      processFiles(fileList);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    
    if (onFilesChange) {
      onFilesChange(updatedFiles.map(f => f.file));
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-gray-300 hover:border-primary",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!disabled ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="text-center">
          {children || (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Clique para selecionar arquivos
              </p>
              <p className="text-sm text-gray-500">
                ou arraste e solte aqui
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Máximo {maxSize}MB por arquivo • {accept.split(',').join(', ')}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadFile) => (
            <div
              key={uploadFile.id}
              className="flex items-center space-x-3 p-3 border rounded-lg bg-white"
            >
              {/* Preview/Ícone */}
              <div className="flex-shrink-0">
                {uploadFile.preview ? (
                  <img
                    src={uploadFile.preview}
                    alt="Preview"
                    className="h-10 w-10 object-cover rounded"
                  />
                ) : (
                  <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                    {getFileIcon(uploadFile.file)}
                  </div>
                )}
              </div>

              {/* Informações do Arquivo */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                
                {/* Barra de Progresso */}
                {uploadFile.progress > 0 && uploadFile.progress < 100 && (
                  <Progress value={uploadFile.progress} className="mt-1" />
                )}
              </div>

              {/* Botão Remover */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(uploadFile.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { UploadButton };
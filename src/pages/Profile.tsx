import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
  nome_completo?: string;
  cpf?: string;
  telefone?: string;
  empresa?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  pix_tipo?: string;
  pix_chave?: string;
}

const Profile = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileData({
        nome_completo: profile.nome_completo || '',
        cpf: profile.cpf || '',
        telefone: profile.telefone || '',
        empresa: profile.empresa || '',
        banco: profile.banco || '',
        agencia: profile.agencia || '',
        conta: profile.conta || '',
        pix_tipo: profile.pix_tipo || '',
        pix_chave: profile.pix_chave || '',
      });
    }
  }, [profile]);

  const salvarPerfil = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome_completo: profileData.nome_completo,
          cpf: profileData.cpf,
          telefone: profileData.telefone,
          empresa: profileData.empresa,
          banco: profileData.banco,
          agencia: profileData.agencia,
          conta: profileData.conta,
          pix_tipo: profileData.pix_tipo,
          pix_chave: profileData.pix_chave,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      });

      // Refresh profile data from AuthContext
      await refreshProfile();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o perfil.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatarCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatarTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  if (!profile) {
    return <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">Perfil não encontrado</div>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Meu Perfil</h1>
          </div>
          <Button onClick={salvarPerfil} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Dados Pessoais</span>
            </CardTitle>
            <CardDescription>
              Mantenha suas informações pessoais atualizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={profileData.nome_completo || ''}
                  onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={profileData.cpf || ''}
                  onChange={(e) => handleInputChange('cpf', formatarCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={profileData.telefone || ''}
                  onChange={(e) => handleInputChange('telefone', formatarTelefone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={profileData.empresa || ''}
                  onChange={(e) => handleInputChange('empresa', e.target.value)}
                  placeholder="Nome da empresa (se terceiro)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Bancários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Dados Bancários</span>
            </CardTitle>
            <CardDescription>
              Para recebimento de adiantamentos e reembolsos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banco">Banco</Label>
                <Input
                  id="banco"
                  value={profileData.banco || ''}
                  onChange={(e) => handleInputChange('banco', e.target.value)}
                  placeholder="Nome do banco"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agencia">Agência</Label>
                <Input
                  id="agencia"
                  value={profileData.agencia || ''}
                  onChange={(e) => handleInputChange('agencia', e.target.value)}
                  placeholder="0000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conta">Conta</Label>
                <Input
                  id="conta"
                  value={profileData.conta || ''}
                  onChange={(e) => handleInputChange('conta', e.target.value)}
                  placeholder="00000-0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PIX */}
        <Card>
          <CardHeader>
            <CardTitle>PIX</CardTitle>
            <CardDescription>
              Chave PIX para recebimentos rápidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pix_tipo">Tipo da Chave</Label>
                <Select
                  value={profileData.pix_tipo || ''}
                  onValueChange={(value) => handleInputChange('pix_tipo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="chave_aleatoria">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pix_chave">Chave PIX</Label>
                <Input
                  id="pix_chave"
                  value={profileData.pix_chave || ''}
                  onChange={(e) => handleInputChange('pix_chave', e.target.value)}
                  placeholder="Digite sua chave PIX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Salvar Mobile */}
        <div className="md:hidden">
          <Button 
            onClick={salvarPerfil} 
            disabled={saving}
            size="lg"
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
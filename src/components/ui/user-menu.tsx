import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Lock, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChangePasswordDialog from './change-password-dialog';

const UserMenu = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  };

  if (!profile) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(profile.nome_completo)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile.nome_completo}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {profile.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
            <Lock className="mr-2 h-4 w-4" />
            <span>Alterar senha</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog 
        open={showChangePassword} 
        onOpenChange={setShowChangePassword} 
      />
    </>
  );
};

export default UserMenu;
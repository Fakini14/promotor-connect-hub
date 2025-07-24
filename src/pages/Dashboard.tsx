import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import PromotorDashboard from '@/components/dashboard/PromotorDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {profile.tipo_usuario === 'admin' ? (
        <AdminDashboard />
      ) : (
        <PromotorDashboard />
      )}
    </div>
  );
};

export default Dashboard;
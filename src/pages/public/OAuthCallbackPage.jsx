import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (!loading) {
      navigate('/login', { replace: true, state: { error: 'Sign in failed. Please try again.' } });
    }
  }, [isAuthenticated, loading, navigate]);

  return <LoadingSpinner message="Completing sign in..." />;
};

export default OAuthCallbackPage;

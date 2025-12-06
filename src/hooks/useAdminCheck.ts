import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';

export function useAdminCheck() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const checkAdminStatus = async () => {
      setLoading(true);
      try {
        const adminStatus = await chatService.isAdmin();
        if (isMounted) {
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        if (isMounted) {
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAdminStatus();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return { isAdmin, loading };
}

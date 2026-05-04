import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { CourseManagement } from '@/components/admin/CourseManagement';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';
import { RouteFallbackAdmin } from '@/components/layout/route-fallbacks';

export default function AdminCourses() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: rolesLoading } = useUserRoles();

  useEffect(() => {
    if (!authLoading && !rolesLoading) {
      if (!user) {
        navigate('/login');
        return;
      }
      
      if (!isAdmin) {
        navigate('/');
        return;
      }
    }
  }, [user, isAdmin, authLoading, rolesLoading, navigate]);

  // Show loading state while checking auth/admin - no flickering
  if (authLoading || rolesLoading) {
    return <RouteFallbackAdmin />;
  }

  // Only render admin content after confirming admin status - no flickering
  if (!user || !isAdmin) {
    return null; // Don't show anything, redirect is happening
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto px-4 py-8">
        <CourseManagement />
      </div>
    </div>
  );
}

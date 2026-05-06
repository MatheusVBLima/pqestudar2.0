import { Navigate } from 'react-router-dom';

import { CourseManagement } from '@/components/admin/CourseManagement';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';
import { RouteFallbackAdmin } from '@/components/layout/route-fallbacks';

export default function AdminCourses() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: rolesLoading } = useUserRoles();

  // Show loading state while checking auth/admin - no flickering
  if (authLoading || rolesLoading) {
    return <RouteFallbackAdmin />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto px-4 py-8">
        <CourseManagement />
      </div>
    </div>
  );
}

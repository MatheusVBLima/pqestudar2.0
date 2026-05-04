import { BonusManagement } from "@/components/admin/BonusManagement";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Navigate } from "react-router-dom";
import { RouteFallbackAdmin } from "@/components/layout/route-fallbacks";

const AdminBonusPages = () => {
  const { isAdmin, loading } = useUserRoles();

  // Show loading state while checking admin - no flickering
  if (loading) {
    return <RouteFallbackAdmin />;
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <BonusManagement />
    </main>
  );
};

export default AdminBonusPages;

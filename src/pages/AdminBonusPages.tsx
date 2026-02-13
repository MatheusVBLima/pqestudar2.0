import { BonusManagement } from "@/components/admin/BonusManagement";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Navigate } from "react-router-dom";

const AdminBonusPages = () => {
  const { isAdmin, loading } = useUserRoles();

  // Show loading state while checking admin - no flickering
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
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

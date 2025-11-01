import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BonusManagement } from "@/components/admin/BonusManagement";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Navigate } from "react-router-dom";

const AdminBonusPages = () => {
  const { isAdmin, loading } = useUserRoles();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <BonusManagement />
      </main>
      <Footer />
    </div>
  );
};

export default AdminBonusPages;

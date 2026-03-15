import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { adminSidebarData } from "@/components/dashboard/layout/admin-sidebar-data";

const AdminDashboard = () => {
  return (
    <DashboardLayout title="Build Your Application" section="Data Fetching" data={adminSidebarData}>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </DashboardLayout>
  );
};

export default AdminDashboard;

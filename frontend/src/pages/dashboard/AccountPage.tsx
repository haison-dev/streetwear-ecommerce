import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { adminSidebarData } from "@/components/dashboard/layout/admin-sidebar-data";
import { staffSidebarData } from "@/components/dashboard/layout/staff-sidebar-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { MailIcon, ShieldIcon, UserIcon } from "lucide-react";
import { useLocation } from "react-router-dom";

const AccountPage = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const roleNames = (user?.roleNames ?? user?.roles ?? []).map((role) =>
    String(role).toLowerCase()
  );
  const isStaffRoute = location.pathname.includes("/staff/");
  const isStaff = isStaffRoute || roleNames.includes("staff");
  const sidebarData = isStaff ? staffSidebarData : adminSidebarData;

  const displayName = user?.displayName ?? user?.email ?? "User";
  const email = user?.email ?? "";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DashboardLayout title="Account" section="Profile" data={sidebarData}>
      <div className="p-4 md:p-6">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="text-xl">Account</CardTitle>
            <CardDescription>
              Manage your profile information and account status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-12 rounded-lg">
                <AvatarFallback className="rounded-lg">{initials || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{displayName}</p>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border p-3 text-sm">
                <p className="mb-1 flex items-center gap-2 font-medium">
                  <UserIcon className="size-4" />
                  Profile Name
                </p>
                <p className="text-muted-foreground">{displayName}</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-sm">
                <p className="mb-1 flex items-center gap-2 font-medium">
                  <MailIcon className="size-4" />
                  Email Address
                </p>
                <p className="text-muted-foreground">{email || "Not available"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldIcon className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Role:</span>
              <Badge variant="outline">{isStaff ? "Staff" : "Admin"}</Badge>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" type="button">
              Edit profile
            </Button>
            <Button type="button">Save changes</Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AccountPage;

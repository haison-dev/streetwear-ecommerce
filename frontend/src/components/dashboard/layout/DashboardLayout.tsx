import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import type { SidebarData } from "@/components/sidebar/app-sidebar";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

interface Props {
  title: string;
  section: string;
  data: SidebarData;
  children?: React.ReactNode;
}

const DashboardLayout = ({ title, section, data, children }: Props) => {
  return (
    <SidebarProvider>
      <AppSidebar data={data} />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild><Link to="/dashboard">{title}</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{section}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-1 text-xs font-semibold hover:underline">
            Storefront <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </header>
        <div className="flex flex-1 flex-col gap-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;

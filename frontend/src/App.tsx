import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/Cart";
import MyOrdersPage from "./pages/MyOrders";
import DashboardGate from "./pages/dashboard/DashboardGate";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import StorefrontLayout from "./components/layout/StorefrontLayout";
import Wishlist from "./pages/Wishlist";
import OrderDetail from "./pages/OrderDetail";

const queryClient = new QueryClient();
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const StaffDashboard = lazy(() => import("./pages/dashboard/StaffDashboard"));
const AccountPage = lazy(() => import("./pages/dashboard/AccountPage"));

const DashboardLoading = () => <p className="store-container py-12" role="status">Loading dashboard…</p>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<StorefrontLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="register" element={<Register />} />
            <Route path="product/:slug" element={<ProductDetail />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="account/wishlist" element={<Wishlist />} />
            <Route path="account/orders" element={<MyOrdersPage />} />
            <Route path="account/orders/:orderId" element={<OrderDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/dashboard" element={<DashboardGate />} />
          <Route
            path="/dashboard/admin/*"
            element={
              <ProtectedRoute allowRoles={["admin"]}>
                  <Suspense fallback={<DashboardLoading />}><AdminDashboard /></Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff"
            element={
              <ProtectedRoute allowRoles={["staff"]}>
                  <Suspense fallback={<DashboardLoading />}><StaffDashboard /></Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/account"
            element={
              <ProtectedRoute allowRoles={["admin"]}>
                  <Suspense fallback={<DashboardLoading />}><AccountPage /></Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/account"
            element={
              <ProtectedRoute allowRoles={["staff"]}>
                  <Suspense fallback={<DashboardLoading />}><AccountPage /></Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

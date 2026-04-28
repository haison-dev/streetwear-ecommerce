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
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import StaffDashboard from "./pages/dashboard/StaffDashboard";
import DashboardGate from "./pages/dashboard/DashboardGate";
import AccountPage from "./pages/dashboard/AccountPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/account/orders"
            element={
              <ProtectedRoute>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<DashboardGate />} />
          <Route
            path="/dashboard/admin/*"
            element={
              <ProtectedRoute allowRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff"
            element={
              <ProtectedRoute allowRoles={["staff"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/account"
            element={
              <ProtectedRoute allowRoles={["admin"]}>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/account"
            element={
              <ProtectedRoute allowRoles={["staff"]}>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import LoginPanel from "@/components/auth/LoginPanel";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function StorefrontLayout() {
  const [loginOpen, setLoginOpen] = useState(false);
  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a href="#store-content" className="sr-only focus:not-sr-only focus:fixed focus:z-[70] focus:bg-primary focus:p-3">
        Skip to content
      </a>
      <Navbar onLogin={openLogin} />
      <main id="store-content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
        <Outlet context={{ openLogin }} />
      </main>
      <Footer />
      <LoginPanel open={loginOpen} onClose={closeLogin} />
    </div>
  );
}

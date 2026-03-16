import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { getRoleNames } from "@/lib/roles";
import googleLogo from "@/assets/google-logo.webp";

interface Props {
  open: boolean;
  onClose: () => void;
}

const LoginPanel = ({ open, onClose }: Props) => {
  if (typeof document === "undefined") return null;

  const navigate = useNavigate();
  const { login, loading, token, user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!token || !open) return;
    const roleNames = Array.isArray(user?.roleNames) && user.roleNames.length
      ? user.roleNames.map((r) => String(r).toLowerCase())
      : getRoleNames(user?.roles);
    if (roleNames.includes("admin")) {
      navigate("/dashboard/admin", { replace: true });
    } else if (roleNames.includes("staff")) {
      navigate("/dashboard/staff", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
    onClose();
  }, [token, user, open, onClose, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px]"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4 }}
            className="absolute right-0 top-0 h-full w-full max-w-[480px] bg-white text-foreground shadow-2xl border-l border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-border">
              <h3 className="font-display text-xl tracking-wide">Identification</h3>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
              <div className="space-y-4">
                <p className="font-body text-sm text-muted-foreground uppercase">
                  I already have an account
                </p>
                <button
                  type="button"
                  className="w-full h-11 rounded-full border border-border font-body text-sm hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                >
                  <img src={googleLogo} alt="" className="w-4 h-4" />
                  Sign in with Google
                </button>
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="font-body text-xs text-muted-foreground uppercase">or</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
              </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Login</label>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-4 rounded-md border border-border bg-background font-body text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Password</label>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 px-4 rounded-md border border-border bg-background font-body text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-full bg-foreground text-background font-body text-sm tracking-wider hover:bg-foreground/90 transition-colors disabled:opacity-60"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                  <button
                    type="button"
                    className="font-body text-xs underline text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                <p className="font-body text-sm text-muted-foreground uppercase ">
                  I don't have an account
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  Enjoy added benefits and a richer experience by creating a personal account.
                </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/register");
                    }}
                    className="w-full h-11 rounded-full border border-border font-body text-sm hover:bg-secondary transition-colors"
                  >
                    Create my account
                  </button>
                </div>
            </form>
          </motion.div>
      </motion.div>
    )}
  </AnimatePresence>,
  document.body
);
};

export default LoginPanel;

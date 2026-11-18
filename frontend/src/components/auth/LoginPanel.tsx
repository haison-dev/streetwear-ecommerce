import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/useAuthStore";
import { getRoleNames } from "@/lib/roles";

export default function LoginPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { login, loading, token, user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!token || !open) return;
    const roles = user?.roleNames?.length ? user.roleNames.map((role) => role.toLowerCase()) : getRoleNames(user?.roles);
    if (roles.includes("admin")) navigate("/dashboard/admin", { replace: true });
    else if (roles.includes("staff")) navigate("/dashboard/staff", { replace: true });
    onClose();
  }, [token, user, open, onClose, navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login(email.trim(), password);
  }

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <SheetContent className="z-[60] w-full max-w-full overflow-y-auto sm:max-w-[460px]">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle className="font-display text-3xl">Sign in.</SheetTitle>
          <SheetDescription>Access your bag, saved items and orders.</SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="space-y-4 p-6">
          <label className="grid gap-1 text-sm font-semibold">
            Email or username
            <input className="store-field" type="text" autoComplete="username" autoCapitalize="none" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Password
            <input className="store-field" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="store-action w-full" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
          <p className="border-t border-border pt-4 text-sm">New to Crownline? <Link to="/register" className="font-semibold underline underline-offset-4" onClick={onClose}>Create an account</Link></p>
        </form>
      </SheetContent>
    </Sheet>
  );
}

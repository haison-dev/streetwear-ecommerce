import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { EyeIcon } from "lucide-react"
import { useAuthStore } from "@/stores/useAuthStore"
import { getRoleNames } from "@/lib/roles"
import googleLogo from "@/assets/google-logo.webp"
import Footer from "@/components/layout/Footer"

const Register = () => {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const loading = useAuthStore((state) => state.loading)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email || !password || !firstName || !lastName) return

    await register(email, password, firstName, lastName, phone || undefined)

    const { token, user } = useAuthStore.getState()
    if (!token || !user) return

    const roleNames = Array.isArray(user.roleNames) && user.roleNames.length
      ? user.roleNames.map((role) => String(role).toLowerCase())
      : getRoleNames(user.roles)

    if (roleNames.includes("admin")) {
      navigate("/dashboard/admin", { replace: true })
      return
    }

    if (roleNames.includes("staff")) {
      navigate("/dashboard/staff", { replace: true })
      return
    }

    navigate("/", { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-foreground">
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-12 md:px-12">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className="font-display text-3xl tracking-wide md:text-4xl">Create Your Account</h1>
          <Link to="/" className="text-sm underline underline-offset-4 hover:opacity-70">
            Back to Home
          </Link>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/60 p-5 md:p-8">
          <button
            type="button"
            className="mb-6 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-medium transition-colors hover:bg-secondary"
          >
            <img src={googleLogo} alt="Google" className="size-4" />
            Sign In With Google
          </button>

          <p className="mb-2 text-sm text-muted-foreground">
            Create your account to have access to a personalized experience.
          </p>
          <p className="mb-8 text-sm">
            Already have an account?{" "}
            <Link to="/" className="underline underline-offset-4">
              Log in here.
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email*</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">First Name*</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password*</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 w-full rounded-md border border-border bg-background px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                    required
                  />
                  <EyeIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name*</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                  placeholder="xxx.xxx.xxxx"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-full bg-foreground px-8 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create my account"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Register

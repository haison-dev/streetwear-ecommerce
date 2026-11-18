import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/useAuthStore"
import { getRoleNames } from "@/lib/roles"
import { useStorefront } from "@/hooks/useStorefront"

const Register = () => {
  const navigate = useNavigate()
  const { openLogin } = useStorefront()
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
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-28 md:px-12">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className="store-title">Create Your Account</h1>
          <Link to="/" className="text-sm underline underline-offset-4 hover:opacity-70">
            Back to Home
          </Link>
        </div>

        <div className="store-panel p-5 md:p-8">
<p className="mb-2 text-sm text-muted-foreground">
            Create your account to have access to a personalized experience.
          </p>
          <p className="mb-8 text-sm">
            Already have an account?{" "}
            <button type="button" className="underline underline-offset-4" onClick={openLogin}>Sign in</button>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="register-email" className="text-sm font-medium">Email*</label>
                <input id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="store-field"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="register-firstName" className="text-sm font-medium">First Name*</label>
                <input id="register-firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="store-field"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="register-password" className="text-sm font-medium">Password*</label>
                <div className="relative">
                  <input id="register-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="store-field"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="register-lastName" className="text-sm font-medium">Last Name*</label>
                <input id="register-lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="store-field"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="register-phone" className="text-sm font-medium">Phone Number</label>
                <input id="register-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="store-field"
                  placeholder="xxx.xxx.xxxx"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="store-action disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create my account"}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  )
}

export default Register

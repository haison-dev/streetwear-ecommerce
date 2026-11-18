import { Link } from "react-router-dom";

const groups = [
  { title: "Shop", links: [{ label: "All products", to: "/shop" }, { label: "The 3D rack", to: "/" }] },
  { title: "Account", links: [{ label: "Saved items", to: "/account/wishlist" }, { label: "My orders", to: "/account/orders" }, { label: "Shopping bag", to: "/cart" }] },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="store-container grid gap-8 py-10 sm:grid-cols-[2fr_1fr_1fr]">
        <Link to="/" className="w-fit font-brand text-4xl tracking-wide">CROWNLINE</Link>
        {groups.map(({ title, links }) => (
          <nav key={title} aria-label={title} className="space-y-3">
            <h2 className="store-label">{title}</h2>
            <ul className="space-y-2 text-sm">
              {links.map(({ label, to }) => (
                <li key={to}><Link className="hover:underline underline-offset-4" to={to}>{label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}

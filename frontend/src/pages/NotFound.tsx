import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="store-container py-32">
      <p className="store-label mb-4">404</p>
      <h1 className="store-title mb-6">Page not found.</h1>
      <Link to="/" className="store-action">Return to home</Link>
    </section>
  );
}

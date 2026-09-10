import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-32 text-center">
      <div className="font-mono text-7xl font-bold text-ink/10">404</div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink">Page not found</h1>
      <p className="mt-3 max-w-md text-ink-soft">
        The page you're looking for doesn't exist — maybe it was never funded into existence.
      </p>
      <Link to="/" className="btn-primary mt-8">Back home</Link>
    </div>
  );
}
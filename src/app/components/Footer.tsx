export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="px-8 py-4">
        <p className="text-center text-xs text-muted">
          © {new Date().getFullYear()} MyApp. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

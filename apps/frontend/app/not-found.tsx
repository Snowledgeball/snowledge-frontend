import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
        color: "#1e293b",
      }}
    >
      <h1 style={{ fontSize: "5rem", fontWeight: 800, marginBottom: "1rem" }}>
        404
      </h1>
      <h2 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "1.5rem" }}>
        Page non trouvée
      </h2>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem", color: "#64748b" }}>
        Oups, la page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        style={{
          padding: "0.75rem 2rem",
          background: "#2563eb",
          color: "white",
          borderRadius: "0.5rem",
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
          transition: "background 0.2s",
        }}
      >
        Revenir à l&apos;accueil
      </Link>
    </div>
  );
}

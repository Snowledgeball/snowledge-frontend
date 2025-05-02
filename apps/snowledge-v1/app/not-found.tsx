import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 text-4xl font-bold">404</h1>
      <p className="mb-6 text-xl">Page non trouvée</p>
      <p className="mb-8">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}

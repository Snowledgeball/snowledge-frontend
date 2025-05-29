import { toast } from "sonner";

export async function fetcher(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, { credentials: "include", ...init });

  if (res.status === 401) {
    // Optionnel : message
    toast.error("Votre session a expiré, veuillez vous reconnecter.", {
      position: "top-center",
    });
    // Redirection
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 4000);
    }
    // On retourne une promesse qui ne résout jamais pour stopper le flow
    return new Promise(() => {});
  }

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

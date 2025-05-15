export function toSlug(name: string): string {
  return name
    .normalize("NFD") // retire les accents
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-") // remplace tout ce qui n'est pas lettre ou chiffre par un tiret
    .replace(/^-+|-+$/g, "") // retire les tirets en début/fin
    .replace(/--+/g, "-") // évite les doubles tirets
    .toLowerCase();
}

export function fromSlug(slug: string): string {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

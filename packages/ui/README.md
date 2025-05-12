# UI – Librairie de composants partagés

> **Note :** Tous les pro blocks sont actuellement dans `apps/frontend/pro-blocks`. Tous les composants ne sont donc pas encore installés dans le package `ui`. Pour mutualiser un composant, il faut qu'il soit dans ce package en suivant la démarche ci-dessous.

## Organisation des composants

- Les **composants shadcn-ui** doivent être ajoutés dans le dossier `components/shadcn/`.
- Les **autres composants personnalisés** peuvent être organisés dans des dossiers dédiés sous `components/` (ex : `components/monComposantPerso/`).
- **N'oublie pas d'exporter chaque composant** dans le fichier `index.ts` à la racine du package pour qu'il soit accessible dans les apps du monorepo.

## Organisation des exports (bonne pratique)

Pour garder une structure propre et scalable, chaque sous-dossier de composants (ex : `shadcn`, `community-components`, etc.) possède son propre fichier `index.ts` (ou `index.tsx`) qui exporte ses composants. Le fichier `index.ts` à la racine du package réexporte simplement les sous-dossiers.

### Exemple d'organisation

```
components/
  shadcn/
    button.tsx
    aspect-ratio.tsx
    index.tsx
  community-components/
    CardCommunity.tsx
    index.tsx
index.ts
```

- `components/shadcn/index.tsx` :

  ```ts
  export { Button } from "./button";
  export { AspectRatio } from "./aspect-ratio";
  ```

- `components/community-components/index.tsx` :

  ```ts
  export { CardCommunity } from "./CardCommunity";
  ```

- `index.ts` (à la racine du package) :
  ```ts
  export * from "./components/shadcn";
  export * from "./components/community-components";
  ```

### Utilisation dans une app du monorepo

Tu peux alors importer les composants mutualisés de façon simple, sans te soucier du sous-dossier :

```tsx
import { Button, AspectRatio, CardCommunity } from "ui";
```

## Ajouter un composant personnalisé

1. Crée un dossier pour ton composant dans `components/` (ex : `components/MonComposant/MonComposant.tsx`).
2. Crée un fichier `index.ts` dans ce dossier et exporte ton composant :
   ```ts
   export { MonComposant } from "./MonComposant";
   ```
3. Dans le fichier `index.ts` à la racine du package, réexporte le dossier :
   ```ts
   export * from "./components/MonComposant";
   ```
4. Dans une app du monorepo, importe-le simplement :
   ```tsx
   import { MonComposant } from "ui";
   ```

## Ajouter un composant shadcn-ui

1. Place-toi dans le dossier du package ui :
   ```bash
   cd packages/ui
   ```
2. Lance la commande shadcn pour ajouter le composant :
   ```bash
   npx shadcn-ui@latest add nom-composant
   ```
   (Le composant sera automatiquement ajouté dans `components/shadcn/`)
3. Exporte-le dans `index.ts` comme ci-dessus.
4. Utilise-le dans tes apps avec :
   ```tsx
   import { NomComposant } from "ui";
   ```

---

**Astuce :**

- Tous les composants partagés doivent être exportés dans `index.ts` pour être accessibles dans les apps du monorepo.
- Pour mutualiser le style (ex : Tailwind), assure-toi que la config de l'app inclut bien le chemin du package ui.

**Avantages de cette organisation :**

- Le fichier d'exports principal (`index.ts`) reste minimal et lisible.
- Chaque dossier gère ses propres exports, ce qui facilite la maintenance.
- Tu ajoutes/supprimes des composants sans toucher à un gros fichier central.

**À retenir :**

- Chaque nouveau composant doit être exporté dans l'`index.ts` de son dossier.
- Le fichier `index.ts` à la racine du package doit réexporter tous les sous-dossiers nécessaires.
- Les imports dans les apps restent inchangés, ce qui simplifie la migration et l'utilisation des composants partagés.

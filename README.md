# Mercato — Frontend

Application React (Vite) pour GesVente : caisse, catalogue produits avec QR code, stock et gestion d'équipe pour des boutiques multi-magasins. Installable en PWA sur mobile. Consomme l'API décrite dans le README du dépôt backend **GesVente** (dépôt séparé).

Pour la vue d'ensemble du projet (les deux rôles, les deux apps) voir [docs/PROJET.md](docs/PROJET.md). Ce document couvre uniquement le frontend : comment il est organisé et comment chaque écran fonctionne.

## Stack

React 19 + TypeScript, Vite 6, Tailwind CSS v4, Framer Motion (`motion/react`), `vite-plugin-pwa`. Pas de state manager externe : tout passe par deux contextes React (`AuthContext`, `ShopContext`) + des hooks de données par domaine. **Aucun routing par URL** — `react-router` est en dépendance mais inutilisé ; toute la navigation se fait via un état interne (`activeTab` dans `App.tsx`), donc l'app entière vit sur `/`.

## Démarrage

```bash
npm install
npm run dev      # http://localhost:3000 (accessible aussi via l'IP LAN pour tester sur mobile)
npm run build    # build de production
npm run lint     # tsc --noEmit
npm run preview  # sert le build de production
```

Le backend (dépôt séparé **GesVente**) doit tourner sur le port 3001. Aucune configuration n'est requise en local : `lib/apiClient.ts` déduit l'hôte de l'API à partir de celui de la page (`window.location.hostname`), donc `localhost:3000` parle à `localhost:3001`, et `192.168.x.x:3000` (accès mobile) parle à `192.168.x.x:3001` automatiquement. Ne définir `VITE_API_BASE_URL` (voir `.env.example`) que pour un déploiement où frontend et backend sont sur des domaines différents.

## Comment l'app démarre (`App.tsx`)

```
AuthProvider
  └─ ShopProvider
       └─ status === 'unauthenticated' ? <AuthView />  (écran de connexion, plein écran)
                                        : <AppShell />  (sidebar + header + vue active)
       └─ <InstallPwaPrompt />  (bannière d'installation PWA, toujours montée)
```

`AuthContext` hydrate la session au montage (`GET /auth/me` si un token existe déjà en `localStorage`). `ShopContext` charge les boutiques de l'utilisateur dès qu'il est authentifié et garde la boutique active en mémoire (`currentShop`). Tant qu'il n'a aucune boutique, `AppShell` affiche un écran "créer votre première boutique" à la place de la sidebar.

`AppShell` gère la navigation via un simple `activeTab: ActiveTab` (`'dashboard' | 'products' | 'pos' | 'sales' | 'stock' | 'settings'`) et rend la vue correspondante — pas de route, pas d'historique de navigateur.

## Les vues (`components/views/`)

| Vue | Rôle minimum | Rôle |
|---|---|---|
| `AuthView` | public | Connexion (mise en avant) + inscription discrète (lien secondaire, uniquement pour créer un compte **propriétaire**). Fond noir/or, cohérent avec l'identité de marque. |
| `DashboardView` | tout membre | Chiffres clés de la boutique active (ventes, CA, stock bas) via `GET /shops/:id/stats`. Boutons d'action (ajouter produit, réassort) masqués si `!canManage`. |
| `ProductsView` | tout membre | Catalogue (cartes produits), création/édition réservées à `canManage`. |
| `PosView` | tout membre | Caisse : construit une vente `DRAFT`, ajoute des lignes (recherche ou scan QR via `QrScannerModal`), valide l'encaissement. |
| `SalesView` | tout membre | Historique des ventes, filtrable par statut ; ouvre `SaleDetailModal`. |
| `StockView` | tout membre | Niveaux de stock, alertes stock bas ; colonne d'ajustement masquée si `!canManage`. |
| `SettingsView` | tout membre (contenu réduit pour CASHIER) | Identité de la boutique (nom/adresse/GPS/zone, modifiable par le propriétaire uniquement — `<fieldset disabled={!isOwner}>`) + `TeamSection`. **N'apparaît pas du tout dans la sidebar pour un CASHIER** (rien d'utile pour lui). |

## Gestion des rôles côté UI (`hooks/useShopRole.ts`)

```ts
const { isOwner, effectiveRole, canManage } = useShopRole()
```

- `isOwner` : synchrone, `currentShop.ownerId === user.id`.
- `effectiveRole` : `'OWNER' | 'ADMIN' | 'MANAGER' | 'CASHIER' | undefined` — pour un non-propriétaire, résolu de façon asynchrone via `GET /shops/:id/members` (cherche sa propre ligne). `undefined` tant que la requête n'a pas répondu.
- `canManage` : `true` pour OWNER/ADMIN/MANAGER.

Ce hook est appelé au niveau de `App.tsx` puis les résultats sont passés en props (`canManage`, `effectiveRole`, `isOwner`) à `Header`, `Sidebar`, `DashboardView`, `StockView`, etc., qui les utilisent pour masquer boutons/onglets. **C'est un confort d'affichage uniquement** — l'application réelle des permissions reste côté backend ; un appel forcé depuis la console renverrait `403`.

Points concrets gérés ainsi :
- `Sidebar` retire l'onglet "Paramètres" si `effectiveRole === 'CASHIER'`, et le bloc "+ Nouvelle Boutique" si `!isOwner`.
- `Header` fait pareil pour ses deux propres raccourcis de création de boutique (menu rapide + sélecteur de boutique), et affiche un badge de rôle à côté de l'avatar.
- `TeamSection` limite le sélecteur de rôle à "Caissier" pour un gérant (pas d'option "Gérant" dans son propre formulaire d'ajout).

## Équipe (`components/settings/TeamSection.tsx`)

Formulaire "Nom complet + Email + Rôle" → `POST /shops/:id/members`. Si le compte n'existait pas encore côté serveur, la réponse contient `temporaryPassword` : affiché une seule fois dans une bannière noire/or avec bouton "Copier", à transmettre à la personne. Voir [docs/PROJET.md](docs/PROJET.md#comment-un-compte-de-chaque-rôle-est-créé) pour le détail du mécanisme.

## Couche données (`lib/`)

- `apiClient.ts` : wrapper `fetch`. Ajoute `Authorization: Bearer`, retente une fois sur `401` via `/auth/refresh`, sinon déconnecte. `apiRequestBlob` pour les réponses binaires (image QR).
- `authClient.ts` / `authStorage.ts` : login/register/logout/me, tokens en `localStorage`.
- `resources/*.ts` : un fichier par ressource API (`shops`, `categories`, `products`, `stock`, `sales`, `members`, `zones`) — chacun n'exporte que de simples fonctions typées qui appellent `apiRequest`, pas de logique.
- `hooks/useShopCatalog.ts` / `useShopSales.ts` : chargent et recomposent les données d'une boutique (ex. fusion produits + stock côté client en `ProductWithStock`) pour éviter de dupliquer cette logique dans chaque vue.

## PWA

Voir [docs/PROJET.md](docs/PROJET.md#pwa-installation-mobile). Config dans `vite.config.ts` (`VitePWA`) : manifeste `name`/`icons`/`theme_color` (`#FFD43B`, or) / `background_color` (`#171717`, noir). `components/ui/InstallPwaPrompt.tsx` gère la bannière (Android via `beforeinstallprompt`, iOS via instruction manuelle "Ajouter à l'écran d'accueil" — iOS Safari ignore le manifeste).

## Structure

```
src/app/
  App.tsx                  point d'entrée : providers + navigation par état + shell
  types.ts                 types partagés, miroir des DTO backend
  context/
    AuthContext.tsx         session (login/register/logout/me), hydrate au montage
    ShopContext.tsx          boutiques de l'utilisateur + boutique active
  hooks/
    useShopRole.ts           isOwner / effectiveRole / canManage (voir plus haut)
    useShopCatalog.ts         catégories + produits + stock d'une boutique
    useShopSales.ts           ventes d'une boutique
  lib/
    apiClient.ts, authClient.ts, authStorage.ts
    resources/                un fichier par ressource API
  components/
    layout/                  Header, Sidebar, MobileBottomNav, CommandPalette (Cmd+K)
    views/                   les 7 écrans listés plus haut
    modals/                  AddProductModal, ProductDetailModal, PrintQrModal,
                              ReplenishModal (ajuster stock), SaleDetailModal,
                              CreateStoreModal, QrScannerModal (caméra + jsQR)
    settings/                TeamSection
    ui/                      composants génériques (shadcn/ui) + InstallPwaPrompt
                              + GoldenStageBackground (décor animé de AuthView)
  utils/formatters.ts        formatCurrency, getStatusBadge, etc.
```

## Déploiement (Render)

`render.yaml` à la racine décrit un site statique : Render Dashboard → **New** → **Blueprint**, pointer sur ce dépôt.

### La seule variable à fournir

`VITE_API_BASE_URL` = l'URL publique de l'API, **sans slash final**. Pour le déploiement actuel : `https://backend-lskt.onrender.com`.

Elle n'est pas un secret — Vite l'inline dans le bundle public — donc `render.yaml` la porte directement, sans saisie au déploiement.

Deux choses à savoir sur elle :

- **Elle est inlinée au build, pas lue à l'exécution.** Vite remplace `import.meta.env.VITE_API_BASE_URL` par sa valeur littérale dans le bundle. La modifier dans le dashboard n'a aucun effet tant qu'on n'a pas relancé un déploiement — un simple restart ne suffit pas.
- **Elle finit dans du JavaScript public.** Aucune variable `VITE_*` n'est un secret : n'y mettre que ce qui peut être lu par n'importe quel visiteur.

Sans elle, `lib/apiClient.ts` se rabat sur `<hôte-de-la-page>:3001` — utile en dev pour joindre l'API depuis un téléphone du réseau local, inutilisable sur Render qui n'expose que le port 443.

### Côté backend, en miroir

Le backend n'autorise que les origines listées dans son `CORS_ORIGINS`. Après le premier déploiement du frontend, y reporter son URL (`https://<ce-service>.onrender.com`, sans slash final), sinon le navigateur bloque chaque appel — l'app se charge mais reste vide, sans erreur visible côté serveur.

Les deux services se pointent donc mutuellement : c'est normal de déployer une première fois, récupérer les URL, puis compléter les deux variables.

### Ce que le blueprint règle d'autre

- `npm ci --include=dev` : `vite` et `@vitejs/plugin-react` sont des devDependencies ; sans ce drapeau un `NODE_ENV=production` les ferait sauter et le build échouerait.
- Un *rewrite* `/*` → `/index.html`. L'app ne fait aucun routing par URL, mais ça évite un 404 sur un rechargement profond ou un raccourci PWA pointant ailleurs que sur `/`.
- `Cache-Control: no-store` sur `sw.js` et `registerSW.js`. C'est le point non évident de la PWA : `registerType: 'autoUpdate'` ne peut pas mettre à jour l'app si le navigateur sert un ancien service worker depuis son cache HTTP. Sans cet en-tête, des visiteurs restent bloqués sur une version périmée après un déploiement.

## Limites connues

- Pas de route `/admin` : aucune interface pour les endpoints `/admin/*` du backend (voir [docs/PROJET.md](docs/PROJET.md#limites-connues--pas-encore-fait)).
- Sur mobile, le bouton "Plus" de la barre de navigation basse ouvre la palette de commandes (recherche), pas un menu complet — "Paramètres" n'est donc pas atteignable depuis le bas de l'écran sur mobile pour l'instant.

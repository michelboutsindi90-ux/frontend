# Mercato / GesVente

SaaS de gestion de boutiques multi-magasins : catalogue produits avec QR code, stock, caisse (ventes), équipe, et une console plateforme pour les opérateurs du SaaS. Le projet est réparti sur **deux dépôts séparés** :

- **GesVente (backend)** — dépôt `gesvente-backend` : API NestJS + Prisma + PostgreSQL. C'est la source de vérité de toute la logique métier et des permissions.
- **Mercato (frontend)** — dépôt `mercato-frontend` (ce dépôt) : application React (Vite) qui consomme cette API, installable en PWA sur mobile.

Ce document donne une vue d'ensemble du projet et **détaille chaque rôle**. Pour la référence complète de l'API (chaque endpoint, exemples de requêtes/réponses réels), voir le `README.md` du dépôt **gesvente-backend**.

## Sommaire

- [Stack technique](#stack-technique)
- [Démarrage rapide](#démarrage-rapide)
- [Les rôles](#les-rôles)
  - [Comment un compte de chaque rôle est créé](#comment-un-compte-de-chaque-rôle-est-créé)
  - [Ce que chaque rôle voit dans l'interface](#ce-que-chaque-rôle-voit-dans-linterface)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Structure des deux dépôts](#structure-des-deux-dépôts)
- [Variables d'environnement](#variables-denvironnement)
- [PWA (installation mobile)](#pwa-installation-mobile)
- [Tests](#tests)
- [Limites connues / pas encore fait](#limites-connues--pas-encore-fait)

## Stack technique

| | Backend (GesVente) | Frontend (Mercato) |
|---|---|---|
| Langage | TypeScript | TypeScript |
| Framework | NestJS 11 | React 19 + Vite 6 |
| Style | — | Tailwind CSS v4 |
| Données | Prisma 7 + PostgreSQL 16 (Docker) | — (tout vient de l'API) |
| Auth | JWT (access + refresh, rotation), argon2 | Tokens stockés en `localStorage`, contexte React |
| Autres | class-validator, helmet, Jest, Newman/Postman | Framer Motion, vite-plugin-pwa |

L'app frontend n'utilise **aucun routing par URL** (react-router est en dépendance mais inutilisé) — toute la navigation se fait via un état interne (`activeTab`), donc tout vit sur `/`.

## Démarrage rapide

```bash
# 1) Backend — dans le dépôt gesvente-backend
cd gesvente-backend
npm install
docker compose up -d postgres        # PostgreSQL sur le port 5433
cp .env.example .env                 # ajuster les secrets si besoin
npx prisma migrate deploy
npm run seed:admin                   # crée le compte ADMIN par défaut (voir plus bas)
npm run start:dev                    # API sur http://localhost:3001

# 2) Frontend (autre terminal) — dans le dépôt mercato-frontend
cd mercato-frontend
npm install
npm run dev                          # App sur http://localhost:3000
```

Le frontend détecte automatiquement l'hôte de l'API à partir de l'URL de la page (`window.location.hostname`) — ça fonctionne donc aussi bien en local (`localhost`) que depuis un téléphone sur le même réseau (`http://<ip-lan>:3000`), sans configuration supplémentaire. Voir [Variables d'environnement](#variables-denvironnement).

## Les rôles

Il y a **quatre rôles**, strictement appliqués côté backend (`RolesGuard` / `ShopRolesGuard` / `ShopAccessGuard`) — le frontend ne fait qu'adapter l'affichage en fonction, il ne remplace jamais ce contrôle.

| Rôle | Portée | Résumé |
|---|---|---|
| **ADMIN** | Toute la plateforme | Les opérateurs du SaaS (vous). Voit/gère tous les utilisateurs et toutes les boutiques, stats globales. |
| **OWNER** (Propriétaire) | Ses propres boutiques | Un commerçant. Crée ses boutiques, gère tout dessus (catalogue, stock, équipe, ventes). |
| **MANAGER** (Gérant) | Une boutique précise | Bras droit du propriétaire sur une boutique : gère catalogue/stock/ventes, et peut lui-même ajouter des caissiers. |
| **CASHIER** (Caissier) | Une boutique précise | Vend en caisse uniquement. Lecture seule sur catalogue/stock, pas de gestion d'équipe. |

### Comment un compte de chaque rôle est créé

C'est le point le plus important à retenir, il structure toute l'app :

- **ADMIN** : jamais via l'inscription publique. Créé/promu par le script `npm run seed:admin` (backend), à partir des variables `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_FULL_NAME` du `.env`. Idempotent (relançable). Un ADMIN peut aussi promouvoir un autre compte via `PATCH /admin/users/:id`.
- **OWNER** : **seul rôle accessible par auto-inscription** (écran de connexion, lien discret "Créer un compte"). `POST /auth/register` attribue toujours `OWNER` — aucun champ de rôle n'est exposé dans ce formulaire.
- **MANAGER** et **CASHIER** : **jamais d'auto-inscription**. Créés uniquement depuis l'interface, dans Paramètres de la boutique → section **Équipe** :
  - Le propriétaire peut y ajouter un gérant ou un caissier.
  - Un gérant peut y ajouter **uniquement** un caissier (jamais un autre gérant, jamais toucher au propriétaire).
  - Si l'email saisi correspond à un compte déjà existant, il est simplement rattaché à la boutique.
  - **S'il n'existe pas encore, le compte est créé sur-le-champ** (nom + email suffisent) avec un mot de passe généré par le serveur, affiché **une seule fois** à l'écran (bannière noire/or avec bouton "Copier") — à transmettre directement à la personne concernée. Elle peut se connecter immédiatement.

### Ce que chaque rôle voit dans l'interface

Il n'y a **pas d'écrans séparés par rôle** — une seule interface (le "shell" avec sidebar + header) s'adapte dynamiquement selon `useShopRole()` (`frontend/src/app/hooks/useShopRole.ts`) :

| Élément | ADMIN / OWNER | MANAGER | CASHIER |
|---|---|---|---|
| Onglet **Paramètres** (sidebar) | ✅ | ✅ | ❌ masqué (rien d'utile pour lui) |
| **"+ Nouvelle Boutique"** (sidebar, header) | ✅ (OWNER seulement — un manager/cashier n'est jamais propriétaire d'une nouvelle boutique) | ❌ | ❌ |
| Identité de la boutique (nom, adresse, GPS, zone) dans Paramètres | ✅ modifiable | 🔒 lecture seule (grisé) | (page masquée) |
| Section **Équipe** (Paramètres) | ✅ tous rôles | ✅ (CASHIER uniquement) | (page masquée) |
| Créer/éditer produits, catégories | ✅ | ✅ | 🔒 lecture seule |
| Ajuster le stock | ✅ | ✅ | 🔒 lecture seule |
| Encaisser une vente (Caisse) | ✅ | ✅ | ✅ |
| Rembourser une vente | ✅ | ✅ | ❌ |
| Badge de rôle affiché (menu profil, header) | "Propriétaire" / "Administrateur" | "Gérant" | "Caissier" |

Le gérant est donc un rôle "combiné" : il vend comme un caissier **et** gère le catalogue/stock/équipe. Ce gating est un confort UX côté frontend — l'application réelle des permissions reste toujours côté backend (un appel API forcé depuis la console renverrait `403` de toute façon).

**Pas encore fait** : la console `/admin` (interface dédiée aux ADMIN de la plateforme) n'a pas encore d'écran frontend — voir [Limites connues](#limites-connues--pas-encore-fait).

## Fonctionnalités principales

- **Catalogue & QR code** : chaque produit a un QR code signé (HMAC serveur) imprimable en étiquette (taille et quantité par page configurables à l'impression). Scanner relit toujours le produit en direct en base (jamais de données figées dans le code).
- **Anti-fraude géographique** : si la boutique a des coordonnées GPS enregistrées, un scan trop éloigné (formule de Haversine, seuil configurable) est rejeté et journalisé.
- **Stock** : mouvements typés (RESTOCK / ADJUSTMENT / RETURN / SALE), alerte de stock bas configurable par produit.
- **Caisse (ventes)** : cycle DRAFT → lignes → VALIDATED, idempotent (rejouer la création avec la même clé ne duplique rien), remboursement avec restauration du stock.
- **Équipe** : voir [rôles](#les-rôles) ci-dessus.
- **PWA** : installable sur mobile, aucun mode hors-ligne (tout passe par le réseau) — voir [PWA](#pwa-installation-mobile).
- **Zones** : regroupement géographique nommé pour les boutiques (simple `name`/`description`, indépendant du rayon anti-fraude qui lui utilise les coordonnées GPS).

## Structure des deux dépôts

```
backend/                  API NestJS ("GesVente")
  src/
    auth/                 inscription, connexion, JWT, guards globaux
    users/                accès Prisma aux utilisateurs
    zones/                CRUD zones géographiques
    shops/
      members/            gestion de l'équipe par boutique (création de compte à la volée)
      categories/
      products/           catalogue + QR code + anti-fraude géo
      stock/              ajustements et mouvements
      sales/              cycle de vente complet
      stats/              statistiques par boutique / multi-boutiques
      guards/             ShopAccessGuard, ShopRolesGuard
    admin/                module plateforme (users/shops/customers/stats) — API prête, UI absente
    prisma/               service Prisma partagé
    config/               configuration + validation des variables d'env
  scripts/seed-admin.ts   création/promotion du compte ADMIN par défaut
  prisma/schema.prisma    modèle de données complet
  postman/                collection Postman + exemples de réponses réelles
  test/                   tests e2e

frontend/                 App React ("Mercato")
  src/app/
    components/
      layout/             Header, Sidebar, MobileBottomNav, CommandPalette
      views/              Dashboard, Products, Pos (caisse), Sales, Stock, Settings, Auth
      modals/             Add/Detail produit, impression QR, création boutique, etc.
      settings/           TeamSection (gestion d'équipe)
      ui/                 composants génériques (shadcn/ui) + InstallPwaPrompt
    context/              AuthContext, ShopContext
    hooks/                useShopRole, useShopCatalog, useShopSales
    lib/
      apiClient.ts        wrapper fetch (base URL dynamique, retry sur 401)
      authClient.ts, authStorage.ts
      resources/          un fichier par ressource API (shops, products, sales, members, ...)
    types.ts              types partagés (miroir des DTO backend)
```

## Variables d'environnement

**`backend/.env`** (voir `backend/.env.example`) :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secrets JWT (à changer en prod) |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Durées de vie des tokens |
| `QR_HMAC_SECRET` | Signature des QR codes produits |
| `QR_SCAN_MAX_DISTANCE_METERS` | Rayon anti-fraude géo (500m par défaut) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_FULL_NAME` | Compte ADMIN par défaut (`npm run seed:admin`) |
| `CORS_ORIGINS` | Origines autorisées, séparées par virgule (inclure l'IP LAN pour tester depuis un mobile) |

**`frontend/.env`** (voir `frontend/.env.example`) :

| Variable | Rôle |
|---|---|
| `VITE_API_BASE_URL` | À laisser **vide** en dev (l'app déduit l'hôte de l'API depuis celui de la page) — à définir uniquement si frontend et backend sont sur des domaines différents (déploiement) |

## PWA (installation mobile)

L'app est installable (`vite-plugin-pwa`, manifeste + icônes). Points clés :

- **Aucun mode hors-ligne** — l'app a besoin du réseau pour fonctionner (choix assumé, pas de cache de données).
- Couleurs : fond de démarrage/splash **noir** (`background_color: #171717`), couleur de la barre de navigation système **or** (`theme_color: #FFD43B`), cohérent avec l'identité "Mercato Prestige".
- Une bannière d'installation (`InstallPwaPrompt`) apparaît automatiquement (Android/Chrome via `beforeinstallprompt` ; iOS Safari avec une instruction manuelle "Partager → Sur l'écran d'accueil", ignorée sinon car iOS ne supporte pas l'installation automatique).

## Tests

```bash
cd backend
npm test              # unitaires (Jest)
npm run test:e2e      # end-to-end (Jest + Supertest, contre une vraie base)
npm run test:postman  # collection Postman complète (Newman)

cd frontend
npm run lint          # tsc --noEmit
```

## Limites connues / pas encore fait

- **Console `/admin` (interface plateforme)** : l'API backend est complète (`/admin/users`, `/admin/shops`, `/admin/customers`, `/admin/stats`), mais il n'existe **aucune interface frontend** pour ça, ni de route `/admin` — l'app n'a d'ailleurs aucun routing par URL actuellement (react-router est présent en dépendance mais inutilisé). À construire.
- **Mobile** : le bouton "Plus" de la barre de navigation basse ouvre la palette de commandes (recherche), pas un menu complet — "Paramètres" n'est donc pas atteignable depuis le bas de l'écran sur mobile pour l'instant.
- **Suppression d'un utilisateur (admin)** : bloquée (409) si l'utilisateur possède encore des boutiques ou a des ventes enregistrées — dans ce cas, désactiver (`isActive: false`) plutôt que supprimer.

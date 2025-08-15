# Remix Recipes

A small Remix + Prisma + Tailwind starter app for creating, favoriting, and planning recipes.

This README explains what the project is, how to set it up locally, how the major features work (including the optimistic "Favorites" UI), and common troubleshooting steps.

---

## Table of contents

- [What is this](#what-is-this)  
- [Features](#features)  
- [Requirements](#requirements)  
- [Quick start (local dev)](#quick-start-local-dev)  
- [Environment variables](#environment-variables)  
- [Database & Prisma (migrations)](#database--prisma-migrations)  
- [Key implementation notes & snippets](#key-implementation-notes--snippets)  
  - [File uploads](#file-uploads)  
  - [Favorites (many-to-many) + Optimistic UI](#favorites-many-to-many--optimistic-ui)  
  - [Meal planner (JSON storage)](#meal-planner-json-storage)  
- [API routes & UI integration patterns](#api-routes--ui-integration-patterns)  
- [Common scripts](#common-scripts)  
- [Troubleshooting & common fixes](#troubleshooting--common-fixes)  
- [Design decisions](#design-decisions)  
- [Deployment notes](#deployment-notes)  
- [License](#license) 

---

## What is this

**Remix Recipes** is an example application built with:

- **Remix** (React framework for server rendering + routing),
- **Prisma** as ORM (SQLite for dev),
- **Tailwind CSS** for styling,
- Simple file uploads to `public/uploads`.

It demonstrates authentication, CRUD recipes with images, a favorites system with optimistic UI, and a meal planner saved in JSON.

---

## Features

- Register / Login (session-based)
- Create / Edit / Delete recipes with image upload
- Many-to-many favorites between `User` and `Recipe`
- Optimistic UI for favorites using `useFetcher`
- Meal planner stored per-user as JSON (`MealPlan.week`)
- Tailwind-based UI with small animations

---

## Requirements

- Node.js 18+ (recommended)
- npm (or yarn/pnpm)
- `npx` available

---

## Quick start (local dev)

1. Clone repo and install:

```bash
git clone <your-repo-url>
cd remix-recipes
npm install
```

2. Add .env at the project root.
3. Apply Prisma migrations and generate client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Start dev server:

```bash
npm run dev
```

## Environment variables
Create .env with the following at minimum:
```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="replace-with-a-long-random-string"
NODE_ENV=development
```

## Database & Prisma (migrations)
A typical schema.prisma used in this project contains User, Recipe, and MealPlan:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  recipes   Recipe[]
  favorites Recipe[] @relation("Favorites")
  mealPlan  MealPlan? @relation("UserMealPlan")
}

model Recipe {
  id           String   @id @default(cuid())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  title        String
  description  String
  imageUrl     String?
  ingredients  String
  instructions String
  userId       String
  user         User     @relation(fields: [userId], references: [id])

  favoritedBy  User[]   @relation("Favorites")
}

model MealPlan {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
  week   Json
}
```
After schema changes:
```bash
npx prisma migrate dev --name <describe_change>
npx prisma generate
```
## Key implementation notes & snippets
## File uploads
Save uploaded files to public/uploads and store a string path (like /uploads/1666-photo.png) in DB.
Ensure <Form encType="multipart/form-data"> when uploading files.
Common pitfall: storing the File object or Node wrapper directly causes /uploads/[object File] in DB.
Server-side helper returns public path:
```ts
// pseudo
const saved = await saveUploadedFile(nodeFile);
const imageUrl = `/uploads/${saved.filename}`;
await db.recipe.create({ data: { title, imageUrl, ... } });
```

## Favorites (many-to-many) + Optimistic UI — full flow
Prisma schema: favoritedBy: User[] on Recipe and favorites: Recipe[] on User.
Action endpoint (example app/routes/api/favorite.tsx):
```ts
import { json } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

export async function action({ request }) {
  const userId = await requireUserId(request);
  const fd = await request.formData();
  const recipeId = fd.get("recipeId")?.toString();
  const favorited = fd.get("favorited") === "true";

  if (!recipeId) return json({ success: false, error: "Missing recipeId" }, { status: 400 });

  if (favorited) {
    await db.recipe.update({
      where: { id: recipeId },
      data: { favoritedBy: { connect: { id: userId } } },
    });
  } else {
    await db.recipe.update({
      where: { id: recipeId },
      data: { favoritedBy: { disconnect: { id: userId } } },
    });
  }

  const count = await db.recipe.count({
    where: { id: recipeId, favoritedBy: { some: {} } }, // or another query depending on schema
  });

  return json({ success: true, favorited, count });
}
```
Client: optimistic UI pattern (using useFetcher)
Use fetcher.submit() so the request does not cause navigation.
Immediately reflect the pending state using fetcher.submission:
const pending = fetcher.submission ? fetcher.submission.formData.get("favorited")==="true" : null;
Then compute the visible state: const displayed = pending !== null ? pending : fetcher.data?.favorited ?? loaderProvidedIsFavorited;
When server response arrives (fetcher.data), update to authoritative state or show an error/toast.
This gives a snappy UX while still letting the server be authoritative.

## Meal planner (JSON storage)
MealPlan.week stores a JSON object:
```json
{
  "monday": { "lunch": "recipeId1", "dinner": "recipeId2" },
  ...
}
```
UI keeps local state and posts the whole JSON (<input type="hidden" name="plan" value={JSON.stringify(plan)} />) to the action.
Server action parses JSON and upserts:
```ts
await db.mealPlan.upsert({
  where: { userId },
  create: { userId, week },
  update: { week },
});
```
## API routes & UI integration patterns
Use fetcher.Form or fetcher.submit() for actions you want to run without navigation (favorites, save planner).
Actions intended for navigation (create recipe -> redirect to /recipes/:id) can return redirect.
Always return JSON for endpoints consumed by fetcher.

## Common scripts
package.json scripts:

```json
"scripts": {
  "dev": "vite",
  "build": "remix build",
  "start": "remix-serve build",
  "prisma:migrate": "prisma migrate dev",
  "prisma:generate": "prisma generate"
}
```

## Troubleshooting & common fixes
1. /uploads/[object File] in DB
Cause: stored File object instead of path. Fix: store string path returned by upload helper.

2. Prisma error: Implicit many-to-many relation should not have references
Cause: references used on the array side. Fix: remove fields/references for array relations.

3. npx prisma generate EPERM on Windows
Cause: file locked (query engine). Fix: stop dev server, close editors, delete node_modules/.prisma/client/query_engine-*.node if needed, then npx prisma generate. Run terminal as admin if necessary.

4. 405 Method Not Allowed when using fetcher.submit
Cause: the route you POST to has no action. Fix: create action on the route you post to (or post to the route that has the action).

5. Hydration mismatches / odd characters
Cause: server and client render differ (smart quotes, em dash). Fix: use explicit characters like \u2014 or ensure the same content on server and client.

6. LiveReload conflicts with Vite
If you see LiveReload conflicts, remove Remix <LiveReload /> when running with Vite dev.

## Design decisions
Favorites: implicit many-to-many for simplicity. If we need metadata later (when favorited), convert to explicit join model.
MealPlan as JSON: quick & flexible. Good for prototyping; normalize later if you require complex queries.
Public uploads: simple static-serving from public/uploads.
Optimistic UI: useFetcher + fetcher.submission gives immediate responsiveness without navigation.

## Deployment notes
For production use Postgres or another proper DB. Set DATABASE_URL accordingly.
Use npx prisma migrate deploy in CI for production database migrations.
Build Remix (npm run build) and serve according to host (Vercel, Fly, Railway, etc.).
Ensure SESSION_SECRET is set in production env.

## License
MIT License — You are free to use, modify, and distribute this project
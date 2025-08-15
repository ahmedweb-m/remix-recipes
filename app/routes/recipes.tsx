import { Outlet } from "@remix-run/react";

export default function RecipesLayout() {
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <Outlet />
    </main>
  );
}

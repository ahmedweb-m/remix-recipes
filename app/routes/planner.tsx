// app/routes/planner.tsx
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, Form, Link } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireUserId, getUserId } from "~/utils/session.server";
import React, { useMemo, useState, useEffect } from "react";

type LoaderData = {
  user: { email: string } | null;
  recipes: { id: string; title: string; imageUrl: string | null }[];
  mealPlan: { week: Record<string, { lunch?: string; dinner?: string }> } | null;
};

export async function loader({ request }: any) {
  const userId = await requireUserId(request); // protected route — ensures user
  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } });

  const recipes = await db.recipe.findMany({
    where: { userId },
    select: { id: true, title: true, imageUrl: true },
  });

  const mealPlanRaw = await db.mealPlan.findUnique({ where: { userId } });

  const mealPlan = mealPlanRaw
    ? { week: mealPlanRaw.week as Record<string, { lunch?: string; dinner?: string }> }
    : null;

  return json<LoaderData>({ user, recipes, mealPlan });
}

/**
 * Receives JSON-stringified 'plan' field and upserts the mealPlan.
 * Returns JSON so we can use fetcher (AJAX) and show a toast without navigation.
 */
export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const fd = await request.formData();
  const planStr = fd.get("plan")?.toString() || "";

  let week: Record<string, { lunch?: string; dinner?: string }> = {};

  try {
    if (planStr) {
      const parsed = JSON.parse(planStr);
      if (typeof parsed === "object" && parsed !== null) {
        week = parsed;
      } else {
        return json({ success: false, error: "Invalid plan payload" }, { status: 400 });
      }
    }
  } catch {
    return json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  await db.mealPlan.upsert({
    where: { userId },
    create: { userId, week },
    update: { week },
  });

  return json({ success: true });
}

/* ---------------- Shared UI / styles ---------------- */

function Header({ email }: { email: string | null }) {
  return (
    <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
      <style>{`
        @keyframes floatY { 0% { transform: translateY(0) } 50% { transform: translateY(-6px)} 100% { transform: translateY(0)} }
        .animate-floatY { animation: floatY 3.6s ease-in-out infinite; }
      `}</style>

      <Link to="/" className="flex items-center gap-3 no-underline">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-yellow-400 flex items-center justify-center shadow-lg transform -rotate-12 animate-floatY">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 11a8 8 0 0116 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-rose-700">Remix Recipes</h1>
      </Link>

      <nav>
        {email ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Hi, {email}</span>
            <Form action="/logout" method="post">
              <button className="px-3 py-1 rounded-md bg-white text-rose-600 border border-rose-100">Logout</button>
            </Form>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/register" className="px-3 py-1 rounded-md bg-white text-rose-600 border border-rose-100">Register</Link>
            <Link to="/login" className="px-3 py-1 rounded-md bg-rose-600 text-white">Login</Link>
          </div>
        )}
      </nav>
    </header>
  );
}

/* ---------------- Small UI components ---------------- */

function RecipeItem({
  recipeId,
  title,
  imageUrl,
  onAddToPlan,
}: {
  recipeId: string;
  title: string;
  imageUrl: string | null;
  onAddToPlan: (recipeId: string, day: string, meal: "lunch" | "dinner") => void;
}) {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  return (
    <div className="border rounded-lg p-3 mb-3 flex gap-3 items-center bg-white shadow-sm">
      <div className="w-14 h-14 rounded overflow-hidden bg-gray-100 flex-shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-15 object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No image</div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium">{title}</span>

          <select
            aria-label={`Add ${title} to plan`}
            defaultValue=""
            onChange={(e) => {
              const val = e.currentTarget.value;
              if (!val) return;
              const [day, meal] = val.split("__");
              onAddToPlan(recipeId, day.toLowerCase(), meal as "lunch" | "dinner");
              e.currentTarget.value = "";
            }}
            className="ml-2 border rounded px-2 py-1 text-sm"
          >
            <option value="">{`Add to\u2026`}</option>
            {days.map((day) =>
              ["lunch","dinner"].map((meal) => (
                <option key={`${day}-${meal}`} value={`${day}__${meal}`}>
                  {day} {meal}
                </option>
              ))
            )}
          </select>
        </div>
      </div>
    </div>
  );
}

/** SquareSlot: square display using padding-top trick; shows image (link) or em-dash. */
function SquareSlot({
  recipeId,
  imageUrl,
  title,
  onRemove,
  day,
  meal,
}: {
  recipeId?: string;
  imageUrl?: string | null;
  title?: string | null;
  onRemove: (day: string, meal: "lunch" | "dinner") => void;
  day: string;
  meal: "lunch" | "dinner";
}) {
  return (
    <div className="relative w-full mt-2">
      <div className="w-full bg-gray-50 rounded-lg overflow-hidden border" style={{ position: "relative", paddingTop: "100%" }}>
        {recipeId && imageUrl ? (
          <Link to={`/recipes/${recipeId}`} className="absolute inset-0 block" title={title ?? "View recipe"}>
            <img src={imageUrl} alt={title ?? "Recipe image"} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute left-0 bottom-0 right-0 bg-black/30 text-white text-xs px-2 py-1">
              {title}
            </div>
          </Link>
        ) : recipeId && !imageUrl ? (
          <Link to={`/recipes/${recipeId}`} className="absolute inset-0 flex items-center justify-center text-sm text-gray-700">
            <div className="px-3 text-center">{title ?? "Recipe"}</div>
          </Link>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 select-none">
            —{/* em dash */}
          </div>
        )}

        {recipeId && (
          <button
            type="button"
            onClick={() => onRemove(day, meal)}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow"
            title="Remove from plan"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function MealPlannerPage() {
  const { user, recipes, mealPlan } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const recipeById = useMemo(() => Object.fromEntries(recipes.map((r) => [r.id, r.title])), [recipes]);
  const recipeImageById = useMemo(() => Object.fromEntries(recipes.map((r) => [r.id, r.imageUrl])), [recipes]);

  const [plan, setPlan] = useState<Record<string, { lunch?: string; dinner?: string }>>(mealPlan?.week || {});
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  useEffect(() => {
    const data = fetcher.data as any;
    if (data) {
      if (data.success) {
        setToast({ type: "success", msg: "Meal plan saved" });
        setTimeout(() => setToast(null), 2000);
      } else {
        setToast({ type: "error", msg: data.error || "Save failed" });
        setTimeout(() => setToast(null), 3000);
      }
    }
  }, [fetcher.data]);

  const addRecipe = (recipeId: string, day: string, meal: "lunch" | "dinner") => {
    const dayKey = day.toLowerCase();
    setPlan((prev) => ({
      ...prev,
      [dayKey]: { ...(prev[dayKey] || {}), [meal]: recipeId },
    }));
  };

  const removeSlot = (day: string, meal: "lunch" | "dinner") => {
    const dayKey = day.toLowerCase();
    setPlan((prev) => {
      const next = { ...(prev || {}) };
      if (!next[dayKey]) return next;
      const slot = { ...next[dayKey] };
      delete slot[meal];
      next[dayKey] = Object.keys(slot).length ? slot : {};
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <Header email={user?.email ?? null} />

      <main className="max-w-6xl mx-auto p-6">
        {/* Toast */}
        {toast && (
          <div className={`fixed right-4 top-4 z-50 rounded px-4 py-2 shadow ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
            {toast.msg}
          </div>
        )}

        <fetcher.Form method="post" className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <aside className="md:col-span-1 bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Your Recipes</h2>
            <div className="max-h-[60vh] overflow-auto pr-2">
              {recipes.map((r) => (
                <RecipeItem key={r.id} recipeId={r.id} title={r.title} imageUrl={r.imageUrl} onAddToPlan={addRecipe} />
              ))}
            </div>
          </aside>

          <div className="md:col-span-3 grid grid-cols-7 gap-4">
            {days.map((day) => {
              const dayKey = day.toLowerCase();
              const lunchId = plan[dayKey]?.lunch;
              const dinnerId = plan[dayKey]?.dinner;
              const lunchImage = lunchId ? recipeImageById[lunchId] ?? null : null;
              const dinnerImage = dinnerId ? recipeImageById[dinnerId] ?? null : null;
              const lunchTitle = lunchId ? recipeById[lunchId] ?? lunchId : null;
              const dinnerTitle = dinnerId ? recipeById[dinnerId] ?? dinnerId : null;

              return (
                <div key={day} className="bg-white p-4 rounded-lg shadow min-h-[170px]">
                  <h3 className="font-bold mb-2">{day}</h3>

                  <div className={`mb-4 ${lunchId ? "bg-green-50" : ""}`}>
                    <div className="flex items-center justify-between">
                      <strong>Lunch:</strong>
                     
                    </div>

                    <SquareSlot
                      recipeId={lunchId}
                      imageUrl={lunchImage}
                      title={lunchTitle}
                      onRemove={removeSlot}
                      day={day}
                      meal="lunch"
                    />

                    <input type="hidden" name={`${dayKey}_lunch`} value={lunchId ?? ""} />
                  </div>

                  <div className={`mb-2 ${dinnerId ? "bg-yellow-50" : ""}`}>
                    <div className="flex items-center justify-between">
                      <strong>Dinner:</strong>
                      
                    </div>

                    <SquareSlot
                      recipeId={dinnerId}
                      imageUrl={dinnerImage}
                      title={dinnerTitle}
                      onRemove={removeSlot}
                      day={day}
                      meal="dinner"
                    />

                    <input type="hidden" name={`${dayKey}_dinner`} value={dinnerId ?? ""} />
                  </div>
                </div>
              );
            })}
          </div>

          <input type="hidden" name="plan" value={JSON.stringify(plan)} />

          <div className="md:col-span-4 mt-4">
            <button type="submit" className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
              Save Meal Plan
            </button>
          </div>
        </fetcher.Form>
      </main>
    </div>
  );
}

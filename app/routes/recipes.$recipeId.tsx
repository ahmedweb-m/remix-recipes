import React from "react";
import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Outlet, useFetcher, Form } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const recipe = await db.recipe.findUnique({
    where: { id: params.recipeId },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      ingredients: true,
      instructions: true,
      userId: true,
      favoritedBy: { select: { id: true } },
      _count: { select: { favoritedBy: true } },
    },
  });

  if (!recipe) {
    throw new Response("Recipe Not Found", { status: 404 });
  }

  const userId = await getUserId(request);
  const isFavorited = !!recipe.favoritedBy.find((u) => u.id === userId);
  return json({ recipe, userId, isFavorited });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const _action = formData.get("_action");

  if (_action === "delete") {
    const userId = await requireUserId(request);

    const recipe = await db.recipe.findUnique({
      where: { id: params.recipeId },
      select: { userId: true },
    });

    if (!recipe) throw new Response("Not Found", { status: 404 });
    if (recipe.userId !== userId) throw new Response("Forbidden", { status: 403 });

    await db.recipe.delete({ where: { id: params.recipeId } });
    return redirect("/recipes");
  }

  return null;
}

export default function RecipeDetailPage() {
  const { recipe, userId, isFavorited } = useLoaderData<typeof loader>();
  const isOwner = recipe.userId === userId;
  const fetcher = useFetcher() as any;

  // pending desired state (if submission in flight)
  const pending =
    fetcher?.submission?.formData?.get("favorited") === "true"
      ? true
      : fetcher?.submission?.formData?.get("favorited") === "false"
      ? false
      : null;

  const server = (fetcher?.data || {}) as {
    success?: boolean;
    favorited?: boolean;
    count?: number;
    error?: string;
  } | undefined;

  const displayedFavorited = pending !== null ? pending : server?.favorited ?? isFavorited;
  const baseCount = recipe._count?.favoritedBy ?? 0;
  const displayedCount = pending !== null ? baseCount + (pending ? 1 : -1) : server?.count ?? baseCount;

  const [toast, setToast] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);
  React.useEffect(() => {
    if (server) {
      if (server.success) {
        setToast({ type: "success", msg: server.favorited ? "Favorited" : "Unfavorited" });
        setTimeout(() => setToast(null), 1800);
      } else if (server.error) {
        setToast({ type: "error", msg: server.error || "Action failed" });
        setTimeout(() => setToast(null), 3000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data]);

  const handleToggle = () => {
    const currently = server?.favorited ?? displayedFavorited;
    const next = !currently;

    const fd = new FormData();
    fd.append("recipeId", recipe.id);
    fd.append("favorited", String(next));
    fetcher.submit(fd, { method: "post", action: `/recipes/${recipe.id}/favorite` });
  };

  // delete modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const ingredients = recipe.ingredients ? recipe.ingredients.split(",").map((i) => i.trim()) : [];
  const instructions = recipe.instructions ? recipe.instructions.split("\n").map((s) => s.trim()) : [];

  return (
    <main className="min-h-screen bg-amber-50">
      <style>{`
        @keyframes floatY {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        .animate-floatY { animation: floatY 3.6s ease-in-out infinite; }
      `}</style>

      {/* Site header */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-rose-500 to-yellow-400 flex items-center justify-center shadow-lg transform -rotate-12">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 11a8 8 0 0116 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <Link to={"/"} className="text-2xl font-extrabold tracking-tight text-rose-700">Remix Recipes</Link>
          <h1 ></h1>
        </div>

        <nav>
          {userId ? (
            <div className="text-sm text-gray-600">You</div>
          ) : (
            <div className="flex gap-2">
              <Link to="/register" className="px-3 py-1 rounded-md bg-white text-rose-600 border border-rose-100">Register</Link>
              <Link to="/login" className="px-3 py-1 rounded-md bg-rose-600 text-white">Login</Link>
            </div>
          )}
        </nav>
      </header>

      <section className="max-w-5xl mx-auto p-6 space-y-8">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 rounded px-4 py-2 shadow ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
            {toast.msg}
          </div>
        )}

        {userId && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleToggle}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border hover:shadow transition"
              aria-pressed={displayedFavorited}
              disabled={fetcher.state === "submitting"}
              title={fetcher.state === "submitting" ? "Saving..." : undefined}
            >
              {displayedFavorited ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
              )}
              <span>{displayedFavorited ? "Favorited" : "Favorite"}</span>
            </button>

            <span className="ml-2 text-sm text-gray-600">{displayedCount} {displayedCount === 1 ? "favorite" : "favorites"}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {recipe.imageUrl ? (
            <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
              <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 italic shadow">
              No image available
            </div>
          )}

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-rose-700">{recipe.title}</h1>
            <p className="text-gray-700 text-lg">{recipe.description}</p>

            {isOwner && (
              <div className="flex gap-2">
                <Link to={`/recipes/${recipe.id}/edit`} className="inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
                  Edit Recipe
                </Link>

                <button type="button" onClick={() => setShowDeleteConfirm(true)} className="inline-block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                  Delete Recipe
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" onClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-white p-6 rounded shadow-lg w-80 text-center" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
              <p className="mb-6 text-gray-700">Are you sure you want to delete this recipe?</p>
              <div className="flex justify-around">
                <Form method="post">
                  <input type="hidden" name="_action" value="delete" />
                  <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Yes</button>
                </Form>
                <button type="button" onClick={() => setShowDeleteConfirm(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">No</button>
              </div>
            </div>
          </div>
        )}

        {/* Ingredients & Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Ingredients</h2>
            <ul className="list-disc list-inside space-y-1 bg-white p-4 rounded-lg shadow">
              {ingredients.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 bg-white p-4 rounded-lg shadow">
              {instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </section>
        </div>

        <Outlet />
      </section>
    </main>
  );
}

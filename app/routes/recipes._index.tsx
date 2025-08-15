import React, { useEffect, useRef, useState } from "react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Form, useSubmit } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import SiteHeader from "~/components/SiteHeader";


export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  const userId = session.get("userId");

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";

  const user = userId
    ? await db.user.findUnique({ where: { id: userId } })
    : null;

  const recipes = await db.recipe.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
    },
  });

  return { user, recipes, q };
}

export default function RecipesIndexPage() {
  const { user, recipes, q } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState(q);
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (formRef.current) {
        submit(formRef.current, { replace: true });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, submit]);

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

      {/* Header (site-wide style) */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-rose-500 to-yellow-400 flex items-center justify-center shadow-lg transform -rotate-12">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 11a8 8 0 0116 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <Link to={"/"} className="text-2xl font-extrabold tracking-tight text-rose-700">Remix Recipes</Link>
          
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline text-gray-600">Hi, <strong className="text-gray-900">{user.email}</strong></span>
              <Form action="/logout" method="post">
                <button className="px-3 py-1 rounded-md bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition">
                  Logout
                </button>
              </Form>
            </>
          ) : (
            <>
              <Link to="/register" className="px-3 py-1 rounded-md bg-white text-rose-600 border border-rose-100 hover:shadow-sm transition">
                Register
              </Link>
              <Link to="/login" className="px-3 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition">
                Login
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pb-12">
        {/* Page header + search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-4xl font-bold text-rose-700">Recipes</h2>
            <p className="text-gray-600 mt-1">Your collection of delicious ideas. Browse, favorite, and add your own.</p>
          </div>

          <div className="w-full md:w-1/3">
            <Form ref={formRef} method="get" className="w-full">
              <input
                type="text"
                name="q"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search recipes..."
                className="w-full border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </Form>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            {user && (
              <Link
                to="/recipes/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 shadow transition transform hover:-translate-y-0.5"
              >
                + New Recipe
              </Link>
            )}
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-full border border-gray-200 hover:shadow-sm transition text-sm"
            >
              Open Meal Planner
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((r) => (
            <Link key={r.id} to={`/recipes/${r.id}`} className="group block rounded-2xl overflow-hidden shadow hover:shadow-2xl transform hover:-translate-y-1 transition bg-white">
              <div className="relative h-48">
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt={r.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 italic">No image</div>
                )}
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-white/80 backdrop-blur text-xs font-semibold text-rose-700 animate-floatY">
                  Recipe
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-rose-700 group-hover:underline">{r.title}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{r.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

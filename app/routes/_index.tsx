// app/routes/index.tsx
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  const user = userId ? await db.user.findUnique({ where: { id: userId } }) : null;
  return json({ user });
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-rose-50">
      {/* small inline styles for a floating animation */}
      <style>
        {`
          @keyframes floatY {
            0% { transform: translateY(0px) rotate(-1deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
            100% { transform: translateY(0px) rotate(-1deg); }
          }
          .animate-floatY { animation: floatY 4s ease-in-out infinite; }
          .glass {
            background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.4));
            backdrop-filter: blur(6px);
          }
        `}
      </style>

      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-yellow-400 flex items-center justify-center shadow-lg transform -rotate-12">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 11a8 8 0 0116 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 11a4 4 0 018 0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-rose-700">Remix Recipes</h1>
        </div>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">Hi, <strong className="text-gray-900">{user.email}</strong></span>
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
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center gap-12">
        {/* Left content */}
        <div className="flex-1 space-y-6">
          <h2 className="text-5xl font-extrabold leading-tight text-rose-700">
            Cook. Share. Fall in love with food again.
          </h2>
          <p className="text-lg text-gray-600 max-w-xl">
            Remix Recipes is a cozy place to collect your favorite dishes, upload photos, and share
            your best-kept culinary secrets. Discover fast weeknight meals, soulful desserts, and creative twists
            on classics — all in one beautiful app.
          </p>

          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <li className="flex items-start gap-3">
              <div className="mt-1 w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-300 to-rose-300 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"><path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Beautiful uploads</div>
                <div className="text-sm text-gray-500">Add images, ingredient lists, and step-by-step instructions.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 w-9 h-9 rounded-lg bg-gradient-to-br from-rose-400 to-pink-300 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"><path d="M12 6v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Favorites & Planner</div>
                <div className="text-sm text-gray-500">Save favorites and plan your week’s meals in a snap.</div>
              </div>
            </li>
          </ul>

          <div className="flex items-center gap-4 mt-4">
            <Link
              to="/recipes"
              className="relative inline-flex items-center gap-3 px-6 py-3 bg-rose-600 text-white rounded-full shadow-lg transform hover:-translate-y-1 hover:scale-105 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="font-semibold">Browse Recipes</span>
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-white/20 text-white">Explore</span>
            </Link>
            {user && (
            <Link to="/recipes/new" className="hidden sm:inline-block px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:shadow-md transition">
              Add a Recipe
            </Link>
            )}
          </div>
          
        </div>

        {/* Right decorative area */}
        <div className="flex-1 relative flex items-center justify-center">
          <div className="glass p-6 rounded-2xl shadow-xl w-[360px] h-[420px] flex items-center justify-center relative overflow-hidden">
            {/* Decorative floating recipe cards */}
            <div className="absolute top-6 left-6 w-40 h-28 rounded-lg bg-white shadow-md p-3 animate-floatY" style={{ transform: 'rotate(-4deg)' }}>
              <div className="text-sm font-semibold text-rose-600 line-clamp-1">Honey Garlic Chicken</div>
              <div className="text-xs text-gray-500 mt-2">30m · Dinner</div>
            </div>

            <div className="absolute bottom-8 right-8 w-44 h-28 rounded-lg bg-white shadow-md p-3 animate-floatY" style={{ animationDelay: '0.6s', transform: 'rotate(3deg)' }}>
              <div className="text-sm font-semibold text-rose-700 line-clamp-1">Lemon Ricotta Pancakes</div>
              <div className="text-xs text-gray-500 mt-2">20m · Breakfast</div>
            </div>

            <div className="absolute top-24 right-12 w-36 h-24 rounded-lg bg-white shadow p-3 animate-floatY" style={{ animationDelay: '1.2s', transform: 'rotate(-2deg)' }}>
              <div className="text-sm font-semibold text-rose-600 line-clamp-1">Roasted Veggie Bowl</div>
              <div className="text-xs text-gray-500 mt-2">40m · Lunch</div>
            </div>

            {/* Center icon */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-rose-500 to-yellow-400 flex items-center justify-center shadow-2xl transform hover:scale-105 transition">
                <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none"><path d="M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <div className="mt-4 text-sm text-gray-500 text-center px-6">
                Your recipe collection — simple, gorgeous, and all yours.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-10 text-center text-sm text-gray-500">
        <p>Made with ❤️ — store your recipes, plan meals, and share deliciousness.</p>
        <p className="mt-2">Built with Remix + Tailwind • <span className="text-rose-600 font-medium">Remix Recipes</span></p>
      </footer>
    </main>
  );
}

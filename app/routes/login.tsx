import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData, Link } from "@remix-run/react";
import { verifyLogin } from "~/models/user.server";
import { createUserSession } from "~/utils/session.server";
import React from "react";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await verifyLogin(email, password);

  if (!user) {
    return json({ error: "Invalid email or password" }, { status: 400 });
  }

  return createUserSession(user.id, "/recipes");
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();

  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <style>{`
        @keyframes floatY {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        .animate-floatY { animation: floatY 3.6s ease-in-out infinite; }
        .btn-emboss { box-shadow: inset 0 -2px 0 rgba(0,0,0,0.06); }
      `}</style>

      <div className="w-full max-w-md">
        {/* header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-yellow-400 flex items-center justify-center shadow-lg transform -rotate-12 animate-floatY">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 11a8 8 0 0116 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <Link to={"/"} className="text-2xl font-extrabold tracking-tight text-rose-700">Remix Recipes</Link>
            
          </div>

          <nav className="text-sm">
            <Link to="/register" className="px-3 py-1 rounded-md bg-white text-rose-600 border border-rose-100">Register</Link>
          </nav>
        </header>

        {/* card */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome back</h2>
          <p className="text-sm text-gray-600 mb-6">Sign in to manage your recipes and favorites.</p>

          <Form method="post" className="space-y-4" aria-describedby={actionData?.error ? "login-error" : undefined}>
            <div>
              <label className="sr-only" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@domain.com"
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-rose-200"
                required
              />
            </div>

            <div>
              <label className="sr-only" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-rose-200"
                required
              />
            </div>

            {actionData?.error && (
              <p id="login-error" className="text-red-500 text-sm">{actionData.error}</p>
            )}

            <button
              type="submit"
              className="w-full mt-2 rounded-md bg-rose-600 text-white py-2 font-semibold hover:bg-rose-700 transition btn-emboss"
            >
              Sign in
            </button>
          </Form>

          <div className="mt-4 text-center text-sm text-gray-600">
            <span>Don’t have an account? </span>
            <Link to="/register" className="text-rose-600 font-medium">Register</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

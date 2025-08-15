import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData, Link } from "@remix-run/react";
import { createUser } from "~/models/user.server";
import { createUserSession } from "~/utils/session.server";
import React from "react";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";

  if (!email.includes("@")) {
    return json({ fieldErrors: { email: "Invalid email" } }, { status: 400 });
  }
  if (password.length < 6) {
    return json({ fieldErrors: { password: "Password must be at least 6 characters" } }, { status: 400 });
  }

  const user = await createUser(email, password);

  if (!user) {
    return json({ error: "User creation failed" }, { status: 400 });
  }

  return createUserSession(user.id, "/recipes");
}

type RegisterActionData =
  | { fieldErrors?: { email?: string; password?: string } }
  | { error?: string };

function isFieldErrors(data: RegisterActionData | undefined): data is { fieldErrors: { email?: string; password?: string } } {
  return !!data && (data as any).fieldErrors !== undefined;
}

export default function RegisterPage() {
  const actionData = useActionData<RegisterActionData>();

  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <style>{`
        @keyframes floatY {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        .animate-floatY { animation: floatY 3.6s ease-in-out infinite; }
      `}</style>

      <div className="w-full max-w-md">
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
            <Link to="/login" className="px-3 py-1 rounded-md bg-rose-600 text-white">Login</Link>
          </nav>
        </header>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Create an account</h2>
          <p className="text-sm text-gray-600 mb-6">Join and start saving your favourite recipes.</p>

          <Form method="post" className="space-y-4" aria-describedby={isFieldErrors(actionData) ? "register-errors" : undefined}>
            <div>
              <label className="sr-only" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" placeholder="you@domain.com"
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-rose-200" required />
              {actionData && isFieldErrors(actionData) && actionData.fieldErrors?.email && (
                <p id="register-errors" className="text-red-500 text-sm mt-1">{actionData.fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="sr-only" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" placeholder="Choose a password"
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-rose-200" required />
              {actionData && isFieldErrors(actionData) && actionData.fieldErrors?.password && (
                <p className="text-red-500 text-sm mt-1">{actionData.fieldErrors.password}</p>
              )}
            </div>

            {actionData && !isFieldErrors(actionData) && (actionData as { error?: string }).error && (
              <p className="text-red-500 text-sm mt-1">{(actionData as { error?: string }).error}</p>
            )}

            <button type="submit" className="w-full mt-2 rounded-md bg-rose-600 text-white py-2 font-semibold hover:bg-rose-700 transition">
              Create account
            </button>
          </Form>

          <div className="mt-4 text-center text-sm text-gray-600">
            <span>Already registered? </span>
            <Link to="/login" className="text-rose-600 font-medium">Sign in</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

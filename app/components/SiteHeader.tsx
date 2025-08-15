import React from "react";
import { Link, Form } from "@remix-run/react";

export default function SiteHeader({
  user,
  className = "",
}: {
  user?: { email?: string } | null;
  className?: string;
}) {
  return (
    <header className={`max-w-6xl mx-auto px-6 py-6 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-rose-500 to-yellow-400 flex items-center justify-center shadow-lg transform -rotate-12">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 11a8 8 0 0116 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-rose-700">Remix Recipes</h1>
        </Link>
      </div>

      <nav>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">Hi, {user.email}</span>
            <Form action="/logout" method="post">
              <button className="text-red-500 underline">Logout</button>
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

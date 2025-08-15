import React from "react";
import { redirect, json, type ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { parseMultipartForm, getFilePublicPath } from "~/utils/upload.server";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  const formData = await parseMultipartForm(request);

  const title = formData.get("title")?.toString().trim() || "";
  const description = formData.get("description")?.toString().trim() || "";
  const ingredients = formData.get("ingredients")?.toString().trim() || "";
  const instructions = formData.get("instructions")?.toString().trim() || "";
  const uploaded = formData.get("image");
  const imageUrl = getFilePublicPath(uploaded);

  if (!title || !description || !ingredients || !instructions) {
    return json({ error: "All fields except image are required" }, { status: 400 });
  }

  const recipe = await db.recipe.create({
    data: {
      title,
      description,
      imageUrl,
      ingredients: ingredients.split(",").map((i) => i.trim()).join(", "),
      instructions: instructions.split("\n").map((s) => s.trim()).join("\n"),
      user: { connect: { id: userId } },
    },
  });

  return redirect(`/recipes/${recipe.id}`);
}

export default function NewRecipePage() {
  const actionData = useActionData<typeof action>();

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

      {/* header (same look & feel as other pages) */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-rose-500 to-yellow-400 flex items-center justify-center shadow-lg transform -rotate-12">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 11a8 8 0 0116 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <Link to={"/"} className="text-2xl font-extrabold tracking-tight text-rose-700">Remix Recipes</Link>
    
        </div>
      </header>

      <section className="max-w-3xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-rose-700 mb-6">Add New Recipe</h1>

          {actionData?.error && <p className="mb-4 text-red-500 font-medium">{actionData.error}</p>}

          <Form method="post" encType="multipart/form-data" className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Title</label>
              <input name="title" type="text" className="w-full border rounded p-2 focus:ring focus:ring-rose-200" required />
            </div>

            <div>
              <label className="block font-semibold mb-1">Description</label>
              <textarea name="description" rows={3} className="w-full border rounded p-2 focus:ring focus:ring-rose-200" required />
            </div>

            <div>
              <label className="block font-semibold mb-1">Image (optional)</label>
              <input type="file" name="image" accept="image/*" className="w-full" />
            </div>

            <div>
              <label className="block font-semibold mb-1">Ingredients</label>
              <textarea name="ingredients" rows={3} placeholder="Separate items with commas" className="w-full border rounded p-2 focus:ring focus:ring-rose-200" required />
            </div>

            <div>
              <label className="block font-semibold mb-1">Instructions</label>
              <textarea name="instructions" rows={6} placeholder="Write each step on a new line" className="w-full border rounded p-2 focus:ring focus:ring-rose-200" required />
            </div>

            <button type="submit" className="w-full bg-rose-600 text-white font-semibold py-2 rounded hover:bg-rose-700 transition">
              Save Recipe
            </button>
          </Form>
        </div>
      </section>
    </main>
  );
}

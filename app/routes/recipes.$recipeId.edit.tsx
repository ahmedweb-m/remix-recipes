// app/routes/recipes.$recipeId.edit.tsx
import React from "react";
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { parseMultipartForm, getFilePublicPath } from "~/utils/upload.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);

  const recipe = await db.recipe.findUnique({ where: { id: params.recipeId } });

  if (!recipe) {
    throw new Response("Recipe Not Found", { status: 404 });
  }
  if (recipe.userId !== userId) {
    throw new Response("Not Authorized", { status: 403 });
  }
  return json({ recipe });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await parseMultipartForm(request);

  const title = formData.get("title")?.toString().trim() || "";
  const description = formData.get("description")?.toString().trim() || "";
  const ingredients = formData.get("ingredients")?.toString().trim() || "";
  const instructions = formData.get("instructions")?.toString().trim() || "";
  const uploaded = formData.get("image");
  const newImageUrl = getFilePublicPath(uploaded);

  if (!title || !description || !ingredients || !instructions) {
    return json({ error: "All fields except image are required" }, { status: 400 });
  }

  const current = await db.recipe.findUnique({ where: { id: params.recipeId }, select: { imageUrl: true } });
  if (!current) throw new Response("Recipe Not Found", { status: 404 });

  await db.recipe.update({
    where: { id: params.recipeId },
    data: {
      title,
      description,
      imageUrl: newImageUrl || current.imageUrl,
      ingredients: ingredients.split(",").map((i) => i.trim()).join(", "),
      instructions: instructions.split("\n").map((s) => s.trim()).join("\n"),
      user: { connect: { id: userId } },
    },
  });

  return redirect(`/recipes/${params.recipeId}`);
}

export default function EditRecipePage() {
  const { recipe } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <main className="min-h-screen bg-amber-50">
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

      <section className="max-w-3xl mx-auto mt-8 p-6">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-rose-700 mb-6">Edit Recipe</h1>

          {actionData?.error && <p className="mb-4 text-red-500 font-medium">{actionData.error}</p>}

          <Form method="post" encType="multipart/form-data" className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Title</label>
              <input name="title" defaultValue={recipe.title} className="w-full border rounded p-2 focus:ring focus:ring-rose-200" required />
            </div>

            <div>
              <label className="block font-semibold mb-1">Description</label>
              <textarea name="description" rows={3} defaultValue={recipe.description} className="w-full border rounded p-2 focus:ring focus:ring-rose-200" required />
            </div>

            {recipe.imageUrl && (
              <div>
                <p className="font-semibold mb-1">Current Image:</p>
                <img src={recipe.imageUrl} alt={recipe.title} className="h-40 w-auto rounded mb-2" />
              </div>
            )}

            <div>
              <label className="block font-semibold mb-1">New Image (optional)</label>
              <input type="file" name="image" accept="image/*" className="w-full" />
            </div>

            <div>
              <label className="block font-semibold mb-1">Ingredients</label>
              <textarea name="ingredients" rows={3} defaultValue={recipe.ingredients} placeholder="Separate items with commas" className="w-full border rounded p-2 focus:ring focus:ring-rose-200" required />
            </div>

            <div>
              <label className="block font-semibold mb-1">Instructions</label>
              <textarea name="instructions" rows={6} defaultValue={recipe.instructions} placeholder="Write each step on a new line" className="w-full border rounded p-2 focus:ring focus:ring-rose-200" required />
            </div>

            <button type="submit" className="w-full bg-rose-600 text-white font-semibold py-2 rounded hover:bg-rose-700 transition">
              Update Recipe
            </button>
          </Form>
        </div>
      </section>
    </main>
  );
}

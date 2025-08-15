// app/routes/api/favorite.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { db } from "~/utils/db.server";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const fd = await request.formData();

  const recipeId = fd.get("recipeId")?.toString();
  const desired = fd.get("favorited")?.toString() === "true";

  if (!recipeId) {
    return json({ success: false, error: "Missing recipeId" }, { status: 400 });
  }

  try {
    if (desired) {
      // connect favorite
      await db.recipe.update({
        where: { id: recipeId },
        data: { favoritedBy: { connect: { id: userId } } },
      });
    } else {
      // disconnect favorite
      await db.recipe.update({
        where: { id: recipeId },
        data: { favoritedBy: { disconnect: { id: userId } } },
      });
    }

    // return authoritative count & state
    const updated = await db.recipe.findUnique({
      where: { id: recipeId },
      select: { _count: { select: { favoritedBy: true } } },
    });

    const count = updated?._count.favoritedBy ?? 0;
    return json({ success: true, favorited: desired, count });
  } catch (err: any) {
    console.error("Favorite action error:", err);
    return json({ success: false, error: "Server error" }, { status: 500 });
  }
}

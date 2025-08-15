import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { getSession, storage } from "~/utils/session.server"; // 👈 import storage

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request);

  // ✅ Use `storage.destroySession()`, not `session.destroy()`
  return redirect("/recipes", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

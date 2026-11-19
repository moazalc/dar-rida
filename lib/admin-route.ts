/**
 * Where the admin lives. Not "/admin": bots scan for that. Set ADMIN_PATH in
 * .env to choose another (letters, digits and dashes). proxy.ts serves the
 * admin there and hides "/admin" itself.
 */
export function adminRoute(value = process.env.ADMIN_PATH): string {
  const path = (value ?? "").trim().replace(/^\/+|\/+$/g, "");
  return /^[a-z0-9][a-z0-9-]{2,63}$/i.test(path) && path.toLowerCase() !== "api" ? `/${path}` : "/atelier";
}

import { getAuth } from "@/lib/auth";

// Better Auth's routes: sending and checking sign-in codes, Google's
// redirect and callback, and signing out. Its own rate limits apply here.
async function handle(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}

export const GET = handle;
export const POST = handle;

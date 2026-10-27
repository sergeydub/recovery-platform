import { clerkMiddleware } from "@clerk/nextjs/server";

// Only attaches the Clerk session to each request. Access checks live next to
// the data, in lib/auth.ts, so a page or action can't be reached by a path the
// proxy didn't anticipate.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

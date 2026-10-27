import { UserButton } from "@clerk/nextjs";

// Placeholder until the app shell (step 9) replaces it with the dashboard.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <UserButton />
      <p className="text-muted-foreground text-sm">You&apos;re signed in.</p>
    </main>
  );
}

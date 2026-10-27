import { requireOrg } from "@/lib/auth";

// Placeholder until the app shell (step 9) replaces it with the dashboard.
export default async function Home() {
  const { orgRole } = await requireOrg();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-4">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <p className="text-muted-foreground text-sm">
        Your role in this organization: {orgRole}
      </p>
    </main>
  );
}

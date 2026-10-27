import { CreditCard } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { requireOrg } from "@/lib/auth";

// Placeholder until per-seat billing with Stripe.
export default async function BillingPage() {
  await requireOrg();

  return (
    <EmptyState
      icon={CreditCard}
      title="Billing is coming soon"
      description="Per-seat plans will be managed here once Stripe is connected."
    />
  );
}

import type { LucideIcon } from "lucide-react";
import { ListChecks, TriangleAlert, Users } from "lucide-react";
import { and, count, desc, eq, ne } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { auditLog, incidents, users } from "@/lib/db/schema";
import { requireTenant } from "@/lib/tenant";

export default async function DashboardPage() {
  const { organizationId, organization } = await requireTenant();

  const [[openIncidents], activity] = await Promise.all([
    db
      .select({ value: count() })
      .from(incidents)
      .where(
        and(
          eq(incidents.organizationId, organizationId),
          ne(incidents.status, "resolved"),
        ),
      ),
    db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        createdAt: auditLog.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(auditLog)
      .leftJoin(users, eq(users.id, auditLog.userId))
      .where(eq(auditLog.organizationId, organizationId))
      .orderBy(desc(auditLog.createdAt))
      .limit(10),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Dashboard"
        description={`Overview of ${organization.name}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Open incidents"
          value={openIncidents.value}
          hint="Not yet resolved"
          icon={TriangleAlert}
        />
        <StatCard
          title="Tasks due"
          value="—"
          hint="Tasks arrive in a later milestone"
          icon={ListChecks}
        />
        <StatCard
          title="Team members"
          value={organization.seatCount}
          hint="Seats in use"
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>The latest changes in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>By</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No activity yet.
                  </TableCell>
                </TableRow>
              ) : (
                activity.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.action}</TableCell>
                    <TableCell>
                      {entry.userName ?? entry.userEmail ?? "Deleted user"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {entry.createdAt.toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "UTC",
                      })}{" "}
                      UTC
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        <CardAction>
          <Icon className="size-4 text-muted-foreground" />
        </CardAction>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{hint}</CardContent>
    </Card>
  );
}

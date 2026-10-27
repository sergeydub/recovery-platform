import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ActiveSettingsTabs, SettingsTabs } from "./settings-tabs";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Settings"
        description="Your organization, its members and billing"
      />
      <Suspense fallback={<SettingsTabs pathname={null} />}>
        <ActiveSettingsTabs />
      </Suspense>
      {children}
    </div>
  );
}

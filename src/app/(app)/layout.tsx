import { BrainBackground } from "@/components/BrainBackground";
import { DayWatcher } from "@/components/DayWatcher";
import { Header } from "@/components/Header";
import { buildBrainData } from "@/lib/brainData";
import { requireUserData } from "@/lib/data";

// Every page under this layout is per-user.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { profile, submissions, reports, today, plan } = await requireUserData();
  const brain = buildBrainData(submissions, reports, today, profile.start_date, plan);
  return (
    <div className="relative min-h-dvh">
      <BrainBackground data={brain} />
      <DayWatcher startDate={profile.start_date} today={today} />
      <Header username={profile.username} day={today} />
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 sm:pb-24 sm:pt-6">{children}</main>
    </div>
  );
}

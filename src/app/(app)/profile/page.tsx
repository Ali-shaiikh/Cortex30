import type { Metadata } from "next";
import { ProfileBrain } from "@/components/ProfileBrain";
import { buildBrainData } from "@/lib/brainData";
import { requireUserData } from "@/lib/data";
import { mainSubmissions } from "@/lib/progress";

export const metadata: Metadata = { title: "Your brain" };

export default async function ProfilePage() {
  const { profile, submissions, reports, today } = await requireUserData();
  const brain = buildBrainData(submissions, reports, today, profile.start_date);
  const details = mainSubmissions(submissions).map((s) => ({ key: `${s.category}-${s.day}`, submission: s }));
  return <ProfileBrain data={brain} details={details} username={profile.username} />;
}

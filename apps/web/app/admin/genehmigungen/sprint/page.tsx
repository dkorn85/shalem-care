// /admin/genehmigungen/sprint · Vollbild-Approval-Sprint

import { GenehmigungsSprint } from "@/components/GenehmigungsSprint";
import { listePendingApprovals } from "@/lib/approval/sprint-store";

export const metadata = {
  title: "Genehmigungs-Sprint · Vollbild",
};

export const dynamic = "force-dynamic";

export default async function SprintPage() {
  const karten = await listePendingApprovals();
  return <GenehmigungsSprint initialKarten={karten} />;
}

import { AuditHunt } from "@/components/AuditHunt";
import { generiereHunt } from "@/lib/audit/hunt-faelle";

export const metadata = { title: "MD-Audit-Hunt · Lücken finden" };

export const dynamic = "force-dynamic";

export default function Page() {
  return <AuditHunt runden={generiereHunt(5)} />;
}

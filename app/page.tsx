import { HomePage } from "@/components/home-page";
import { getAllMedications } from "@/lib/medications-db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const medications = await getAllMedications();

  return <HomePage medications={medications} />;
}

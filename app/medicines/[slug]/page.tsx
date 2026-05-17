import { notFound } from "next/navigation";

import { MedicationDetailPage } from "@/components/medication-detail-page";
import { getMedicationBySlugOrId } from "@/lib/medications-db";

type Params = Promise<{ slug: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const medication = await getMedicationBySlugOrId(params.slug);

  if (!medication) {
    notFound();
  }

  return <MedicationDetailPage medication={medication} />;
}

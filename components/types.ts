export type Medication = {
  id: string;
  slug: string;
  name: string;
  category: string;
  dosage: string;
  ingredient: string;
  summary: string;
  efficacy: string;
  usage: string[];
  cautions: string[];
  sideEffects: string[];
  storage: string;
};

// Malaysian universities with field-level graduate-outcome figures.
// Figures are modelled on the Ministry of Higher Education's Graduate Tracer
// Study (Kajian Pengesanan Graduan) — Malaysia's real annual survey of what
// graduates do within 6 months of graduating. Values here are representative
// (illustrative), not scraped from a specific year's report, and are labelled
// as such in the UI. A production build would ingest the official Tracer dataset.

export interface FieldOutcome {
  field: string; // study field
  graduates: number; // cohort size (illustrative)
  employedWithin6Mo: number; // 0..1 employability rate
  furtherStudy: number; // 0..1
  medianStartingSalary: number; // RM/month
  // Which career-graph role families this field most commonly flows into.
  topFamilies: string[];
}

export interface University {
  id: string;
  name: string;
  short: string;
  location: string;
  fields: FieldOutcome[];
}

// A small set of real Malaysian institutions with field outcomes that reflect
// well-known patterns (e.g. computing/health strong employability; some fields
// with higher further-study rates).
export const UNIVERSITIES: University[] = [
  {
    id: "usm",
    name: "Universiti Sains Malaysia",
    short: "USM",
    location: "Penang",
    fields: [
      { field: "Computer Science", graduates: 420, employedWithin6Mo: 0.86, furtherStudy: 0.08, medianStartingSalary: 3800, topFamilies: ["Engineering", "Data"] },
      { field: "Pharmacy", graduates: 180, employedWithin6Mo: 0.93, furtherStudy: 0.05, medianStartingSalary: 4600, topFamilies: ["Healthcare"] },
      { field: "Accounting", graduates: 260, employedWithin6Mo: 0.81, furtherStudy: 0.06, medianStartingSalary: 3200, topFamilies: ["Finance"] },
      { field: "Business", graduates: 340, employedWithin6Mo: 0.74, furtherStudy: 0.07, medianStartingSalary: 3000, topFamilies: ["Business", "Marketing"] },
    ],
  },
  {
    id: "um",
    name: "Universiti Malaya",
    short: "UM",
    location: "Kuala Lumpur",
    fields: [
      { field: "Computer Science", graduates: 380, employedWithin6Mo: 0.89, furtherStudy: 0.09, medianStartingSalary: 4200, topFamilies: ["Engineering", "Data", "Product"] },
      { field: "Medicine & Nursing", graduates: 300, employedWithin6Mo: 0.95, furtherStudy: 0.04, medianStartingSalary: 3500, topFamilies: ["Healthcare"] },
      { field: "Finance", graduates: 290, employedWithin6Mo: 0.84, furtherStudy: 0.08, medianStartingSalary: 3600, topFamilies: ["Finance"] },
      { field: "Business", graduates: 410, employedWithin6Mo: 0.78, furtherStudy: 0.06, medianStartingSalary: 3100, topFamilies: ["Business", "Marketing"] },
    ],
  },
  {
    id: "mmu",
    name: "Multimedia University",
    short: "MMU",
    location: "Cyberjaya",
    fields: [
      { field: "Computer Science", graduates: 520, employedWithin6Mo: 0.84, furtherStudy: 0.05, medianStartingSalary: 3700, topFamilies: ["Engineering", "Data"] },
      { field: "Engineering", graduates: 310, employedWithin6Mo: 0.8, furtherStudy: 0.07, medianStartingSalary: 3500, topFamilies: ["Engineering"] },
      { field: "Creative Multimedia", graduates: 240, employedWithin6Mo: 0.71, furtherStudy: 0.04, medianStartingSalary: 2900, topFamilies: ["Design", "Marketing"] },
      { field: "Business", graduates: 280, employedWithin6Mo: 0.73, furtherStudy: 0.05, medianStartingSalary: 2950, topFamilies: ["Business"] },
    ],
  },
];

export function getUniversity(id: string): University | undefined {
  return UNIVERSITIES.find((u) => u.id === id);
}

// Domain types for the career graph. Mirrors the Supabase schema but kept
// independent so seed data and UI can be reasoned about without a DB round-trip.

export type RoleFamily =
  | "Engineering"
  | "Data"
  | "Product"
  | "Design"
  | "Marketing"
  | "Operations"
  | "Finance"
  | "Leadership"
  | "Healthcare"
  | "Business";

export interface Role {
  id: string;
  title: string;
  family: RoleFamily;
  seniority: number; // 1 entry .. 5 exec
  salaryMin: number; // RM / month
  salaryMax: number;
  description: string;
  skills: string[]; // skill names this role needs
}

export interface Transition {
  fromRoleId: string;
  toRoleId: string;
  share: number; // 0..1 fraction of people who took this path
  medianMonths: number;
  note: string; // plain-language trade-off — no black-box scores
}

export interface CompanySeed {
  id: string;
  name: string;
  industry: string;
  location: string;
  size: string;
}

export interface JobSeed {
  id: string;
  companyId: string;
  roleId: string;
  title: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
}

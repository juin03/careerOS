import { getDemandData } from "@/lib/demand-analytics";

// Open-data export: the regional skill-demand dataset as CSV.
export async function GET() {
  const data = getDemandData();

  const rows: string[] = ["region,skill,openings_with_skill,share_of_region_demand"];
  for (const r of data.regions) {
    for (const s of r.topSkills) {
      rows.push(
        `"${r.region}","${s.skill}",${s.count},${(s.share * 100).toFixed(1)}%`,
      );
    }
  }

  const csv = rows.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="career-os-skills-demand.csv"',
    },
  });
}

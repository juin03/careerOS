// One-off demo seeding: pushes the career graph + jobs to the DB and sets up
// demo accounts. Run with: node scripts/seed-demo.mjs
// Idempotency: skips rows whose title/name already exists.
import { ROLES, COMPANIES, JOBS } from "../src/lib/career-graph/seed-data.ts";

const URL = "https://apavazjyxsicaltmllqo.supabase.co";
const KEY = "sb_publishable_Mp9tTt87LcU8lqrTNxA8FA_rUXGd8xD";

async function login(e, p) {
  const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: KEY },
    body: JSON.stringify({ email: e, password: p }),
  });
  const s = await r.json();
  return { token: s.access_token, uid: s.user?.id };
}
const h = (t) => ({
  apikey: KEY,
  Authorization: `Bearer ${t}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
});

const cand = await login("candidate@careeros.demo", "demo1234");
const emp = await login("employer@careeros.demo", "demo1234");
if (!cand.token || !emp.token) {
  console.error("Could not log in demo accounts.");
  process.exit(1);
}
const T = cand.token;

// Existing rows (idempotency)
const existingRoles = await (await fetch(`${URL}/rest/v1/roles?select=id,title`, { headers: h(T) })).json();
const roleIdMap = {};
const roleByTitle = new Map(existingRoles.map((r) => [r.title, r.id]));
for (const r of ROLES) {
  if (roleByTitle.has(r.title)) { roleIdMap[r.id] = roleByTitle.get(r.title); continue; }
  const d = await (await fetch(`${URL}/rest/v1/roles`, { method: "POST", headers: h(T), body: JSON.stringify({ title: r.title, family: r.family, seniority: r.seniority, salary_min: r.salaryMin, salary_max: r.salaryMax, description: r.description }) })).json();
  roleIdMap[r.id] = d[0]?.id;
}
console.log("roles:", Object.values(roleIdMap).filter(Boolean).length);

const existingComps = await (await fetch(`${URL}/rest/v1/companies?select=id,name`, { headers: h(T) })).json();
const compIdMap = {};
const compByName = new Map(existingComps.map((c) => [c.name, c.id]));
for (const c of COMPANIES) {
  if (compByName.has(c.name)) { compIdMap[c.id] = compByName.get(c.name); continue; }
  const d = await (await fetch(`${URL}/rest/v1/companies`, { method: "POST", headers: h(T), body: JSON.stringify({ name: c.name, industry: c.industry, location: c.location, size: c.size }) })).json();
  compIdMap[c.id] = d[0]?.id;
}
console.log("companies:", Object.values(compIdMap).filter(Boolean).length);

const existingJobs = await (await fetch(`${URL}/rest/v1/jobs?select=title`, { headers: h(T) })).json();
const haveJob = new Set(existingJobs.map((j) => j.title));
let jobOk = 0;
for (const j of JOBS) {
  if (haveJob.has(j.title)) continue;
  const res = await fetch(`${URL}/rest/v1/jobs`, { method: "POST", headers: h(emp.token), body: JSON.stringify({ company_id: compIdMap[j.companyId] ?? null, role_id: roleIdMap[j.roleId] ?? null, title: j.title, location: j.location, salary_min: j.salaryMin, salary_max: j.salaryMax, description: j.description, is_active: true, posted_by: emp.uid }) });
  if (res.status === 201) jobOk++;
}
console.log("jobs added:", jobOk);

// Demo candidate profile
const sweDbId = roleIdMap["r_swe"];
await fetch(`${URL}/rest/v1/profiles?id=eq.${cand.uid}`, { method: "PATCH", headers: h(T), body: JSON.stringify({ full_name: "Aisyah Rahman", headline: "Software Engineer, 2 yrs, fintech", location: "Kuala Lumpur", university: "Universiti Malaya", current_role_id: sweDbId, findability: "open" }) });
for (const name of ["TypeScript", "React", "Node.js", "SQL", "Git"]) {
  let sk = await (await fetch(`${URL}/rest/v1/skills?name=eq.${encodeURIComponent(name)}&select=id`, { headers: h(T) })).json();
  let sid = sk[0]?.id;
  if (!sid) { const d = await (await fetch(`${URL}/rest/v1/skills`, { method: "POST", headers: h(T), body: JSON.stringify({ name }) })).json(); sid = d[0]?.id; }
  if (sid) await fetch(`${URL}/rest/v1/profile_skills`, { method: "POST", headers: { ...h(T), Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ profile_id: cand.uid, skill_id: sid, level: 4 }) });
}
// Employer company link
await fetch(`${URL}/rest/v1/profiles?id=eq.${emp.uid}`, { method: "PATCH", headers: h(emp.token), body: JSON.stringify({ full_name: "Imran (Talent, Grab)", company_id: compIdMap["c_grab"] ?? null }) });

// ── Example Quiet Signals to the demo candidate ───────────────────────────
// Realistic, specific outreach (the anti-spam value prop) from a few different
// companies. Each extra employer is its own account so the inbox shows distinct
// companies; the profile row is auto-created by the handle_new_user trigger.
async function ensureEmployer(email, fullName, companyDbId) {
  let token, uid;
  const su = await (await fetch(`${URL}/auth/v1/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: KEY },
    body: JSON.stringify({ email, password: "demo1234", data: { full_name: fullName, account_role: "employer" } }),
  })).json();
  if (su.access_token) { token = su.access_token; uid = su.user?.id; }
  else { const li = await login(email, "demo1234"); token = li.token; uid = li.uid; }
  if (!token || !uid) return null;
  // Set recruiter name + company (account_role comes from signup metadata).
  await fetch(`${URL}/rest/v1/profiles?id=eq.${uid}`, { method: "PATCH", headers: h(token), body: JSON.stringify({ full_name: fullName, company_id: companyDbId ?? null }) });
  return { token, uid };
}

const existingSignals = await (await fetch(`${URL}/rest/v1/signals?candidate_id=eq.${cand.uid}&select=id`, { headers: h(T) })).json();
if (Array.isArray(existingSignals) && existingSignals.length > 0) {
  console.log("signals already present:", existingSignals.length, "- skipping");
} else {
  let made = 0;
  // The existing Grab employer — already accepted, so it shows as "Connected".
  {
    const res = await fetch(`${URL}/rest/v1/signals`, { method: "POST", headers: h(emp.token), body: JSON.stringify({
      employer_id: emp.uid, candidate_id: cand.uid, accepted: true,
      why_you: "Aisyah, your path from Software Engineer toward senior in fintech lines up with our Payments team. You already have the core we hire for — TypeScript, React, Node.js and SQL. Let's talk.",
    }) });
    if (res.status === 201) made++;
  }
  // Other companies — pending outreach.
  const examples = [
    { email: "talent.shopee@careeros.demo", recruiter: "Wei Ling (Talent, Shopee)", companyId: "c_shopee",
      why: "Aisyah — your two years shipping React + TypeScript in fintech is exactly the profile our payments web team wants. With your Node.js background you could own features end-to-end here. Worth a chat?" },
    { email: "talent.bigpay@careeros.demo", recruiter: "Daniel (Eng Hiring, BigPay)", companyId: "c_bigpay",
      why: "We're a fintech scaling our money-movement platform, and your exact stack — React, Node.js, SQL — maps straight onto what we need. Your fintech experience means a short ramp-up. Keen to tell you more." },
    { email: "talent.carsome@careeros.demo", recruiter: "Priya (Recruiting, Carsome)", companyId: "c_carsome",
      why: "Your React and TypeScript depth stood out. We're rebuilding our checkout flow and want someone who's shipped real product in production — your trajectory fits what we're after." },
  ];
  for (const ex of examples) {
    const e = await ensureEmployer(ex.email, ex.recruiter, compIdMap[ex.companyId]);
    if (!e) { console.log("skip employer", ex.email); continue; }
    const res = await fetch(`${URL}/rest/v1/signals`, { method: "POST", headers: h(e.token), body: JSON.stringify({
      employer_id: e.uid, candidate_id: cand.uid, accepted: null, why_you: ex.why,
    }) });
    if (res.status === 201) made++;
    else console.log("signal insert failed", ex.email, res.status, await res.text());
  }
  console.log("signals added:", made);
}

console.log("demo profiles set. DONE");

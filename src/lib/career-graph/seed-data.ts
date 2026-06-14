import type { Role, Transition, CompanySeed, JobSeed } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// The Malaysian career graph (synthetic but realistic).
// Salaries are RM/month gross, reflecting Klang Valley market ranges.
// Transitions encode where people "with a given shape" realistically moved next,
// with the trade-off stated in human language — the heart of the navigation tool.
// ─────────────────────────────────────────────────────────────────────────────

export const ROLES: Role[] = [
  // Engineering
  {
    id: "r_grad_swe",
    title: "Graduate Software Engineer",
    family: "Engineering",
    seniority: 1,
    salaryMin: 3500,
    salaryMax: 5500,
    description:
      "Entry-level developer building features under guidance. The most common first stop for CS and engineering graduates.",
    skills: ["JavaScript", "Git", "SQL", "Problem Solving", "Communication"],
  },
  {
    id: "r_swe",
    title: "Software Engineer",
    family: "Engineering",
    seniority: 2,
    salaryMin: 5500,
    salaryMax: 9000,
    description:
      "Owns features end-to-end across a codebase, reviews others' work, and shapes technical decisions on a team.",
    skills: ["TypeScript", "React", "Node.js", "SQL", "System Design", "Git"],
  },
  {
    id: "r_senior_swe",
    title: "Senior Software Engineer",
    family: "Engineering",
    seniority: 3,
    salaryMin: 9000,
    salaryMax: 15000,
    description:
      "Sets technical direction, mentors engineers, and is trusted with the hardest problems on the team.",
    skills: ["System Design", "TypeScript", "Architecture", "Mentoring", "Cloud"],
  },
  {
    id: "r_eng_manager",
    title: "Engineering Manager",
    family: "Leadership",
    seniority: 4,
    salaryMin: 14000,
    salaryMax: 24000,
    description:
      "Leads a team of engineers — hiring, growth, delivery — trading hands-on coding for people leverage.",
    skills: ["People Management", "System Design", "Stakeholder Management", "Hiring", "Strategy"],
  },
  {
    id: "r_devops",
    title: "DevOps / Platform Engineer",
    family: "Engineering",
    seniority: 3,
    salaryMin: 8000,
    salaryMax: 14000,
    description:
      "Owns CI/CD, cloud infrastructure, and reliability so product teams can ship safely and fast.",
    skills: ["Cloud", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform"],
  },
  // Data
  {
    id: "r_data_analyst",
    title: "Data Analyst",
    family: "Data",
    seniority: 1,
    salaryMin: 3500,
    salaryMax: 6000,
    description:
      "Turns raw data into dashboards and answers for the business. A common entry point from many degrees.",
    skills: ["SQL", "Excel", "Data Visualization", "Statistics", "Communication"],
  },
  {
    id: "r_data_scientist",
    title: "Data Scientist",
    family: "Data",
    seniority: 3,
    salaryMin: 8000,
    salaryMax: 15000,
    description:
      "Builds models and experiments that drive decisions, bridging statistics, engineering, and the business.",
    skills: ["Python", "Statistics", "Machine Learning", "SQL", "Communication"],
  },
  {
    id: "r_ml_engineer",
    title: "Machine Learning Engineer",
    family: "Data",
    seniority: 3,
    salaryMin: 9000,
    salaryMax: 16000,
    description:
      "Productionises models — the overlap of data science and software engineering.",
    skills: ["Python", "Machine Learning", "Cloud", "System Design", "Docker"],
  },
  {
    id: "r_ai_engineer",
    title: "AI Engineer",
    family: "Data",
    seniority: 2,
    salaryMin: 6000,
    salaryMax: 13000,
    description:
      "Builds applications on top of foundation models — LLM agents, RAG pipelines, and AI automation. The fastest-growing engineering role; distinct from ML engineering in that it productionises existing models rather than training them.",
    skills: ["Python", "LLM", "RAG", "Cloud", "Prompt Engineering", "System Design"],
  },
  // Product & Design
  {
    id: "r_product_manager",
    title: "Product Manager",
    family: "Product",
    seniority: 3,
    salaryMin: 8000,
    salaryMax: 16000,
    description:
      "Decides what to build and why, balancing user needs, business goals, and engineering reality.",
    skills: ["Product Strategy", "Stakeholder Management", "Data Analysis", "Communication", "UX"],
  },
  {
    id: "r_assoc_pm",
    title: "Associate Product Manager",
    family: "Product",
    seniority: 2,
    salaryMin: 5500,
    salaryMax: 9000,
    description:
      "Learns the craft of product under a senior PM, owning smaller features and research.",
    skills: ["Communication", "Data Analysis", "UX", "Stakeholder Management"],
  },
  {
    id: "r_ux_designer",
    title: "UX/Product Designer",
    family: "Design",
    seniority: 2,
    salaryMin: 4500,
    salaryMax: 9000,
    description:
      "Designs the flows and interfaces users actually touch, grounded in research.",
    skills: ["Figma", "User Research", "Prototyping", "UX", "Communication"],
  },
  // Marketing & Ops
  {
    id: "r_marketing_exec",
    title: "Digital Marketing Executive",
    family: "Marketing",
    seniority: 1,
    salaryMin: 3000,
    salaryMax: 5000,
    description:
      "Runs campaigns across channels and learns what moves the funnel. A wide-open entry role.",
    skills: ["Content", "SEO", "Social Media", "Analytics", "Communication"],
  },
  {
    id: "r_growth_manager",
    title: "Growth Manager",
    family: "Marketing",
    seniority: 3,
    salaryMin: 7000,
    salaryMax: 13000,
    description:
      "Owns acquisition and retention metrics, blending marketing, data, and product experiments.",
    skills: ["Analytics", "Data Analysis", "Product Strategy", "SEO", "Experimentation"],
  },
  {
    id: "r_biz_analyst",
    title: "Business Analyst",
    family: "Operations",
    seniority: 2,
    salaryMin: 4500,
    salaryMax: 8000,
    description:
      "Sits between business and tech, translating needs into requirements and process improvements.",
    skills: ["SQL", "Requirements", "Communication", "Process Design", "Data Analysis"],
  },
  // Senior / leadership destinations — where the advanced roles lead next.
  {
    id: "r_principal_eng",
    title: "Principal Engineer",
    family: "Engineering",
    seniority: 4,
    salaryMin: 18000,
    salaryMax: 30000,
    description:
      "The deep technical track's summit — sets architecture across teams without managing people. For those who want impact through engineering, not headcount.",
    skills: ["Architecture", "System Design", "Mentoring", "Cloud", "Technical Strategy"],
  },
  {
    id: "r_ai_lead",
    title: "AI / ML Lead",
    family: "Data",
    seniority: 4,
    salaryMin: 16000,
    salaryMax: 28000,
    description:
      "Leads applied AI strategy and a team of ML engineers, owning what gets built and how it ships responsibly.",
    skills: ["Machine Learning", "Technical Strategy", "People Management", "Cloud", "Stakeholder Management"],
  },
  {
    id: "r_head_product",
    title: "Head of Product",
    family: "Leadership",
    seniority: 5,
    salaryMin: 22000,
    salaryMax: 40000,
    description:
      "Owns the product org and vision across multiple teams. The senior end of the product track.",
    skills: ["Product Strategy", "People Management", "Stakeholder Management", "Vision", "Data Analysis"],
  },
  {
    id: "r_director_eng",
    title: "Director of Engineering",
    family: "Leadership",
    seniority: 5,
    salaryMin: 24000,
    salaryMax: 45000,
    description:
      "Leads multiple engineering teams and managers — org design, strategy, and delivery at scale.",
    skills: ["People Management", "Strategy", "Hiring", "Stakeholder Management", "System Design"],
  },

  // ─── Finance & Accounting ────────────────────────────────────────────────
  {
    id: "r_audit_assoc",
    title: "Audit Associate",
    family: "Finance",
    seniority: 1,
    salaryMin: 3000,
    salaryMax: 4500,
    description:
      "Entry into professional accounting — auditing client financials at a firm. A common first job for accounting and finance graduates, often while pursuing ACCA/CPA.",
    skills: ["Accounting", "Excel", "Attention to Detail", "Audit", "Communication"],
  },
  {
    id: "r_accountant",
    title: "Accountant",
    family: "Finance",
    seniority: 2,
    salaryMin: 4000,
    salaryMax: 7000,
    description:
      "Owns the books for a company — reporting, reconciliation, and compliance. The backbone role of any finance function.",
    skills: ["Accounting", "Excel", "Financial Reporting", "Taxation", "Attention to Detail"],
  },
  {
    id: "r_financial_analyst",
    title: "Financial Analyst",
    family: "Finance",
    seniority: 2,
    salaryMin: 4500,
    salaryMax: 8000,
    description:
      "Turns financial data into forecasts and decisions — budgeting, modelling, and analysis for the business.",
    skills: ["Excel", "Financial Modelling", "Data Analysis", "Accounting", "Communication"],
  },
  {
    id: "r_finance_manager",
    title: "Finance Manager",
    family: "Finance",
    seniority: 3,
    salaryMin: 9000,
    salaryMax: 16000,
    description:
      "Leads the finance function — planning, controls, and the team. Trades hands-on bookkeeping for oversight and strategy.",
    skills: ["Financial Reporting", "People Management", "Financial Modelling", "Strategy", "Stakeholder Management"],
  },

  // ─── Healthcare ──────────────────────────────────────────────────────────
  {
    id: "r_staff_nurse",
    title: "Staff Nurse",
    family: "Healthcare",
    seniority: 1,
    salaryMin: 2800,
    salaryMax: 4500,
    description:
      "Frontline patient care in a hospital or clinic. The entry point for nursing graduates, with strong demand across Malaysia.",
    skills: ["Patient Care", "Clinical Skills", "Communication", "Empathy", "Attention to Detail"],
  },
  {
    id: "r_specialist_nurse",
    title: "Specialist Nurse",
    family: "Healthcare",
    seniority: 2,
    salaryMin: 4000,
    salaryMax: 7000,
    description:
      "A nurse with advanced training in a specialty (ICU, theatre, paediatrics). More responsibility, more pay, more expertise.",
    skills: ["Clinical Skills", "Patient Care", "Specialist Knowledge", "Mentoring", "Communication"],
  },
  {
    id: "r_clinical_pharmacist",
    title: "Pharmacist",
    family: "Healthcare",
    seniority: 2,
    salaryMin: 4500,
    salaryMax: 7500,
    description:
      "Dispenses and advises on medication in hospital or retail settings. A licensed, in-demand role for pharmacy graduates.",
    skills: ["Pharmacology", "Patient Care", "Attention to Detail", "Communication", "Compliance"],
  },
  {
    id: "r_health_admin",
    title: "Healthcare Administrator",
    family: "Healthcare",
    seniority: 3,
    salaryMin: 6000,
    salaryMax: 12000,
    description:
      "Runs the operations of a clinic or hospital department — staffing, budgets, and quality. Where clinical experience meets management.",
    skills: ["Operations", "People Management", "Healthcare Systems", "Stakeholder Management", "Process Design"],
  },

  // ─── Business, Sales & Marketing (broad) ─────────────────────────────────
  {
    id: "r_sales_exec",
    title: "Sales Executive",
    family: "Business",
    seniority: 1,
    salaryMin: 2800,
    salaryMax: 5000,
    description:
      "Wins and grows accounts — the revenue engine of most companies. Open to graduates of any discipline; rewards drive and people skills.",
    skills: ["Sales", "Communication", "Negotiation", "CRM", "Relationship Building"],
  },
  {
    id: "r_account_manager",
    title: "Account Manager",
    family: "Business",
    seniority: 2,
    salaryMin: 4500,
    salaryMax: 8500,
    description:
      "Owns client relationships end-to-end — retention, growth, and trust. The natural step up from sales.",
    skills: ["Relationship Building", "Negotiation", "Communication", "CRM", "Stakeholder Management"],
  },
  {
    id: "r_hr_exec",
    title: "Human Resources Executive",
    family: "Business",
    seniority: 1,
    salaryMin: 3000,
    salaryMax: 5000,
    description:
      "Supports hiring, onboarding, and people operations. A people-centric entry role open to most graduates.",
    skills: ["Recruitment", "Communication", "People Operations", "Empathy", "Process Design"],
  },
  {
    id: "r_operations_manager",
    title: "Operations Manager",
    family: "Business",
    seniority: 3,
    salaryMin: 8000,
    salaryMax: 15000,
    description:
      "Keeps the business running — processes, teams, and delivery. A broad leadership role many tracks converge into.",
    skills: ["Operations", "People Management", "Process Design", "Strategy", "Stakeholder Management"],
  },
];

export const ROLE_BY_ID = Object.fromEntries(ROLES.map((r) => [r.id, r]));

export const TRANSITIONS: Transition[] = [
  // From Graduate SWE
  {
    fromRoleId: "r_grad_swe",
    toRoleId: "r_swe",
    share: 0.62,
    medianMonths: 18,
    note: "The default path. Two years of shipping features and you're trusted to own them.",
  },
  {
    fromRoleId: "r_grad_swe",
    toRoleId: "r_data_analyst",
    share: 0.11,
    medianMonths: 14,
    note: "A sideways move for those who find they prefer questions over code. Lower ceiling early, but opens the data track.",
  },
  {
    fromRoleId: "r_grad_swe",
    toRoleId: "r_devops",
    share: 0.09,
    medianMonths: 24,
    note: "For people who gravitate to infrastructure. Strong demand, but you trade product visibility for systems depth.",
  },
  // From SWE
  {
    fromRoleId: "r_swe",
    toRoleId: "r_senior_swe",
    share: 0.55,
    medianMonths: 30,
    note: "Keep going deep. The clearest path, gated mostly by scope of impact, not years.",
  },
  {
    fromRoleId: "r_swe",
    toRoleId: "r_ml_engineer",
    share: 0.12,
    medianMonths: 24,
    note: "If you build ML fundamentals on the side, this pivot pays well — but expect to study.",
  },
  {
    fromRoleId: "r_swe",
    toRoleId: "r_assoc_pm",
    share: 0.1,
    medianMonths: 20,
    note: "Engineers who like the 'why' more than the 'how' pivot here. Expect a short-term pay plateau for a higher ceiling later.",
  },
  // From Senior SWE
  {
    fromRoleId: "r_senior_swe",
    toRoleId: "r_eng_manager",
    share: 0.38,
    medianMonths: 28,
    note: "The management fork. More leverage and pay, but you stop coding daily — not everyone is happier here.",
  },
  {
    fromRoleId: "r_senior_swe",
    toRoleId: "r_product_manager",
    share: 0.14,
    medianMonths: 24,
    note: "Deep technical PMs are rare and valuable. A real identity shift from builder to decider.",
  },
  // Data track
  {
    fromRoleId: "r_data_analyst",
    toRoleId: "r_data_scientist",
    share: 0.34,
    medianMonths: 30,
    note: "Add Python and statistics depth. The pay jump is real but the bar is genuinely higher.",
  },
  {
    fromRoleId: "r_data_analyst",
    toRoleId: "r_biz_analyst",
    share: 0.22,
    medianMonths: 18,
    note: "Toward the business side. Less modelling, more influence on decisions and process.",
  },
  {
    fromRoleId: "r_data_analyst",
    toRoleId: "r_growth_manager",
    share: 0.12,
    medianMonths: 28,
    note: "If you pair data with marketing instinct, growth roles reward it well.",
  },
  {
    fromRoleId: "r_data_scientist",
    toRoleId: "r_ml_engineer",
    share: 0.28,
    medianMonths: 22,
    note: "Lean engineering. More production ownership, slightly less open-ended research.",
  },
  {
    fromRoleId: "r_data_scientist",
    toRoleId: "r_product_manager",
    share: 0.15,
    medianMonths: 26,
    note: "Data PMs translate models into product bets. A strong, less-crowded route to product.",
  },
  // Product & design
  {
    fromRoleId: "r_assoc_pm",
    toRoleId: "r_product_manager",
    share: 0.58,
    medianMonths: 22,
    note: "The expected promotion once you've shipped a few things that mattered.",
  },
  {
    fromRoleId: "r_ux_designer",
    toRoleId: "r_product_manager",
    share: 0.19,
    medianMonths: 30,
    note: "Designers who love the strategy side cross over. Your user empathy becomes a real edge.",
  },
  {
    fromRoleId: "r_ux_designer",
    toRoleId: "r_growth_manager",
    share: 0.08,
    medianMonths: 28,
    note: "A rarer pivot for designers drawn to metrics and experimentation.",
  },
  // Marketing & ops
  {
    fromRoleId: "r_marketing_exec",
    toRoleId: "r_growth_manager",
    share: 0.31,
    medianMonths: 30,
    note: "Grow from running campaigns to owning the whole funnel and a budget.",
  },
  {
    fromRoleId: "r_marketing_exec",
    toRoleId: "r_assoc_pm",
    share: 0.09,
    medianMonths: 26,
    note: "Marketers close to the product sometimes cross into PM. Expect to prove analytical chops.",
  },
  {
    fromRoleId: "r_biz_analyst",
    toRoleId: "r_product_manager",
    share: 0.24,
    medianMonths: 28,
    note: "BAs already live between business and tech — PM is a natural next identity.",
  },
  {
    fromRoleId: "r_biz_analyst",
    toRoleId: "r_data_scientist",
    share: 0.1,
    medianMonths: 32,
    note: "Possible with serious upskilling in statistics and Python. The longest of the BA pivots.",
  },
  {
    fromRoleId: "r_growth_manager",
    toRoleId: "r_product_manager",
    share: 0.21,
    medianMonths: 24,
    note: "Growth and product blur at the senior end. A common consolidation of the two.",
  },
  // ── AI Engineer paths (into and out of) ──────────────────────────────────
  {
    fromRoleId: "r_swe",
    toRoleId: "r_ai_engineer",
    share: 0.14,
    medianMonths: 18,
    note: "The hottest pivot right now — software engineers who pick up LLMs, RAG, and agents move fast into AI engineering.",
  },
  {
    fromRoleId: "r_grad_swe",
    toRoleId: "r_ai_engineer",
    share: 0.08,
    medianMonths: 20,
    note: "Increasingly a first destination for grads who build with foundation models early.",
  },
  {
    fromRoleId: "r_ai_engineer",
    toRoleId: "r_senior_swe",
    share: 0.26,
    medianMonths: 24,
    note: "Broaden back into senior engineering with AI as a deep specialty — a strong, well-paid generalist path.",
  },
  {
    fromRoleId: "r_ai_engineer",
    toRoleId: "r_ml_engineer",
    share: 0.22,
    medianMonths: 24,
    note: "Go deeper into the modelling side — training and fine-tuning, not just building on top of models. Expect to study the maths.",
  },
  {
    fromRoleId: "r_ai_engineer",
    toRoleId: "r_ai_lead",
    share: 0.18,
    medianMonths: 30,
    note: "Lead an applied-AI team. More architecture and direction, still close to the technology.",
  },
  {
    fromRoleId: "r_ai_engineer",
    toRoleId: "r_product_manager",
    share: 0.1,
    medianMonths: 28,
    note: "AI PMs who can speak both languages are rare and valuable. A real shift from building to deciding.",
  },
  // ── Paths out of the senior roles (so no role is a dead end) ──────────────
  // ML Engineer
  {
    fromRoleId: "r_ml_engineer",
    toRoleId: "r_ai_lead",
    share: 0.34,
    medianMonths: 30,
    note: "Lead the ML team. More strategy and people, less hands-on modelling — a real identity shift.",
  },
  {
    fromRoleId: "r_ml_engineer",
    toRoleId: "r_principal_eng",
    share: 0.18,
    medianMonths: 36,
    note: "Stay deeply technical but widen scope across systems. For those who'd rather architect than manage.",
  },
  {
    fromRoleId: "r_ml_engineer",
    toRoleId: "r_product_manager",
    share: 0.12,
    medianMonths: 28,
    note: "AI PMs who can speak both languages are rare and valuable. Expect to trade code for decisions.",
  },
  // Senior SWE → Principal (deep track alternative to management)
  {
    fromRoleId: "r_senior_swe",
    toRoleId: "r_principal_eng",
    share: 0.22,
    medianMonths: 36,
    note: "The individual-contributor summit. Broader architectural impact without managing people.",
  },
  // Engineering Manager
  {
    fromRoleId: "r_eng_manager",
    toRoleId: "r_director_eng",
    share: 0.4,
    medianMonths: 36,
    note: "Lead managers, not just engineers. More org strategy, further from the code.",
  },
  {
    fromRoleId: "r_eng_manager",
    toRoleId: "r_head_product",
    share: 0.08,
    medianMonths: 40,
    note: "A rarer cross into product leadership for EMs who love the 'what' and 'why'.",
  },
  // DevOps
  {
    fromRoleId: "r_devops",
    toRoleId: "r_principal_eng",
    share: 0.2,
    medianMonths: 36,
    note: "Grow from platform owner to setting technical direction across the org.",
  },
  {
    fromRoleId: "r_devops",
    toRoleId: "r_senior_swe",
    share: 0.14,
    medianMonths: 24,
    note: "Move back toward product engineering with hard-won infra depth as an edge.",
  },
  {
    fromRoleId: "r_devops",
    toRoleId: "r_ml_engineer",
    share: 0.1,
    medianMonths: 30,
    note: "MLOps is a natural bridge — your infra skills plus ML fundamentals open this door.",
  },
  // Product Manager
  {
    fromRoleId: "r_product_manager",
    toRoleId: "r_head_product",
    share: 0.32,
    medianMonths: 40,
    note: "Step up from owning a product to owning the product org and vision.",
  },
  {
    fromRoleId: "r_product_manager",
    toRoleId: "r_growth_manager",
    share: 0.09,
    medianMonths: 22,
    note: "Lean into the metrics side. A lateral move for PMs energised by experiments and funnels.",
  },
  // AI Lead → Director (keeps senior roles flowing too)
  {
    fromRoleId: "r_ai_lead",
    toRoleId: "r_director_eng",
    share: 0.25,
    medianMonths: 36,
    note: "Broaden from AI to all of engineering leadership.",
  },
  {
    fromRoleId: "r_principal_eng",
    toRoleId: "r_director_eng",
    share: 0.15,
    medianMonths: 36,
    note: "Cross from the IC track to leading the org — only if you find you want the people side after all.",
  },

  // ─── Finance & Accounting ────────────────────────────────────────────────
  {
    fromRoleId: "r_audit_assoc",
    toRoleId: "r_accountant",
    share: 0.48,
    medianMonths: 24,
    note: "The classic move once you've cleared exams — from auditing others' books to owning a company's.",
  },
  {
    fromRoleId: "r_audit_assoc",
    toRoleId: "r_financial_analyst",
    share: 0.22,
    medianMonths: 24,
    note: "Toward analysis and forecasting. More forward-looking than audit, and a step toward corporate finance.",
  },
  {
    fromRoleId: "r_accountant",
    toRoleId: "r_finance_manager",
    share: 0.4,
    medianMonths: 36,
    note: "Step up to leading the function. Less day-to-day bookkeeping, more planning and people.",
  },
  {
    fromRoleId: "r_financial_analyst",
    toRoleId: "r_finance_manager",
    share: 0.35,
    medianMonths: 30,
    note: "From individual analysis to owning the numbers and the team.",
  },
  {
    fromRoleId: "r_financial_analyst",
    toRoleId: "r_data_analyst",
    share: 0.12,
    medianMonths: 18,
    note: "A pivot into data for finance folk who enjoy the analytics more than the accounting.",
  },
  {
    fromRoleId: "r_finance_manager",
    toRoleId: "r_operations_manager",
    share: 0.15,
    medianMonths: 30,
    note: "Broaden from finance into running operations — a path toward general management.",
  },

  // ─── Healthcare ──────────────────────────────────────────────────────────
  {
    fromRoleId: "r_staff_nurse",
    toRoleId: "r_specialist_nurse",
    share: 0.45,
    medianMonths: 36,
    note: "Specialise (ICU, theatre, paeds). More expertise and pay — the main growth path in nursing.",
  },
  {
    fromRoleId: "r_staff_nurse",
    toRoleId: "r_health_admin",
    share: 0.14,
    medianMonths: 48,
    note: "Move from bedside to running the department. Trades clinical work for management.",
  },
  {
    fromRoleId: "r_specialist_nurse",
    toRoleId: "r_health_admin",
    share: 0.25,
    medianMonths: 42,
    note: "Lead a unit or department, bringing deep clinical credibility to management.",
  },
  {
    fromRoleId: "r_clinical_pharmacist",
    toRoleId: "r_health_admin",
    share: 0.16,
    medianMonths: 48,
    note: "Pharmacists who enjoy systems move into healthcare operations and leadership.",
  },

  // ─── Business, Sales & Marketing ─────────────────────────────────────────
  {
    fromRoleId: "r_sales_exec",
    toRoleId: "r_account_manager",
    share: 0.42,
    medianMonths: 24,
    note: "Grow from chasing new deals to owning and expanding key accounts.",
  },
  {
    fromRoleId: "r_sales_exec",
    toRoleId: "r_growth_manager",
    share: 0.1,
    medianMonths: 30,
    note: "For sellers drawn to the data and marketing side of revenue.",
  },
  {
    fromRoleId: "r_account_manager",
    toRoleId: "r_operations_manager",
    share: 0.2,
    medianMonths: 36,
    note: "Move from owning accounts to owning how the business delivers.",
  },
  {
    fromRoleId: "r_account_manager",
    toRoleId: "r_product_manager",
    share: 0.12,
    medianMonths: 30,
    note: "Customer-facing AMs who know the product deeply sometimes cross into PM.",
  },
  {
    fromRoleId: "r_hr_exec",
    toRoleId: "r_operations_manager",
    share: 0.18,
    medianMonths: 36,
    note: "From people operations to running operations broadly.",
  },
  {
    fromRoleId: "r_hr_exec",
    toRoleId: "r_biz_analyst",
    share: 0.1,
    medianMonths: 24,
    note: "HR folk who enjoy data and process pivot into business analysis.",
  },
  {
    fromRoleId: "r_operations_manager",
    toRoleId: "r_director_eng",
    share: 0.05,
    medianMonths: 48,
    note: "A rare jump for ops leaders in tech companies who grow toward org leadership.",
  },
];

export const COMPANIES: CompanySeed[] = [
  { id: "c_grab", name: "Grab", industry: "Tech / Super-app", location: "Kuala Lumpur", size: "5000+" },
  { id: "c_maybank", name: "Maybank", industry: "Banking", location: "Kuala Lumpur", size: "5000+" },
  { id: "c_shopee", name: "Shopee", industry: "E-commerce", location: "Kuala Lumpur", size: "5000+" },
  { id: "c_petronas", name: "Petronas Digital", industry: "Energy / Tech", location: "Kuala Lumpur", size: "5000+" },
  { id: "c_axiata", name: "Axiata", industry: "Telco", location: "Petaling Jaya", size: "5000+" },
  { id: "c_carsome", name: "Carsome", industry: "Automotive / Tech", location: "Petaling Jaya", size: "1001-5000" },
  { id: "c_bigpay", name: "BigPay", industry: "Fintech", location: "Kuala Lumpur", size: "201-500" },
  { id: "c_aerodyne", name: "Aerodyne", industry: "Drone Tech", location: "Cyberjaya", size: "501-1000" },
  { id: "c_kfit", name: "ClassPass APAC", industry: "Consumer Tech", location: "Kuala Lumpur", size: "201-500" },
  { id: "c_setel", name: "Setel", industry: "Fintech / Energy", location: "Kuala Lumpur", size: "201-500" },
  { id: "c_kpmg", name: "KPMG Malaysia", industry: "Professional Services", location: "Kuala Lumpur", size: "1001-5000" },
  { id: "c_kpj", name: "KPJ Healthcare", industry: "Healthcare", location: "Petaling Jaya", size: "5000+" },
  { id: "c_nestle", name: "Nestlé Malaysia", industry: "FMCG", location: "Petaling Jaya", size: "5000+" },
];

// Jobs are generated to cover most roles so the matching + listings feel alive.
export const JOBS: JobSeed[] = [
  {
    id: "j_grab_swe",
    companyId: "c_grab",
    roleId: "r_swe",
    title: "Software Engineer, Mobility",
    location: "Kuala Lumpur",
    salaryMin: 6500,
    salaryMax: 9500,
    description:
      "Join the team that moves millions of rides a day. You'll own services end-to-end in a TypeScript/Go stack and ship to production weekly.",
  },
  {
    id: "j_shopee_grad",
    companyId: "c_shopee",
    roleId: "r_grad_swe",
    title: "Graduate Software Engineer (2026 intake)",
    location: "Kuala Lumpur",
    salaryMin: 4000,
    salaryMax: 5500,
    description:
      "A structured graduate programme with rotation, mentorship, and real production work from month one. Fresh grads welcome.",
  },
  {
    id: "j_maybank_da",
    companyId: "c_maybank",
    roleId: "r_data_analyst",
    title: "Data Analyst, Group Risk",
    location: "Kuala Lumpur",
    salaryMin: 4200,
    salaryMax: 6500,
    description:
      "Turn risk data into dashboards that the C-suite actually reads. SQL-heavy, with room to grow toward data science.",
  },
  {
    id: "j_carsome_ds",
    companyId: "c_carsome",
    roleId: "r_data_scientist",
    title: "Data Scientist, Pricing",
    location: "Petaling Jaya",
    salaryMin: 9000,
    salaryMax: 14000,
    description:
      "Build the models that price every car on the platform. Python, experimentation, and direct business impact.",
  },
  {
    id: "j_bigpay_pm",
    companyId: "c_bigpay",
    roleId: "r_product_manager",
    title: "Product Manager, Payments",
    location: "Kuala Lumpur",
    salaryMin: 10000,
    salaryMax: 15000,
    description:
      "Own a core payments surface used across Southeast Asia. You'll decide what ships and defend why.",
  },
  {
    id: "j_setel_apm",
    companyId: "c_setel",
    roleId: "r_assoc_pm",
    title: "Associate Product Manager",
    location: "Kuala Lumpur",
    salaryMin: 6000,
    salaryMax: 8500,
    description:
      "Learn product the right way alongside senior PMs, owning research and smaller features end-to-end.",
  },
  {
    id: "j_petronas_devops",
    companyId: "c_petronas",
    roleId: "r_devops",
    title: "Platform Engineer, Cloud",
    location: "Kuala Lumpur",
    salaryMin: 9000,
    salaryMax: 13500,
    description:
      "Build the internal platform that hundreds of engineers ship on. Kubernetes, Terraform, and real reliability ownership.",
  },
  {
    id: "j_aerodyne_ml",
    companyId: "c_aerodyne",
    roleId: "r_ml_engineer",
    title: "Machine Learning Engineer, Vision",
    location: "Cyberjaya",
    salaryMin: 9500,
    salaryMax: 15000,
    description:
      "Productionise computer-vision models that inspect infrastructure from drone footage. Python + cloud + real edge constraints.",
  },
  {
    id: "j_axiata_growth",
    companyId: "c_axiata",
    roleId: "r_growth_manager",
    title: "Growth Manager, Digital",
    location: "Petaling Jaya",
    salaryMin: 8000,
    salaryMax: 12000,
    description:
      "Own acquisition and retention for a digital product with millions of users. Data-driven, experiment-led.",
  },
  {
    id: "j_kfit_ux",
    companyId: "c_kfit",
    roleId: "r_ux_designer",
    title: "Product Designer",
    location: "Kuala Lumpur",
    salaryMin: 5500,
    salaryMax: 9000,
    description:
      "Shape the experience for a consumer app people use every day. Research-led, Figma-first, close to product.",
  },
  {
    id: "j_grab_senior",
    companyId: "c_grab",
    roleId: "r_senior_swe",
    title: "Senior Software Engineer, Payments",
    location: "Kuala Lumpur",
    salaryMin: 11000,
    salaryMax: 16000,
    description:
      "Set technical direction for payment systems handling serious scale. Mentor, design, and own the hardest problems.",
  },
  {
    id: "j_maybank_ba",
    companyId: "c_maybank",
    roleId: "r_biz_analyst",
    title: "Business Analyst, Digital Banking",
    location: "Kuala Lumpur",
    salaryMin: 5000,
    salaryMax: 7500,
    description:
      "Bridge business and engineering on the digital banking transformation. Requirements, process, and data.",
  },
  {
    id: "j_shopee_marketing",
    companyId: "c_shopee",
    roleId: "r_marketing_exec",
    title: "Digital Marketing Executive",
    location: "Kuala Lumpur",
    salaryMin: 3200,
    salaryMax: 4800,
    description:
      "Run campaigns across paid and organic channels for one of the region's biggest marketplaces. A wide-open entry role.",
  },
  {
    id: "j_carsome_em",
    companyId: "c_carsome",
    roleId: "r_eng_manager",
    title: "Engineering Manager, Platform",
    location: "Petaling Jaya",
    salaryMin: 16000,
    salaryMax: 23000,
    description:
      "Lead a platform team — hiring, growth, and delivery. For senior engineers ready to scale through people.",
  },
  {
    id: "j_aerodyne_devops_png",
    companyId: "c_aerodyne",
    roleId: "r_devops",
    title: "DevOps Engineer (Penang)",
    location: "Bayan Lepas, Penang",
    salaryMin: 7500,
    salaryMax: 12000,
    description:
      "Run the deployment pipelines and cloud infra for our drone-analytics platform. Kubernetes, Terraform, on-call ownership.",
  },
  {
    id: "j_bigpay_swe",
    companyId: "c_bigpay",
    roleId: "r_swe",
    title: "Software Engineer, Wallet",
    location: "Kuala Lumpur",
    salaryMin: 6000,
    salaryMax: 9500,
    description:
      "Build the wallet features millions rely on daily. TypeScript, clean APIs, and a strong testing culture.",
  },
  {
    id: "j_axiata_da",
    companyId: "c_axiata",
    roleId: "r_data_analyst",
    title: "Data Analyst, Customer Insights",
    location: "Petaling Jaya",
    salaryMin: 4000,
    salaryMax: 6500,
    description:
      "Turn telco-scale customer data into insight that shapes product and marketing. SQL-heavy, dashboard-led.",
  },
  {
    id: "j_setel_growth",
    companyId: "c_setel",
    roleId: "r_growth_manager",
    title: "Growth Manager, Retention",
    location: "Kuala Lumpur",
    salaryMin: 8000,
    salaryMax: 12500,
    description:
      "Own the retention funnel for a fuel-and-payments super-app. Experiment-led, data-driven, cross-functional.",
  },
  {
    id: "j_petronas_ds",
    companyId: "c_petronas",
    roleId: "r_data_scientist",
    title: "Data Scientist, Energy Analytics",
    location: "Kuala Lumpur",
    salaryMin: 9500,
    salaryMax: 15000,
    description:
      "Build models on operational energy data with real business impact. Python, experimentation, and stakeholder communication.",
  },
  {
    id: "j_kfit_apm",
    companyId: "c_kfit",
    roleId: "r_assoc_pm",
    title: "Associate Product Manager, Consumer",
    location: "Kuala Lumpur",
    salaryMin: 5800,
    salaryMax: 8500,
    description:
      "Learn product alongside senior PMs on a consumer app used daily across the region.",
  },
  // Non-tech listings so Finance, Healthcare, and Business tracks feel alive.
  {
    id: "j_kpmg_audit",
    companyId: "c_kpmg",
    roleId: "r_audit_assoc",
    title: "Audit Associate (2026 intake)",
    location: "Kuala Lumpur",
    salaryMin: 3000,
    salaryMax: 4200,
    description:
      "Start your professional accounting career auditing leading Malaysian companies. ACCA support provided. Open to accounting and finance graduates.",
  },
  {
    id: "j_nestle_fa",
    companyId: "c_nestle",
    roleId: "r_financial_analyst",
    title: "Financial Analyst, FP&A",
    location: "Petaling Jaya",
    salaryMin: 5000,
    salaryMax: 8000,
    description:
      "Drive budgeting and forecasting for one of Malaysia's biggest FMCG brands. Strong Excel and modelling, real business influence.",
  },
  {
    id: "j_maybank_fm",
    companyId: "c_maybank",
    roleId: "r_finance_manager",
    title: "Finance Manager, Group Finance",
    location: "Kuala Lumpur",
    salaryMin: 10000,
    salaryMax: 15000,
    description:
      "Lead a finance team within the country's largest bank — planning, controls, and reporting at scale.",
  },
  {
    id: "j_kpj_nurse",
    companyId: "c_kpj",
    roleId: "r_staff_nurse",
    title: "Staff Nurse",
    location: "Petaling Jaya",
    salaryMin: 2800,
    salaryMax: 4200,
    description:
      "Provide frontline patient care at a leading private hospital group. New nursing graduates welcome; strong training and progression.",
  },
  {
    id: "j_kpj_pharma",
    companyId: "c_kpj",
    roleId: "r_clinical_pharmacist",
    title: "Pharmacist",
    location: "Petaling Jaya",
    salaryMin: 4500,
    salaryMax: 7000,
    description:
      "Dispense and advise on medication across hospital wards. Licensed pharmacy graduates, with a clear path toward specialty and management.",
  },
  {
    id: "j_nestle_sales",
    companyId: "c_nestle",
    roleId: "r_sales_exec",
    title: "Sales Executive",
    location: "Kuala Lumpur",
    salaryMin: 3000,
    salaryMax: 5000,
    description:
      "Grow accounts across the retail trade for household-name brands. Open to graduates of any discipline who love people and targets.",
  },
  {
    id: "j_shopee_hr",
    companyId: "c_shopee",
    roleId: "r_hr_exec",
    title: "Human Resources Executive",
    location: "Kuala Lumpur",
    salaryMin: 3200,
    salaryMax: 5000,
    description:
      "Support hiring and people operations for a fast-moving tech org. A people-centric entry role open to most graduates.",
  },
  {
    id: "j_grab_ops",
    companyId: "c_grab",
    roleId: "r_operations_manager",
    title: "Operations Manager",
    location: "Kuala Lumpur",
    salaryMin: 9000,
    salaryMax: 14000,
    description:
      "Own the processes and teams that keep a regional operation running. Broad leadership role for proven operators.",
  },
  {
    id: "j_bigpay_ai",
    companyId: "c_bigpay",
    roleId: "r_ai_engineer",
    title: "AI Engineer, LLM Products",
    location: "Kuala Lumpur",
    salaryMin: 7000,
    salaryMax: 13000,
    description:
      "Build production LLM features — agents, RAG over internal docs, and AI automation on AWS Bedrock. For engineers who ship with foundation models.",
  },
];

export const SKILLS: string[] = Array.from(
  new Set(ROLES.flatMap((r) => r.skills)),
).sort();

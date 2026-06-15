"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Mock invitations (client-side, localStorage). The flip side of booking: other
// people request to meet YOU about the path you're on (you don't have to be an
// "expert" — just someone walking it). You accept or decline here.
//
// Seeded with a few realistic requests on first load so the Invitations tab is
// never empty in a demo. A real `meeting_requests` table can replace this later
// without changing the UI.
// ─────────────────────────────────────────────────────────────────────────────

export type InvitationStatus = "pending" | "accepted" | "declined";

export interface MockInvitation {
  id: string;
  requesterName: string;
  requesterHeadline: string; // who's asking, in one line
  aboutPath: string; // the path/role they want to understand (usually yours)
  message: string; // why they want to meet
  proposedSlot: string; // a human-readable suggested time
  status: InvitationStatus;
  createdAt: string; // ISO
}

const KEY = "careeros.invitations";

function read(): MockInvitation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MockInvitation[]) : [];
  } catch {
    return [];
  }
}

function write(items: MockInvitation[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

// Default seed — people who want to learn about the path you're on.
function seedFor(aboutPath: string): MockInvitation[] {
  const now = Date.now();
  const base: Omit<MockInvitation, "id" | "createdAt" | "status" | "aboutPath">[] = [
    {
      requesterName: "Nurul Aina",
      requesterHeadline: "Final-year Computer Science student, UM",
      message: `I'm deciding between a few directions after graduation and ${aboutPath} is top of my list. Could I ask what the first year was actually like for you?`,
      proposedSlot: "This Friday, 4:30 PM",
    },
    {
      requesterName: "Daniel Tan",
      requesterHeadline: "Support Engineer, 2 yrs — looking to switch",
      message: `Thinking of moving toward ${aboutPath}. Would love 20 minutes to hear how you made the jump and whether it's worth it.`,
      proposedSlot: "Next Monday, 1:00 PM",
    },
    {
      requesterName: "Priya Raman",
      requesterHeadline: "Bootcamp grad, building a portfolio",
      message: `Trying to understand what ${aboutPath} teams really look for day-to-day. Could we have a quick chat?`,
      proposedSlot: "Wednesday, 9:00 AM",
    },
  ];
  return base.map((b, i) => ({
    ...b,
    aboutPath,
    id: `inv_${now.toString(36)}_${i}`,
    status: "pending" as InvitationStatus,
    createdAt: new Date(now - i * 3600_000).toISOString(),
  }));
}

// Returns invitations, seeding the store on first load if a path is given.
export function listInvitations(seedAboutPath?: string | null): MockInvitation[] {
  const existing = read();
  if (existing.length === 0 && seedAboutPath) {
    const seeded = seedFor(seedAboutPath);
    write(seeded);
    return seeded;
  }
  return existing.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function setInvitationStatus(id: string, status: InvitationStatus): void {
  write(read().map((i) => (i.id === id ? { ...i, status } : i)));
}

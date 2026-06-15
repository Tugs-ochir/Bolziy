import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { InviteModel } from "@/models/Invite";
import { checkAdminAuth } from "@/lib/adminAuth";

export const runtime = "nodejs";

const ActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

/**
 * Админ төлбөр баталгаажуулах/татгалзах.
 * body: { action: "approve" | "reject" }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> },
) {
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  try {
    await connectToDatabase();
  } catch {
    return NextResponse.json({ error: "DB холбогдож чадсангүй." }, { status: 503 });
  }

  const { inviteId: rawId } = await params;
  const inviteId = rawId?.trim() ?? "";
  if (!inviteId) return NextResponse.json({ error: "Invalid invite ID" }, { status: 400 });

  const parsed = ActionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const invite = await InviteModel.findOne({ inviteId });
  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });

  invite.paymentStatus = parsed.data.action === "approve" ? "paid" : "rejected";
  await invite.save();

  return NextResponse.json({ inviteId, paymentStatus: invite.paymentStatus });
}

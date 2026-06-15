import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { InviteModel } from "@/models/Invite";

export const runtime = "nodejs";

/**
 * Төлбөрийн төлвийг буцаана. Create page энэ endpoint-г тогтмол давтан дуудаж
 * (polling) админ баталгаажуулсан эсэхийг хянана.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> },
) {
  try {
    await connectToDatabase();
  } catch {
    return NextResponse.json({ error: "DB холбогдож чадсангүй." }, { status: 503 });
  }

  const { inviteId: rawId } = await params;
  const inviteId = rawId?.trim() ?? "";
  if (!inviteId) return NextResponse.json({ error: "Invalid invite ID" }, { status: 400 });

  const invite = await InviteModel.findOne({ inviteId })
    .select({ _id: 0, paymentStatus: 1, paymentAmount: 1 })
    .lean();
  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    paymentStatus: invite.paymentStatus ?? "pending",
    paymentAmount: invite.paymentAmount ?? 1000,
  });
}

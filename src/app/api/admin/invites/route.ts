import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { InviteModel } from "@/models/Invite";
import { checkAdminAuth } from "@/lib/adminAuth";

export const runtime = "nodejs";

/**
 * Админд зориулсан төлбөрийн жагсаалт.
 * ?status=awaiting_confirmation|pending|paid|rejected|all (default: awaiting_confirmation)
 */
export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  try {
    await connectToDatabase();
  } catch {
    return NextResponse.json({ error: "DB холбогдож чадсангүй." }, { status: 503 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "awaiting_confirmation";

  const filter =
    status === "all"
      ? {}
      : { paymentStatus: status };

  const invites = await InviteModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .select({
      _id: 0,
      inviteId: 1,
      senderName: 1,
      inviteeName: 1,
      date: 1,
      place: 1,
      paymentStatus: 1,
      paymentAmount: 1,
      createdAt: 1,
    })
    .lean();

  return NextResponse.json({ invites });
}

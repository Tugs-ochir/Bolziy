import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { InviteModel } from "@/models/Invite";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> },
) {
  await connectToDatabase();
  const { inviteId } = await params;

  const invite = await InviteModel.findOne({ inviteId }).select({ _id: 0 }).lean();
  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const wasSent = invite.status === "sent";
  await InviteModel.updateOne(
    { inviteId },
    {
      $inc: { viewCount: 1 },
      ...(wasSent ? { $set: { status: "seen" } } : {}),
    },
  );

  return NextResponse.json({
    invite: {
      ...invite,
      viewCount: invite.viewCount + 1,
      status: wasSent ? "seen" : invite.status,
    },
  });
}

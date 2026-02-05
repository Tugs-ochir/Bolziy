import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { InviteModel } from "@/models/Invite";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> },
) {
  try {
    await connectToDatabase();
  } catch {
    return NextResponse.json(
      { error: "DB холбогдож чадсангүй." },
      { status: 503 },
    );
  }

  const { inviteId: rawId } = await params;
  const searchId = rawId?.trim() ?? "";
  if (!searchId) return NextResponse.json({ error: "Invalid invite ID" }, { status: 400 });

  // Эхлээд яг таарсан ID-аар хайна, дараа нь том/жижиг үсэг үл тоомжлон хайна
  let invite = await InviteModel.findOne({ inviteId: searchId }).select({ _id: 0 }).lean();
  if (!invite) {
    const caseInsensitive = new RegExp(`^${searchId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    invite = await InviteModel.findOne({ inviteId: caseInsensitive }).select({ _id: 0 }).lean();
  }
  if (!invite) {
    const totalInvites = await InviteModel.countDocuments();
    return NextResponse.json(
      {
        error: "Not found",
        ...(process.env.NODE_ENV === "development" && {
          debug: { searchId, totalInvites },
        }),
      },
      { status: 404 },
    );
  }

  const inviteId = invite.inviteId;
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
      viewCount: (invite.viewCount ?? 0) + 1,
      status: wasSent ? "seen" : invite.status,
    },
  });
}

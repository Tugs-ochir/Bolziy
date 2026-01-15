import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { InviteModel } from "@/models/Invite";
import { InviteResponseModel } from "@/models/InviteResponse";

export const runtime = "nodejs";

const RespondSchema = z.object({
  response: z.enum(["accepted", "rejected"]),
});

function getIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (!forwardedFor) return undefined;
  return forwardedFor.split(",")[0]?.trim() || undefined;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> },
) {
  await connectToDatabase();
  const { inviteId } = await params;

  const parsed = RespondSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const invite = await InviteModel.findOne({ inviteId });
  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newStatus = parsed.data.response;
  if (invite.status !== "accepted" && invite.status !== "rejected") {
    invite.status = newStatus;
    await invite.save();
  }

  await InviteResponseModel.create({
    inviteId,
    response: parsed.data.response,
    respondedAt: new Date(),
    ipAddress: getIp(req),
  });

  return NextResponse.json({ status: invite.status });
}

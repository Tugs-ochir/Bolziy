import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { InviteModel } from "@/models/Invite";

export const runtime = "nodejs";

/**
 * Хэрэглэгч "Төлбөр шалгах" товч дарахад дуудагдана.
 * Төлбөрийн төлвийг "pending" -> "awaiting_confirmation" болгож,
 * админы баталгаажуулалтыг хүлээнэ.
 */
export async function POST(
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

  const invite = await InviteModel.findOne({ inviteId });
  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Аль хэдийн төлсөн бол төлвийг хадгална
  if (invite.paymentStatus === "pending") {
    invite.paymentStatus = "awaiting_confirmation";
    await invite.save();
  }

  return NextResponse.json({ paymentStatus: invite.paymentStatus });
}

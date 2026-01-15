import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { generateInviteId } from "@/lib/inviteId";
import { InviteModel } from "@/models/Invite";

export const runtime = "nodejs";

function isMongoConnectionError(err: unknown) {
  if (!err || typeof err !== "object") return false;
  const name = "name" in err ? (err as { name?: unknown }).name : undefined;
  if (name === "MongooseServerSelectionError") return true;
  const message =
    "message" in err ? (err as { message?: unknown }).message : undefined;
  return typeof message === "string" && message.includes("ECONNREFUSED");
}

const CreateInviteSchema = z.object({
  senderName: z.string().min(1).max(80),
  inviteeName: z.string().min(1).max(80),
  date: z.string().min(1),
  place: z.string().min(1).max(120),
  message: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  try {
    await connectToDatabase();
  } catch (err) {
    if (isMongoConnectionError(err)) {
      return NextResponse.json(
        {
          error:
            "DB холбогдож чадсангүй. MONGODB_URI зөв эсэх, MongoDB/Atlas ажиллаж байгаа эсэхийг шалгаарай.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const parsed = CreateInviteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const date = new Date(parsed.data.date);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const inviteId = generateInviteId();
    try {
      await InviteModel.create({
        inviteId,
        senderName: parsed.data.senderName,
        inviteeName: parsed.data.inviteeName,
        date,
        place: parsed.data.place,
        message: parsed.data.message,
        status: "sent",
        viewCount: 0,
      });

      return NextResponse.json({ inviteId }, { status: 201 });
    } catch (err) {
      const maybeDup =
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code?: unknown }).code === 11000;
      if (!maybeDup) throw err;
    }
  }

  return NextResponse.json({ error: "Could not allocate inviteId" }, { status: 500 });
}

const ListInvitesQuerySchema = z.object({
  senderName: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    await connectToDatabase();
  } catch (err) {
    if (isMongoConnectionError(err)) {
      return NextResponse.json(
        {
          error:
            "DB холбогдож чадсангүй. MONGODB_URI зөв эсэх, MongoDB/Atlas ажиллаж байгаа эсэхийг шалгаарай.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const url = new URL(req.url);
  const parsed = ListInvitesQuerySchema.safeParse({
    senderName: url.searchParams.get("senderName"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing senderName" }, { status: 400 });
  }

  const invites = await InviteModel.find({ senderName: parsed.data.senderName })
    .sort({ createdAt: -1 })
    .select({
      _id: 0,
      inviteId: 1,
      inviteeName: 1,
      createdAt: 1,
      status: 1,
      viewCount: 1,
      date: 1,
      place: 1,
    })
    .lean();

  return NextResponse.json({ invites });
}

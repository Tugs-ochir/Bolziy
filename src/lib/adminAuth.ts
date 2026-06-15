import { NextResponse } from "next/server";

/**
 * Admin токеныг шалгана. `ADMIN_TOKEN` орчны хувьсагчтай тулгана.
 * - Тохируулаагүй бол: 503 (админ функц идэвхгүй)
 * - Токен таарахгүй бол: 401
 * - Зөв бол: null буцаана (үргэлжлүүлж болно)
 */
export function checkAdminAuth(req: Request): NextResponse | null {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_TOKEN тохируулаагүй байна. .env дотор ADMIN_TOKEN-г нэмнэ үү." },
      { status: 503 },
    );
  }

  const provided =
    req.headers.get("x-admin-token") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";

  if (provided !== expected) {
    return NextResponse.json({ error: "Зөвшөөрөлгүй хандалт." }, { status: 401 });
  }

  return null;
}

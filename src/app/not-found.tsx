import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-xl font-semibold">Олдсонгүй</h1>
      <p className="text-sm text-zinc-600">
        Таны хайсан хуудас олдсонгүй.
      </p>
      <div>
        <Link className="text-sm font-medium underline" href="/">
          Нүүр хуудас руу буцах
        </Link>
      </div>
    </div>
  );
}


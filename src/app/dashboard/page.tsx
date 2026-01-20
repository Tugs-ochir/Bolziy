"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, User, Calendar, MapPin, Eye, Copy, ExternalLink, Search, Sparkles } from "lucide-react";

type InviteItem = {
  inviteId: string;
  inviteeName: string;
  createdAt: string;
  status: "sent" | "seen" | "accepted" | "rejected";
  viewCount: number;
  date: string;
  place: string;
};

function statusLabel(status: InviteItem["status"]) {
  switch (status) {
    case "sent":
      return "Илгээсэн";
    case "seen":
      return "Үзсэн";
    case "accepted":
      return "Зөвшөөрсөн";
    case "rejected":
      return "Татгалзсан";
  }
}

function statusClass(status: InviteItem["status"]) {
  switch (status) {
    case "sent":
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
    case "seen":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "accepted":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
  }
}

export default function DashboardPage() {
  const [senderName, setSenderName] = useState("");
  const [invites, setInvites] = useState<InviteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareBase = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    const saved = window.localStorage.getItem("boilzy_senderName");
    if (saved) setSenderName(saved);
  }, []);

  useEffect(() => {
    if (!senderName) return;
    window.localStorage.setItem("boilzy_senderName", senderName);
  }, [senderName]);

  const canLoad = useMemo(() => senderName.trim().length > 0, [senderName]);

  async function load() {
    if (!canLoad) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invites?senderName=${encodeURIComponent(senderName)}`, {
        cache: "no-store",
      });
      const json = (await res.json().catch(() => null)) as unknown;
      if (!res.ok || !json || typeof json !== "object") {
        throw new Error("Урилгуудыг уншиж чадсангүй.");
      }
      const items = (json as { invites?: unknown }).invites;
      if (!Array.isArray(items)) throw new Error("Урилгуудыг уншиж чадсангүй.");
      setInvites(items as InviteItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg animate-[pulse-slow_2s_ease-in-out_infinite]">
            <Heart className="text-white" size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Өөрийн үүсгэсэн урилгуудыг харна уу
          </p>
        </div>

      <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-rose-100 p-6 sm:p-8 mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-100/40 to-purple-100/40 rounded-full blur-3xl -z-0" />
        <div className="relative z-10 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User size={16} className="text-rose-500" />
              Таны нэрээр хайх
            </span>
            <input
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              className="h-11 rounded-xl border-2 border-gray-200 px-4 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </label>
          <button
            type="button"
            onClick={load}
            disabled={!canLoad || loading}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-rose-200 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Уншиж байна...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Урилга хайх
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>

        {error ? (
          <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
            ⚠️ {error}
          </div>
        ) : null}

        {invites.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-gray-100/40 to-purple-100/40 rounded-full blur-3xl" />
            <div className="relative z-10">
              <Sparkles className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-base text-gray-600 mb-4">
                Одоогоор урилга алга байна
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-rose-200 transition-all hover:scale-105"
              >
                <Heart size={16} fill="currentColor" />
                Урилга үүсгэх
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {invites.map((inv) => {
              const invitePath = `/invite/${inv.inviteId}`;
              const inviteUrl = `${shareBase}${invitePath}`;
              const dateText = new Date(inv.date).toLocaleDateString("mn-MN", {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={inv.inviteId}
                  className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-100/30 to-purple-100/30 rounded-full blur-2xl" />
                  <div className="relative z-10 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 shadow-md">
                            <Heart className="text-white" size={16} fill="currentColor" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Урилга ID</div>
                            <div className="text-sm font-bold text-gray-900">{inv.inviteId}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 mb-1">
                          <User size={14} className="text-pink-500" />
                          <span className="text-sm font-semibold">{inv.inviteeName}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} className="text-purple-500" />
                            {dateText}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-pink-500" />
                            {inv.place}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye size={12} className="text-blue-500" />
                            {inv.viewCount} үзсэн
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(inv.status)}`}
                        >
                          {statusLabel(inv.status)}
                        </span>
                        <div className="text-xs text-gray-500">
                          {new Date(inv.createdAt).toLocaleDateString("mn-MN")}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => copy(inviteUrl)}
                        className="flex-1 sm:flex-none rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                      >
                        <Copy size={14} />
                        Copy линк
                      </button>
                      <Link
                        href={invitePath}
                        className="flex-1 sm:flex-none rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-2 text-xs font-semibold text-white hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={14} />
                        Үзэх
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Энэхүү урилга ❤️ -аар хийгдсэн.
          </p>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  LogIn,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  CreditCard,
} from "lucide-react";

type PaymentStatus = "pending" | "awaiting_confirmation" | "paid" | "rejected";

type AdminInvite = {
  inviteId: string;
  senderName: string;
  inviteeName: string;
  date: string;
  place: string;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  createdAt: string;
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "awaiting_confirmation", label: "Хүлээгдэж буй" },
  { value: "paid", label: "Баталгаажсан" },
  { value: "rejected", label: "Татгалзсан" },
  { value: "all", label: "Бүгд" },
];

function statusBadge(status: PaymentStatus) {
  switch (status) {
    case "pending":
      return { text: "Төлбөр хүлээж буй", cls: "bg-zinc-100 text-zinc-700 border-zinc-200" };
    case "awaiting_confirmation":
      return { text: "Баталгаажуулах хүлээж буй", cls: "bg-blue-50 text-blue-700 border-blue-200" };
    case "paid":
      return { text: "Баталгаажсан", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "rejected":
      return { text: "Татгалзсан", cls: "bg-red-50 text-red-700 border-red-200" };
  }
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [filter, setFilter] = useState("awaiting_confirmation");
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("boilzy_admin_token");
    if (saved) {
      setToken(saved);
      setAuthed(true);
    }
  }, []);

  const load = useCallback(
    async (tk: string, status: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/invites?status=${encodeURIComponent(status)}`, {
          headers: { "x-admin-token": encodeURIComponent(tk) },
          cache: "no-store",
        });
        const json = (await res.json().catch(() => null)) as
          | { invites?: AdminInvite[]; error?: string }
          | null;
        if (res.status === 401) {
          setAuthed(false);
          window.localStorage.removeItem("boilzy_admin_token");
          throw new Error("Токен буруу байна.");
        }
        if (!res.ok || !json?.invites) {
          throw new Error(json?.error ?? "Жагсаалт ачааллаж чадсангүй.");
        }
        setInvites(json.invites);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Алдаа гарлаа.");
        setInvites([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (authed && token) load(token, filter);
  }, [authed, token, filter, load]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    const tk = token.trim();
    if (!tk) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invites?status=awaiting_confirmation", {
        headers: { "x-admin-token": encodeURIComponent(tk) },
        cache: "no-store",
      });
      if (res.status === 401) throw new Error("Токен буруу байна.");
      const json = (await res.json().catch(() => null)) as
        | { invites?: AdminInvite[]; error?: string }
        | null;
      if (!res.ok || !json?.invites) {
        throw new Error(json?.error ?? "Нэвтэрч чадсангүй.");
      }
      window.localStorage.setItem("boilzy_admin_token", tk);
      setInvites(json.invites);
      setAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }

  function onLogout() {
    window.localStorage.removeItem("boilzy_admin_token");
    setAuthed(false);
    setToken("");
    setInvites([]);
  }

  async function act(inviteId: string, action: "approve" | "reject") {
    setActingId(inviteId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/invites/${encodeURIComponent(inviteId)}`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": encodeURIComponent(token) },
        body: JSON.stringify({ action }),
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(json?.error ?? "Үйлдэл амжилтгүй боллоо.");
      await load(token, filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа.");
    } finally {
      setActingId(null);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-50 to-rose-50 p-4 flex items-center justify-center">
        <form
          onSubmit={onLogin}
          className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-zinc-100 p-8"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-gradient-to-br from-slate-700 to-zinc-900 shadow-lg">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Админ нэвтрэх</h1>
          <p className="text-sm text-gray-600 mb-6">Төлбөр баталгаажуулах удирдлага</p>
          <label className="grid gap-2 mb-4">
            <span className="text-sm font-semibold text-gray-700">Админ токен</span>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              type="password"
              placeholder="ADMIN_TOKEN"
              className="h-11 rounded-xl border-2 border-gray-200 px-4 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
            />
          </label>
          {error ? (
            <div className="mb-4 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
              ⚠️ {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-slate-700 to-zinc-900 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn size={18} />
            {loading ? "Шалгаж байна..." : "Нэвтрэх"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-50 to-rose-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-slate-700 to-zinc-900 shadow-lg">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Төлбөрийн удирдлага</h1>
              <p className="text-sm text-gray-600">Урилгын төлбөр баталгаажуулах</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => load(token, filter)}
              className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Шинэчлэх
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              Гарах
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                filter === f.value
                  ? "border-slate-700 bg-slate-700 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium mb-4">
            ⚠️ {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
            Ачааллаж байна...
          </div>
        ) : invites.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <Clock className="mx-auto mb-3 text-gray-400" size={40} />
            <p className="text-gray-600">Энэ төлөвт урилга алга байна.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {invites.map((inv) => {
              const badge = statusBadge(inv.paymentStatus);
              const dateText = new Date(inv.date).toLocaleDateString("mn-MN", {
                month: "short",
                day: "numeric",
              });
              const isActing = actingId === inv.inviteId;
              return (
                <div
                  key={inv.inviteId}
                  className="rounded-2xl bg-white shadow-lg border border-gray-100 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Урилгын ID</div>
                      <div className="text-base font-bold text-gray-900">{inv.inviteId}</div>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badge.cls}`}
                    >
                      {badge.text}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User size={14} className="text-slate-500" />
                      Илгээгч: <span className="font-semibold">{inv.senderName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <User size={14} className="text-pink-500" />
                      Урих хүн: <span className="font-semibold">{inv.inviteeName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={14} className="text-purple-500" />
                      {dateText}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin size={14} className="text-rose-500" />
                      {inv.place}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <CreditCard size={14} className="text-amber-500" />
                      Дүн:{" "}
                      <span className="font-semibold">
                        {(inv.paymentAmount ?? 1000).toLocaleString("mn-MN")}₮
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      {new Date(inv.createdAt).toLocaleString("mn-MN")}
                    </div>
                  </div>

                  {inv.paymentStatus !== "paid" ? (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => act(inv.inviteId, "approve")}
                        className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle2 size={16} />
                        Баталгаажуулах
                      </button>
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => act(inv.inviteId, "reject")}
                        className="flex-1 rounded-lg border-2 border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Татгалзах
                      </button>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-emerald-600 font-medium">
                      <CheckCircle2 size={16} />
                      Төлбөр баталгаажсан
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

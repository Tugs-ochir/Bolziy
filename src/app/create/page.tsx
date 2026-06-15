"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Heart, Sparkles, Send, Copy, Download, Link as LinkIcon, QrCode as QrCodeIcon, Smile, Coffee, Star, MessageCircle, Landmark, CreditCard, CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react";

type PaymentStatus = "pending" | "awaiting_confirmation" | "paid" | "rejected";

const BANK_INFO = {
  bankName: "Голомт банк",
  accountNumber: "IBAN 5800 1500 1105465364",
  accountName: "Б.Төгс-Очир",
  amount: 1000,
};

type MessageTemplate = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  build: (input: { inviteeName: string; date: string; place: string }) => string;
};

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "romantic",
    name: "Романтик",
    icon: <Heart size={20} fill="currentColor" />,
    description: "Сэтгэл хөдөлгөм, романтик үг",
    build: ({ inviteeName, date, place }) =>
      `Хайрт ${inviteeName} минь ❤️

Чамтай хамт тайван, дулаахан нэгэн оройг өнгөрөөхийг үнэхээр их хүсэж байна.
${date}-нд ${place} дээр уулзаад, инээмсэглэл, яриа, гоё дурсамжийг хамт бүтээе 💕

Хариуг чинь догдлон хүлээж байна 🌹`,
  },
  {
    id: "sweet",
    name: "Эелдэг найрсаг",
    icon: <Smile size={20} />,
    description: "Илүү зөөлөн, халуун дулаан",
    build: ({ inviteeName, date, place }) =>
      `Сайн уу ${inviteeName} 😊

Чамтай ярилцах бүрд сэтгэл сайхан болдог.
${date}-нд ${place} дээр уулзаад, тайван сууж цай уунгаа сайхан яриа өрнүүлэх үү?

Хэрвээ чөлөөтэй бол надтай хамт цагийг өнгөрөөгөөрэй ✨`,
  },
  {
    id: "casual",
    name: "Хөнгөн энгийн",
    icon: <Coffee size={20} />,
    description: "Найрсаг, дарамтгүй",
    build: ({ inviteeName, date, place }) =>
      `Сайн уу ${inviteeName}! ☕  

${date}-нд ${place} дээр уулзаж цай кофе уух уу?
Сүүлийн үед чамтай тухтай сууж, элдэв сонин хачин юм ярилцмаар санагдаад байна.

Завтай бол уулзъя 🙌`,
  },
  {
    id: "funny",
    name: "Хөгжилтэй",
    icon: <Sparkles size={20} />,
    description: "Илүү хөнгөн флирт нэмье",
    build: ({ inviteeName, date, place }) =>
      `Хөөе ${inviteeName}! 😄  

${date}-нд ${place} дээр уулзах санал байна!
Сэтгэл санаанд минь жаахан чиний инээмсэглэл дутаад байгаа юм 😅
Анхааруулга: их инээх магадлалтай!

Хариуг чинь инээмсэглээд хүлээж байя 🎉`,
  },
  {
    id: "poetic",
    name: "Яруу найраг",
    icon: <Star size={20} />,
    description: "Илүү уянгалаг, гэхдээ хэт хүнд биш",
    build: ({ inviteeName, date, place }) =>
      `${inviteeName} минь 🌙

${date}-ны өдөр ${place} дээр
Хоёр зүрх нэг хэмнэлээр цохилох тэр агшинд,
Инээмсэглэл дурсамж болж,
Цаг хугацаа түр азнах болтугай.

Чамтай хамт байх мөч — миний хүсэл 💫`,
  },
  {
    id: "simple",
    name: "Энгийн шууд",
    icon: <MessageCircle size={20} />,
    description: "Илүү эелдэг, дулаан болгож",
    build: ({ inviteeName, date, place }) =>
      `Сайн уу ${inviteeName} 🙂

${date}-нд ${place} дээр надтай болзоонд уулзах уу?
Чамтай цагийг өнгөрөөхийг хүсэж байна.

Хариу өгвөл баярлана 🙏`,
  },
  {
    id: "custom",
    name: "Өөрийн сэтгэлийн үгээ бичих",
    icon: <MessageCircle size={20} />,
    description: "Өөрийн мессеж бичих",
    build: () => "",
  },
];

type CreateState = {
  senderName: string;
  inviteeName: string;
  date: string;
  place: string;
  selectedTemplate: string;
  customMessage: string;
};

export default function CreatePage() {
  const [state, setState] = useState<CreateState>({
    senderName: "",
    inviteeName: "",
    date: "",
    place: "",
    selectedTemplate: "romantic",
    customMessage: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [createdInviteId, setCreatedInviteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentTemplate = useMemo(
    () => MESSAGE_TEMPLATES.find((t) => t.id === state.selectedTemplate) || MESSAGE_TEMPLATES[0],
    [state.selectedTemplate]
  );

  const message = useMemo(() => {
    if (state.selectedTemplate === "custom") {
      return state.customMessage;
    }
    return currentTemplate.build({
      inviteeName: state.inviteeName,
      date: state.date,
      place: state.place,
    });
  }, [state.selectedTemplate, state.inviteeName, state.date, state.place, state.customMessage, currentTemplate]);
  const sharePath = createdInviteId ? `/invite/${createdInviteId}` : null;
  const shareUrl =
    typeof window !== "undefined" && sharePath
      ? `${window.location.origin}${sharePath}`
      : null;

  useEffect(() => {
    let cancelled = false;
    if (!shareUrl) {
      setQrDataUrl(null);
      return undefined;
    }

    setQrLoading(true);
    QRCode.toDataURL(shareUrl, { margin: 1, width: 240 })
      .then((data) => {
        if (!cancelled) setQrDataUrl(data);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      })
      .finally(() => {
        if (!cancelled) setQrLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [shareUrl]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setCreatedInviteId(null);

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          senderName: state.senderName,
          inviteeName: state.inviteeName,
          date: state.date,
          place: state.place,
          message,
        }),
      });

      const json = (await res.json().catch(() => null)) as unknown;
      if (!json || typeof json !== "object") {
        throw new Error("Урилга үүсгэж чадсангүй.");
      }

      if (!res.ok) {
        const serverError = (json as { error?: unknown }).error;
        if (typeof serverError === "string" && serverError.trim()) {
          throw new Error(serverError);
        }
        throw new Error("Урилга үүсгэж чадсангүй.");
      }

      const inviteId = (json as { inviteId?: unknown }).inviteId;
      if (typeof inviteId !== "string") throw new Error("Урилга үүсгэж чадсангүй.");
      setCreatedInviteId(inviteId);
      setPaymentStatus("pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onCheckPayment() {
    if (!createdInviteId) return;
    setCheckingPayment(true);
    setError(null);
    try {
      const res = await fetch(`/api/invites/${encodeURIComponent(createdInviteId)}/check-payment`, {
        method: "POST",
      });
      const json = (await res.json().catch(() => null)) as { paymentStatus?: PaymentStatus } | null;
      if (!res.ok || !json?.paymentStatus) {
        throw new Error("Төлбөр шалгахад алдаа гарлаа. Дахин оролдоно уу.");
      }
      setPaymentStatus(json.paymentStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа.");
    } finally {
      setCheckingPayment(false);
    }
  }

  // Админ баталгаажуулсан эсэхийг хянах polling
  useEffect(() => {
    if (!createdInviteId || paymentStatus !== "awaiting_confirmation") {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/invites/${encodeURIComponent(createdInviteId)}/payment-status`,
          { cache: "no-store" },
        );
        const json = (await res.json().catch(() => null)) as { paymentStatus?: PaymentStatus } | null;
        if (!cancelled && json?.paymentStatus && json.paymentStatus !== "pending") {
          setPaymentStatus(json.paymentStatus);
        }
      } catch {
        // дараагийн оролдлогод дахин шалгана
      }
    };

    pollRef.current = setInterval(poll, 4000);
    poll();

    return () => {
      cancelled = true;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [createdInviteId, paymentStatus]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.6s ease-out both; }
      `}</style>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg animate-[pulse-slow_2s_ease-in-out_infinite]">
            <Heart className="text-white" size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Урилга үүсгэх
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Маягтыг бөглөөд болзооны урилгын линк үүсгэнэ үү
          </p>
        </div>

      {!createdInviteId && (
      <form
        onSubmit={onSubmit}
        className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-rose-100 p-6 sm:p-8 animate-fade-up"
        style={{ animationDelay: "80ms" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-100/40 to-purple-100/40 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-100/40 to-rose-100/40 rounded-full blur-3xl -z-0" />
        
        <div className="relative z-10 grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles size={16} className="text-rose-500" />
                Таны нэр
              </span>
              <input
                value={state.senderName}
                onChange={(e) => setState((s) => ({ ...s, senderName: e.target.value }))}
                className="h-11 rounded-xl border-2 border-gray-200 px-4 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                placeholder="Таны нэр"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Heart size={16} className="text-pink-500" />
                Урих хүний нэр
              </span>
              <input
                value={state.inviteeName}
                onChange={(e) => setState((s) => ({ ...s, inviteeName: e.target.value }))}
                className="h-11 rounded-xl border-2 border-gray-200 px-4 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                placeholder="Хүлээн авах хүний нэр"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-700">Огноо</span>
              <input
                value={state.date}
                onChange={(e) => setState((s) => ({ ...s, date: e.target.value }))}
                className="h-11 rounded-xl border-2 border-gray-200 px-4 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                type="date"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-700">Газар</span>
              <input
                value={state.place}
                onChange={(e) => setState((s) => ({ ...s, place: e.target.value }))}
                className="h-11 rounded-xl border-2 border-gray-200 px-4 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                placeholder="Жишээ: Хүрээлэн "
                required
              />
            </label>
          </div>

          <fieldset className="grid gap-4">
            <legend className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles size={16} className="text-rose-500" />
              Мессежийн загвар сонгох
            </legend>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MESSAGE_TEMPLATES.map((template) => (
                <label
                  key={template.id}
                  className={`group relative overflow-hidden rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    state.selectedTemplate === template.id
                      ? 'border-rose-400 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-rose-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={template.id}
                    checked={state.selectedTemplate === template.id}
                    onChange={(e) => setState((s) => ({ ...s, selectedTemplate: e.target.value }))}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className={`p-2 rounded-full transition-colors ${
                      state.selectedTemplate === template.id
                        ? 'bg-rose-400 text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-rose-100 group-hover:text-rose-600'
                    }`}>
                      {template.icon}
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${
                        state.selectedTemplate === template.id ? 'text-rose-700' : 'text-gray-900'
                      }`}>
                        {template.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {template.description}
                      </div>
                    </div>
                  </div>
                  {state.selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </label>
              ))}
            </div>

            <div className="grid gap-3">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Мессежийн урьдчилсан харагдах байдал</div>
              {state.selectedTemplate === "custom" ? (
                <textarea
                  value={state.customMessage}
                  onChange={(e) => setState((s) => ({ ...s, customMessage: e.target.value }))}
                  className="min-h-40 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                  placeholder="Сэтгэлийн үгээ энд бичнэ үү... ✨"
                  required
                />
              ) : (
                <div className="relative overflow-hidden rounded-xl border-2 border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50 p-5 shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/20 to-pink-200/20 rounded-full blur-2xl" />
                  <pre className="relative whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                    {message || "Мэдээлэл бөглөхөд мессеж харагдана..."}
                  </pre>
                </div>
              )}
            </div>
          </fieldset>

          {error ? (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
              ⚠️ {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-4 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-rose-200 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Үүсгэж байна...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Урилга үүсгэх
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </form>
      )}

        {createdInviteId && paymentStatus && paymentStatus !== "paid" ? (
          <div
            className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-amber-200 p-6 sm:p-8 mt-6 animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-100/40 to-rose-100/40 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                  <CreditCard className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Төлбөр төлөх</h3>
                  <p className="text-sm text-gray-600">
                    Урилга идэвхжихийн тулд төлбөрөө төлнө үү
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
                  <div className="text-xs font-semibold text-rose-700 mb-1 flex items-center gap-2">
                    <Sparkles size={14} />
                    Урилгын ID
                  </div>
                  <div className="text-lg font-bold text-gray-900">{createdInviteId}</div>
                </div>

                <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                  <div className="flex items-center gap-2 mb-4 text-amber-800 font-semibold">
                    <Landmark size={18} />
                    Төлбөрийн мэдээлэл
                  </div>
                  <dl className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-gray-600">Банк</dt>
                      <dd className="font-semibold text-gray-900">{BANK_INFO.bankName}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-gray-600">Дансны дугаар</dt>
                      <dd className="flex items-center gap-2 font-semibold text-gray-900">
                        {BANK_INFO.accountNumber}
                        <button
                          type="button"
                          onClick={() => copy(BANK_INFO.accountNumber)}
                          className="rounded-md border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-all flex items-center gap-1"
                        >
                          <Copy size={12} />
                          {copied ? "Хууллаа" : "Хуулах"}
                        </button>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-gray-600">Дансны нэр</dt>
                      <dd className="font-semibold text-gray-900">{BANK_INFO.accountName}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-amber-200 pt-3">
                      <dt className="text-gray-600">Төлөх дүн</dt>
                      <dd className="text-lg font-bold text-rose-600">
                        {BANK_INFO.amount.toLocaleString("mn-MN")}₮
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs text-amber-700">
                    Гүйлгээний утга дээр <span className="font-bold">{createdInviteId}</span> гэж бичээрэй.
                  </p>
                </div>

                {paymentStatus === "pending" ? (
                  <button
                    type="button"
                    onClick={onCheckPayment}
                    disabled={checkingPayment}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-amber-200 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {checkingPayment ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Илгээж байна...
                        </>
                      ) : (
                        <>
                          <CreditCard size={20} />
                          Төлбөр шалгах
                        </>
                      )}
                    </span>
                  </button>
                ) : null}

                {paymentStatus === "awaiting_confirmation" ? (
                  <div className="rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-4">
                    <div className="flex items-center gap-3 text-blue-800">
                      <Clock size={20} className="flex-shrink-0 animate-pulse" />
                      <div>
                        <div className="font-semibold">Таны төлбөр шалгагдаж байна</div>
                        <div className="text-sm text-blue-600">
                          Админ баталгаажуулсны дараа урилга автоматаар идэвхжинэ. Та энэ хуудсаа нээлттэй байлгаарай.
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-500">
                      <RefreshCw size={12} className="animate-spin" />
                      Төлвийг автоматаар шалгаж байна...
                    </div>
                  </div>
                ) : null}

                {paymentStatus === "rejected" ? (
                  <div className="grid gap-3">
                    <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-4">
                      <div className="flex items-center gap-3 text-red-800">
                        <XCircle size={20} className="flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Төлбөр баталгаажсангүй</div>
                          <div className="text-sm text-red-600">
                            Төлбөр амжилтгүй болсон байна. Гүйлгээгээ шалгаад дахин оролдоно уу.
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onCheckPayment}
                      disabled={checkingPayment}
                      className="rounded-xl border-2 border-amber-300 bg-white px-6 py-3 text-amber-700 font-semibold hover:bg-amber-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw size={18} />
                      Дахин шалгах
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {createdInviteId && sharePath && paymentStatus === "paid" ? (
          <div
            className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-emerald-200 p-6 sm:p-8 mt-6 animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-100/40 to-green-100/40 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg">
                  <CheckCircle2 className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Төлбөр баталгаажлаа! 🎉</h3>
                  <p className="text-sm text-gray-600">Таны урилга идэвхжиж, линк бэлэн боллоо</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                  <div className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-2">
                    <Sparkles size={14} />
                    Invite ID
                  </div>
                  <div className="text-lg font-bold text-gray-900">{createdInviteId}</div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <div className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-2">
                    <LinkIcon size={14} />
                    Линк хуваалцах
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a 
                      className="flex-1 text-sm font-medium text-purple-700 underline break-all" 
                      href={sharePath}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shareUrl ?? sharePath}
                    </a>
                    <button
                      type="button"
                      onClick={() => copy(shareUrl ?? sharePath)}
                      className="group rounded-lg border-2 border-purple-200 bg-white px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all flex items-center gap-2"
                    >
                      <Copy size={16} />
                      Copy
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
                  <div className="text-xs font-semibold text-rose-700 mb-3 flex items-center gap-2">
                    <QrCodeIcon size={14} />
                    QR код
                  </div>
                  {qrLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                      QR код бэлтгэж байна...
                    </div>
                  ) : qrDataUrl ? (
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="p-3 rounded-xl border-2 border-rose-200 bg-white shadow-md">
                        <img
                          src={qrDataUrl}
                          alt="Урилгын QR код"
                          className="h-32 w-32"
                        />
                      </div>
                      <a
                        download={`invite-${createdInviteId}.png`}
                        href={qrDataUrl}
                        className="group rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-rose-200 transition-all hover:scale-105 flex items-center gap-2"
                      >
                        <Download size={16} />
                        Татаж авах
                      </a>
                    </div>
                  ) : (
                    <div className="text-sm text-red-700 font-medium">⚠️ QR код үүсгэж чадсангүй.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Энэхүү урилга ❤️ -ээр хийгдсэн байна
          </p>
        </div>
      </div>
    </div>
  );
}

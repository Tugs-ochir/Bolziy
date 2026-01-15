"use client";

import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";

type InviteStatus = "sent" | "seen" | "accepted" | "rejected";

export default function InviteActions({
  inviteId,
  initialStatus,
  senderName,
}: {
  inviteId: string;
  initialStatus: InviteStatus;
  senderName: string;
}) {
  const [status, setStatus] = useState<InviteStatus>(initialStatus);
  const [loading, setLoading] = useState<"accepted" | "rejected" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const disabled = status === "accepted" || status === "rejected" || loading !== null;

  async function respond(response: "accepted" | "rejected") {
    setLoading(response);
    setIsAnimating(true);
    
    if (response === "accepted") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    try {
      const res = await fetch(`/api/invites/${inviteId}/respond`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ response }),
      });
      const json = (await res.json().catch(() => null)) as unknown;
      if (!res.ok || !json || typeof json !== "object") throw new Error();
      const nextStatus = (json as { status?: unknown }).status;
      if (
        nextStatus === "sent" ||
        nextStatus === "seen" ||
        nextStatus === "accepted" ||
        nextStatus === "rejected"
      ) {
        setTimeout(() => {
          setStatus(nextStatus);
          setIsAnimating(false);
        }, 600);
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-[fall_3s_ease-out_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              <Heart
                className="text-rose-400"
                size={Math.random() * 20 + 10}
                fill="currentColor"
              />
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="grid gap-3">
        {status === 'seen' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={disabled || isAnimating}
              onClick={() => respond("accepted")}
              className="flex-1 group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Heart size={20} fill="currentColor" />
                {loading === "accepted" ? "Илгээж байна..." : "Зөвшөөрөх"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <button
              type="button"
              disabled={disabled || isAnimating}
              onClick={() => respond("rejected")}
              className="flex-1 group rounded-xl border-2 border-gray-300 bg-white px-6 py-4 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "rejected" ? "Илгээж байна..." : "Татгалзах"}
            </button>
          </div>
        )}

        {status === 'accepted' && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 animate-[float_3s_ease-in-out_infinite]">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="text-emerald-600" size={24} fill="currentColor" />
              <h4 className="text-lg font-bold text-emerald-900">Маш сайн!</h4>
            </div>
            <p className="text-emerald-800">
              {senderName} Таны хариултанд баярлалаа. Болзоогоо амжилттай өнгөрөхийг хүсье! 💚
            </p>
          </div>
        )}

        {status === 'rejected' && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-gray-200">
                <MessageCircle className="text-gray-600" size={20} />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Хариу илгээгдсэн</h4>
            </div>
            <p className="text-gray-700">
              Таны хариулт {senderName}-д хүрлээ.
            </p>
          </div>
        )}
      </div>
    </>
  );
}


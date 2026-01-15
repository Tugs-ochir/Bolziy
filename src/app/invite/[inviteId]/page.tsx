import { notFound } from "next/navigation";
import InviteActions from "./InviteActions";
import { connectToDatabase } from "@/lib/mongodb";
import { InviteModel } from "@/models/Invite";
import { Heart, MapPin, Calendar, Sparkles, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ inviteId: string }>;
}) {
  await connectToDatabase();
  const { inviteId } = await params;

  const invite = await InviteModel.findOne({ inviteId }).select({ _id: 0 }).lean();
  if (!invite) notFound();

  const wasSent = invite.status === "sent";
  await InviteModel.updateOne(
    { inviteId },
    {
      $inc: { viewCount: 1 },
      ...(wasSent ? { $set: { status: "seen" } } : {}),
    },
  );

  const dateText = new Date(invite.date).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const status = wasSent ? "seen" : invite.status;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg animate-[pulse-slow_2s_ease-in-out_infinite]">
            <Heart className="text-white" size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Болзооны урилга
          </h1>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-rose-100 transition-all duration-500 hover:shadow-rose-200/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-100/40 to-purple-100/40 rounded-full blur-3xl -z-0" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-100/40 to-rose-100/40 rounded-full blur-3xl -z-0" />
          
          <div className="relative z-10 p-6 sm:p-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-rose-500" size={18} />
                <span className="text-sm font-medium text-rose-600">Илгээгч</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {invite.senderName}
              </h2>
            </div>

            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
              <div className="flex items-start gap-2 mb-3">
                <MessageCircle className="text-rose-500 mt-1 flex-shrink-0" size={20} />
                <span className="text-sm font-semibold text-rose-700">Мессеж</span>
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
                {invite.message}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="group p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-shadow">
                    <Calendar className="text-purple-600" size={20} />
                  </div>
                  <span className="text-sm font-semibold text-purple-700">Огноо</span>
                </div>
                <p className="text-gray-900 font-bold text-lg ml-11">{dateText}</p>
              </div>

              <div className="group p-5 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-shadow">
                    <MapPin className="text-pink-600" size={20} />
                  </div>
                  <span className="text-sm font-semibold text-pink-700">Газар</span>
                </div>
                <p className="text-gray-900 font-bold text-lg ml-11">{invite.place}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Хариу өгөх</h3>
                <p className="text-sm text-gray-600">
                  Энэ урилга{' '}
                  <span className={`font-semibold ${
                    status === 'accepted' 
                      ? 'text-emerald-600' 
                      : status === 'rejected' 
                      ? 'text-red-600' 
                      : 'text-blue-600'
                  }`}>
                    {status === 'seen' ? 'үзсэн' : status === 'accepted' ? 'зөвшөөрсөн' : status === 'rejected' ? 'татгалзсан' : status}
                  </span>{' '}
                  төлөвтэй байна.
                </p>
              </div>

              <InviteActions 
                inviteId={inviteId} 
                initialStatus={status}
                senderName={invite.senderName}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Энэхүү урилга ❤️ -ээр хийгдсэн байна
          </p>
        </div>
      </div>
    </div>
  );
}


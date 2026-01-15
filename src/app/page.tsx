import Link from "next/link";
import { Heart, Sparkles, Send, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-2xl animate-[pulse-slow_2s_ease-in-out_infinite]">
            <Heart className="text-white" size={40} fill="currentColor" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Болзооны урилга үүсгэе
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Өөрийн урилгыг үүсгэж, линк болон QR кодыг хайртай хүндээ илгээгээрэй.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-rose-100 p-8 sm:p-10 mb-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-100/40 to-purple-100/40 rounded-full blur-3xl -z-0" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-100/40 to-rose-100/40 rounded-full blur-3xl -z-0" />
          
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="text-rose-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Эхлэе</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                href="/create"
                className="w-full sm:w-auto group relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-8 py-4 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-rose-200 transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Send size={20} />
                  Урилга үүсгэх
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              
              <Link
                href="/dashboard"
                className="w-full sm:w-auto rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <BarChart3 size={20} />
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg border border-purple-100 p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 animate-[float_3s_ease-in-out_infinite]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100/40 to-pink-100/40 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-md">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Үүсгэнэ</h3>
              <p className="text-sm text-gray-600">
                Нэр, огноо, газар, мессежээ оруулаад урилга үүсгэнэ үү.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg border border-pink-100 p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 animate-[float_3s_ease-in-out_infinite_0.5s]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-100/40 to-rose-100/40 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-md">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Илгээнэ</h3>
              <p className="text-sm text-gray-600">
                Линк болон QR кодыг copy хийгээд илгээнэ үү.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg border border-emerald-100 p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 animate-[float_3s_ease-in-out_infinite_1s]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100/40 to-green-100/40 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-md">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Хянана</h3>
              <p className="text-sm text-gray-600">
                Урилгын төлөвийг Dashboard-с харна уу.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            Энэхүү урилга ❤️ -ээр хийгдсэн байна
          </p>
        </div>
      </div>
    </div>
  );
}

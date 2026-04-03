"use client";

import Link from "next/link";
import { useState } from "react";

const content = {
  en: {
    dir: "ltr" as const,
    badge: "Free for roommates",
    h1a: "Split bills.",
    h1b: "No drama.",
    sub: "SknMoney tracks who paid what, splits it fairly, and tells everyone exactly who owes whom — so you never have that awkward money conversation again.",
    cta1: "Create a free account",
    cta2: "Sign in",
    f1title: "Log any expense",
    f1desc: "Record who paid, choose who benefits, split equally or set custom amounts per person.",
    f2title: "Balances, simplified",
    f2desc: "Our algorithm turns messy group debts into the fewest possible payments to settle up.",
    f3title: "Mark as paid",
    f3desc: "When someone pays you back in real life, tap Confirm Received and the balance updates instantly.",
    builtFor: "Built for",
    tags: ["Apartments", "Students", "Travel groups", "Flatmates", "Co-living spaces"],
    ctaBig: "Ready to stop chasing people for money?",
    ctaSub: "Set up your first group in under a minute.",
    ctaBtn: "Get started free",
    footerBuilt: "Built by",
    footerName: "Yahya Abu Rayyan",
    footerRight: "· All rights reserved",
  },
  ar: {
    dir: "rtl" as const,
    badge: "مجاني للسكن المشترك",
    h1a: "قسّم الفواتير.",
    h1b: "بدون توتر.",
    sub: "SknMoney يتتبع من دفع ماذا، يقسّم المبالغ بعدل، ويخبر الجميع بالضبط من يدين لمن — حتى لا تضطر لإجراء تلك المحادثة المحرجة عن المال مرة أخرى.",
    cta1: "إنشاء حساب مجاني",
    cta2: "تسجيل الدخول",
    f1title: "سجّل أي مصروف",
    f1desc: "حدد من دفع، اختر من استفاد، وقسّم المبلغ بالتساوي أو بمبالغ مخصصة لكل شخص.",
    f2title: "أرصدة مبسّطة",
    f2desc: "خوارزميتنا تحوّل الديون المعقدة داخل المجموعة إلى أقل عدد ممكن من الدفعات للتسوية.",
    f3title: "اضغط 'تم الدفع'",
    f3desc: "عندما يدفع لك أحدهم في الواقع، اضغط 'تأكيد الاستلام' وسيتحدث الرصيد فوراً.",
    builtFor: "مصمّم لـ",
    tags: ["الشقق المشتركة", "الطلاب", "مجموعات السفر", "الشركاء في السكن", "مساحات العيش المشترك"],
    ctaBig: "هل أنت مستعد للتوقف عن مطاردة الناس لأموالك؟",
    ctaSub: "أنشئ مجموعتك الأولى في أقل من دقيقة.",
    ctaBtn: "ابدأ مجاناً",
    footerBuilt: "بناه",
    footerName: "يحيى أبو ريان",
    footerRight: "· جميع الحقوق محفوظة",
  },
};

export default function LandingPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const c = content[lang];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col" dir={c.dir}>

      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center">
            <span className="text-yellow-400 font-black text-sm">$</span>
          </div>
          <span className="text-lg font-extrabold text-zinc-900 tracking-tight">SknMoney</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="text-xs font-bold border border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 px-3 py-1.5 rounded-lg transition-colors"
          >
            {lang === "en" ? "عربي" : "English"}
          </button>
          <Link
            href="/login"
            className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            {c.cta2}
          </Link>
          <Link
            href="/signup"
            className="text-sm font-bold bg-zinc-950 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            {c.cta1}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-full mb-8 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
            {c.badge}
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-zinc-900 tracking-tight leading-[1.1] mb-6">
            {c.h1a}<br />
            <span className="text-yellow-400">{c.h1b}</span>
          </h1>

          <p className="text-lg text-zinc-500 leading-relaxed mb-10 max-w-md mx-auto">
            {c.sub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-bold px-8 py-3.5 rounded-xl transition-colors text-sm"
            >
              {c.cta1}
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm"
            >
              {c.cta2}
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto w-full">
          {[
            { icon: "💳", title: c.f1title, desc: c.f1desc },
            { icon: "⚖️", title: c.f2title, desc: c.f2desc },
            { icon: "✓",  title: c.f3title, desc: c.f3desc },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-zinc-100 p-6 text-start">
              <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center text-lg mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-zinc-900 text-base mb-1.5">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Dark CTA section */}
        <div className="mt-16 bg-zinc-950 rounded-3xl p-10 max-w-3xl mx-auto w-full text-center">
          <p className="text-zinc-400 text-sm uppercase tracking-widest font-semibold mb-3">
            {c.builtFor}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {c.tags.map((tag) => (
              <span
                key={tag}
                className="bg-zinc-800 text-zinc-300 text-sm font-medium px-4 py-2 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-white font-extrabold text-2xl mt-8 mb-2">{c.ctaBig}</p>
          <p className="text-zinc-500 text-sm mb-6">{c.ctaSub}</p>
          <Link
            href="/signup"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-bold px-8 py-3 rounded-xl transition-colors text-sm"
          >
            {c.ctaBtn}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white mt-8">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-zinc-950 rounded-md flex items-center justify-center">
              <span className="text-yellow-400 font-black text-xs">$</span>
            </div>
            <span className="text-sm font-bold text-zinc-900">SknMoney</span>
          </div>

          <p className="text-xs text-zinc-500 text-center">
            {c.footerBuilt}{" "}
            <span className="font-semibold text-zinc-700">{c.footerName}</span>
            {" "}{c.footerRight}
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/YahyaAburayyan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-900 transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/in/yahia-abu-rayyan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-900 transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}

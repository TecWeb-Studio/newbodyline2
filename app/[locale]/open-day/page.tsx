"use client";

import { useTranslations } from "next-intl";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { motion } from "framer-motion";
import { Link } from "@/app/i18n/navigation";
import {
  CalendarDays,
  MessageCircle,
  MapPin,
  Phone,
  Sparkles,
  Gift,
  Users,
  BookOpen,
  Star,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

const WHATSAPP_URL =
  "https://wa.me/393479633983?text=Ciao!%20Vorrei%20informazioni%20sull%27Open%20Day%20e%20prenotare%20una%20prova%20gratuita.";

const POSTERS = [
  { src: "/images/openday-yoga.png", alt: "Open Day – Hatha Yoga & Yoga Vinyasa", label: "Yoga", accent: "from-red-600 to-red-800" },
  { src: "/images/openday-kick.png", alt: "Open Day – Kickboxing", label: "Kickboxing", accent: "from-red-700 to-orange-700" },
  { src: "/images/openday-spinning.png", alt: "Open Day – Spinning", label: "Spinning", accent: "from-red-600 to-red-800" },
  { src: "/images/openday-mobility.png", alt: "Open Day – Mobility", label: "Mobility", accent: "from-red-700 to-red-900" },
  { src: "/images/openday-low.png", alt: "Open Day – Low Impact Posturale", label: "Low Impact", accent: "from-red-600 to-red-800" },
  { src: "/images/openday-circuito.png", alt: "Open Day – Circuito Tonificazione", label: "Circuito", accent: "from-red-700 to-orange-800" },
  { src: "/images/openday-alive.png", alt: "Open Day – Aliverox", label: "Aliverox", accent: "from-red-600 to-red-900" },
  { src: "/images/openday-hiphop.png", alt: "Open Day – Hip Hop", label: "Hip Hop", accent: "from-purple-600 to-pink-700" },
  { src: "/images/openday-contemporanea.png", alt: "Open Day – Danza Contemporanea", label: "Contemporanea", accent: "from-violet-600 to-purple-700" },
  { src: "/images/openday-danza.png", alt: "Open Day – Danza Classica", label: "Danza Classica", accent: "from-purple-700 to-violet-800" },
] as const;

export default function OpenDayPage() {
  const t = useTranslations("openDay");

  const benefits = [
    { icon: Gift, titleKey: "benefit1Title" as const, descKey: "benefit1Desc" as const },
    { icon: Users, titleKey: "benefit2Title" as const, descKey: "benefit2Desc" as const },
    { icon: BookOpen, titleKey: "benefit3Title" as const, descKey: "benefit3Desc" as const },
    { icon: Star, titleKey: "benefit4Title" as const, descKey: "benefit4Desc" as const },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen overflow-x-hidden">

        {/* HERO */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#030303]">
            <div className="absolute -top-20 -right-20 w-[700px] h-[700px] bg-[#dc2626]/12 rounded-full blur-[220px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-[#dc2626]/6 rounded-full blur-[200px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-[#dc2626]/4 rounded-full blur-[130px] pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.022]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
                backgroundSize: "55px 55px",
              }}
            />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#dc2626]/15 border border-[#dc2626]/35 text-[#f87171] text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mb-10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t("badge")} · New Body Line 2 · 2026
            </motion.div>

            <div className="mb-6 leading-[0.88] tracking-tight select-none">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="block text-[clamp(5rem,18vw,14rem)] font-black text-[#fafafa]"
              >
                OPEN
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="block text-[clamp(5rem,18vw,14rem)] font-black leading-none"
                style={{
                  background: "linear-gradient(135deg, #dc2626 0%, #ef4444 35%, #f97316 65%, #dc2626 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                DAY
              </motion.div>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent to-[#dc2626]/60" />
              <div className="w-2 h-2 rounded-full bg-[#dc2626]" />
              <div className="h-px w-16 sm:w-32 bg-gradient-to-l from-transparent to-[#dc2626]/60" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="text-base sm:text-xl font-semibold text-[#d4d4d8] uppercase tracking-[0.18em] mb-5"
            >
              {t("heroSubtitle")}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="text-sm sm:text-lg text-[#a1a1aa] max-w-xl mx-auto mb-10 leading-relaxed"
            >
              {t("heroDescription")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-0 bg-[#111111]/80 backdrop-blur-sm border border-[#27272a] rounded-2xl px-5 sm:px-8 py-5 mb-10 sm:divide-x sm:divide-[#27272a]"
            >
              <div className="flex items-center gap-3 sm:pr-8">
                <CalendarDays className="w-5 h-5 text-[#dc2626] shrink-0" />
                <div className="text-left">
                  <p className="text-[#71717a] text-[10px] font-bold uppercase tracking-widest mb-0.5">{t("courseStartTitle")}</p>
                  <p className="text-[#fafafa] text-lg sm:text-xl font-bold">{t("courseStartDate")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:pl-8">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <div className="text-left">
                  <p className="text-[#71717a] text-[10px] font-bold uppercase tracking-widest mb-0.5">{t("registrationsOpen")}</p>
                  <p className="text-green-400 text-lg sm:text-xl font-bold">{t("freeTrial")}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-sm sm:text-base rounded-2xl transition-all duration-300 active:scale-[0.97] shadow-xl shadow-[#25D366]/25 min-h-[52px] w-full sm:w-auto justify-center"
              >
                <MessageCircle className="w-5 h-5" />
                {t("ctaBook")}
              </a>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-[#3f3f46] hover:border-[#dc2626]/70 hover:text-[#fafafa] text-[#a1a1aa] font-semibold text-sm sm:text-base rounded-2xl transition-all duration-300 min-h-[52px] w-full sm:w-auto justify-center"
              >
                Scopri i Corsi
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <div className="w-5 h-8 rounded-full border-2 border-[#3f3f46] flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-1.5 bg-[#dc2626] rounded-full"
              />
            </div>
          </motion.div>
        </section>

        {/* POSTER GRID */}
        <section className="py-20 sm:py-28 bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-[#dc2626]/4 rounded-full blur-[200px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#dc2626]/10 border border-[#dc2626]/20 text-[#dc2626] text-xs sm:text-sm font-semibold uppercase tracking-widest mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                {t("postersSectionTitle")}
              </span>
              <p className="text-[#a1a1aa] text-base sm:text-lg max-w-xl mx-auto">
                {t("postersSectionSubtitle")}
              </p>
            </motion.div>

            <div className="columns-2 md:columns-3 xl:columns-4 gap-4 sm:gap-5">
              {POSTERS.map((poster, i) => (
                <motion.div
                  key={poster.src}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, delay: (i % 4) * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="break-inside-avoid group relative rounded-2xl overflow-hidden border border-[#27272a] hover:border-[#dc2626]/50 transition-all duration-500 shadow-xl shadow-black/30 mb-4 sm:mb-5"
                >
                  <div className="relative w-full">
                    <Image
                      src={poster.src}
                      alt={poster.alt}
                      width={400}
                      height={600}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                    <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${poster.accent} text-white text-[11px] font-bold uppercase tracking-wider shadow-lg`}>
                        <Sparkles className="w-2.5 h-2.5" />
                        {poster.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="py-20 sm:py-28 bg-[#111111] relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[#dc2626]/20 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fafafa] mb-4">
                {t("infoSectionTitle")}
              </h2>
              <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
                {t("infoSectionDescription")}
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.div
                    key={b.titleKey}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group bg-[#0a0a0a] border border-[#27272a] hover:border-[#dc2626]/40 rounded-2xl p-6 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center mb-5 group-hover:bg-[#dc2626]/15 transition-colors">
                      <Icon className="w-6 h-6 text-[#dc2626]" />
                    </div>
                    <h3 className="text-[#fafafa] font-bold text-lg mb-2">{t(b.titleKey)}</h3>
                    <p className="text-[#a1a1aa] text-sm leading-relaxed">{t(b.descKey)}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className="py-20 sm:py-28 bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#dc2626]/5 rounded-full blur-[160px]" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fafafa] mb-6">
                {t("contactSectionTitle")}
              </h2>
              <p className="text-[#a1a1aa] text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                {t("contactSectionDesc")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <div className="flex items-center gap-4 bg-[#111111] border border-[#27272a] rounded-2xl p-5">
                  <div className="w-11 h-11 rounded-xl bg-[#dc2626]/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#dc2626]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[#71717a] text-xs uppercase tracking-wider mb-0.5">Telefono</p>
                    <a href="tel:+393479633983" className="text-[#fafafa] font-semibold hover:text-[#dc2626] transition-colors">
                      {t("phone")}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-[#111111] border border-[#27272a] rounded-2xl p-5">
                  <div className="w-11 h-11 rounded-xl bg-[#dc2626]/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#dc2626]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[#71717a] text-xs uppercase tracking-wider mb-0.5">Indirizzo</p>
                    <p className="text-[#fafafa] font-semibold text-sm">{t("address")}</p>
                  </div>
                </div>
              </div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-lg rounded-2xl transition-all duration-300 active:scale-[0.97] shadow-xl shadow-[#25D366]/20 min-h-[60px]"
              >
                <MessageCircle className="w-6 h-6" />
                {t("ctaWhatsApp")}
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

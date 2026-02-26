"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useBooking } from "@/app/contexts/BookingContext";
import { useToast } from "@/app/components/Toast";
import { validateBookingForm } from "@/lib/types";
import BookingCalendar from "@/app/components/BookingCalendar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Clock,
  User,
  Mail,
  Phone,
  Check,
  ChevronLeft,
  Award,
  Users,
  Target,
  Shield,
  Palmtree,
  AlertCircle,
  MessageCircle,
} from "lucide-react";

const WHATSAPP_NUMBER = "393479633983"; // +39 347 963 3983

export default function PersonalTrainingPage() {
  const t = useTranslations("personalTraining");
  const { trainers, getAvailableSlotsForTrainer, addBooking, isLoading } =
    useBooking();
  const bookingSectionRef = useRef<HTMLElement>(null);

  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [trainerOnVacation, setTrainerOnVacation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Scroll to booking section when a trainer is selected
  useEffect(() => {
    if (showBookingForm && bookingSectionRef.current) {
      setTimeout(() => {
        bookingSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [showBookingForm]);

  // Fetch available slots when trainer and date change
  useEffect(() => {
    if (selectedTrainer && selectedDate) {
      getAvailableSlotsForTrainer(selectedTrainer, selectedDate).then(
        (result) => {
          setAvailableSlots(result.slots);
          setTrainerOnVacation(result.onVacation);
        },
      );
    } else {
      setAvailableSlots([]);
      setTrainerOnVacation(false);
    }
  }, [selectedTrainer, selectedDate, getAvailableSlotsForTrainer]);

  // Date range handled inside BookingCalendar component

  const selectedTrainerData = trainers.find((t) => t.id === selectedTrainer);

  const handleBook = () => {
    if (!selectedTrainerData || !selectedSlot) return;
    const slot = availableSlots.find((s) => s.id === selectedSlot);
    if (!slot) return;

    // Validate form
    const validation = validateBookingForm(formData);
    setFieldErrors(validation.errors);
    if (!validation.valid) return;

    // Show confirmation screen (no API call yet)
    setBookingSuccess(true);
  };

  const handleConfirmRequest = async () => {
    if (!selectedTrainerData || !selectedSlot) return;
    const slot = availableSlots.find((s) => s.id === selectedSlot);
    if (!slot) return;

    setIsSubmitting(true);
    setBookingError(null);
    try {
      await addBooking({
        trainerId: selectedTrainerData.id,
        trainerName: selectedTrainerData.name,
        slotId: slot.id,
        date: slot.date,
        time: slot.time,
        clientName: formData.name.trim(),
        clientEmail: formData.email.trim(),
        clientPhone: formData.phone.trim(),
      });
      toast(t('booking.requestSentToast'));

      // Build WhatsApp URL and redirect
      const message = t('booking.whatsappMessage', {
        trainer: selectedTrainerData.name,
        date: slot.date,
        time: slot.time,
        name: formData.name.trim(),
      });
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      // window.open is blocked in PWA standalone mode on mobile,
      // so fall back to location.href which opens WhatsApp directly
      const opened = window.open(waUrl, '_blank');
      if (!opened) {
        window.location.href = waUrl;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('booking.failedToast');
      setBookingError(msg);
      toast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setSelectedTrainer(null);
    setSelectedDate("");
    setSelectedSlot(null);
    setFormData({ name: "", email: "", phone: "" });
    setShowBookingForm(false);
    setBookingSuccess(false);
    setBookingError(null);
    setAvailableSlots([]);
    setTrainerOnVacation(false);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-32 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#27272a] border-t-[#dc2626] rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        {/* Hero Section */}
        <section className="relative py-24 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[#0a0a0a]">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#dc2626]/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#dc2626]/5 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-4 block">
                {t("title")}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#fafafa] mb-6">
                {t("heroTitle")}
              </h1>
              <p className="text-lg sm:text-xl text-[#a1a1aa]">
                {t("heroDescription")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Trainers Section */}
        <section className="py-16 sm:py-24 bg-[#111111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-4">
                {t("trainers.title")}
              </h2>
              <p className="text-[#a1a1aa] text-lg">{t("trainers.subtitle")}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {trainers.map((trainer, index) => (
                <motion.div
                  key={trainer.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedTrainer(trainer.id);
                    setSelectedDate("");
                    setSelectedSlot(null);
                    setAvailableSlots([]);
                    setTrainerOnVacation(false);
                    setBookingSuccess(false);
                    setBookingError(null);
                    setShowBookingForm(true);
                  }}
                  className={`group relative bg-[#0a0a0a] border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedTrainer === trainer.id
                      ? "border-[#dc2626] shadow-lg shadow-[#dc2626]/20"
                      : "border-[#27272a] hover:border-[#dc2626]/50"
                  }`}
                >
                  {/* Trainer Image */}
                  <div className="aspect-4/5 bg-linear-to-b from-[#27272a] to-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden",
                        );
                      }}
                    />
                    <User className="w-24 h-24 text-[#3f3f46] hidden" />
                    <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-transparent to-transparent" />

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#0a0a0a]/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#27272a] z-10">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-[#fafafa] font-semibold text-sm">
                        {trainer.rating}
                      </span>
                    </div>
                  </div>

                  {/* Trainer Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#fafafa] mb-2">
                      {trainer.name}
                    </h3>
                    <p className="text-[#dc2626] font-medium text-sm mb-3">
                      {trainer.specialty}
                    </p>
                    <p className="text-[#a1a1aa] text-sm leading-relaxed line-clamp-2">
                      {trainer.description}
                    </p>

                    <button className="mt-4 w-full py-2.5 rounded-lg border border-[#27272a] text-[#fafafa] font-medium hover:bg-[#dc2626] hover:border-[#dc2626] transition-all">
                      {t("booking.bookSession")}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <AnimatePresence>
          {showBookingForm && (
            <section
              ref={bookingSectionRef}
              className="py-16 sm:py-24 bg-[#0a0a0a] relative"
            >
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className="bg-[#111111] border border-[#27272a] rounded-3xl p-8 sm:p-12"
                >
                  {bookingSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-amber-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#fafafa] mb-4">
                        {t("booking.requestSent")}
                      </h3>
                      <p className="text-[#a1a1aa] mb-8">
                        {t("booking.requestSentMessage")}
                      </p>

                      <div className="bg-[#0a0a0a] rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
                        <h4 className="text-[#dc2626] font-semibold mb-4">
                          {t("booking.sessionDetails")}
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#71717a]">
                              {t("booking.trainer")}
                            </span>
                            <span className="text-[#fafafa]">
                              {selectedTrainerData?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#71717a]">
                              {t("booking.date")}
                            </span>
                            <span className="text-[#fafafa]">
                              {selectedDate}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#71717a]">
                              {t("booking.time")}
                            </span>
                            <span className="text-[#fafafa]">
                              {
                                availableSlots.find(
                                  (s) => s.id === selectedSlot,
                                )?.time
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#71717a]">
                              {t("booking.status")}
                            </span>
                            <span className="text-amber-400 font-medium">
                              {t("booking.pendingApproval")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {bookingError && (
                        <p className="text-red-500 text-sm text-center mb-4">
                          {bookingError}
                        </p>
                      )}

                      <div className="flex flex-col gap-3 max-w-md mx-auto">
                        <button
                          onClick={handleConfirmRequest}
                          disabled={isSubmitting}
                          className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              {t("booking.sendingRequest")}…
                            </span>
                          ) : (
                            <>
                              <MessageCircle className="w-5 h-5" />
                              {t("booking.confirmRequest")}
                            </>
                          )}
                        </button>
                        <button onClick={resetBooking} disabled={isSubmitting} className="w-full py-3 border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] font-medium rounded-xl transition-colors disabled:opacity-50">
                          {t("booking.bookAnother")}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 mb-8">
                        <button
                          onClick={() => {
                            if (selectedSlot) {
                              setSelectedSlot(null);
                            } else if (selectedDate) {
                              setSelectedDate("");
                            } else {
                              setSelectedTrainer(null);
                              setShowBookingForm(false);
                            }
                          }}
                          className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-[#a1a1aa]" />
                        </button>
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-[#fafafa]">
                            {t("booking.title")}
                          </h2>
                          {selectedTrainerData && (
                            <p className="text-[#dc2626] text-sm font-medium mt-1">
                              {selectedTrainerData.name} — {selectedTrainerData.specialty}
                            </p>
                          )}
                        </div>
                      </div>

                      {!selectedTrainer ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {trainers.map((trainer) => (
                            <button
                              key={trainer.id}
                              onClick={() => setSelectedTrainer(trainer.id)}
                              className="flex items-center gap-4 p-4 bg-[#0a0a0a] border border-[#27272a] rounded-xl hover:border-[#dc2626] transition-all text-left"
                            >
                              <div className="w-16 h-16 rounded-full bg-[#27272a] flex items-center justify-center">
                                <User className="w-8 h-8 text-[#71717a]" />
                              </div>
                              <div>
                                <p className="text-[#fafafa] font-semibold">
                                  {trainer.name}
                                </p>
                                <p className="text-[#dc2626] text-sm">
                                  {trainer.specialty}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : !selectedDate ? (
                        <div>
                          <p className="text-[#a1a1aa] mb-6">
                            {t("booking.selectDate")}
                          </p>
                          <BookingCalendar
                            value={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            accent="red"
                          />
                        </div>
                      ) : !selectedSlot ? (
                        <div>
                          <p className="text-[#a1a1aa] mb-6">
                            {t("booking.selectTime")}
                          </p>
                          {availableSlots.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {availableSlots.map((slot) => (
                                <button
                                  key={slot.id}
                                  onClick={() => setSelectedSlot(slot.id)}
                                  className="p-4 bg-[#0a0a0a] border border-[#27272a] rounded-xl hover:border-[#dc2626] hover:bg-[#dc2626]/10 transition-all text-center"
                                >
                                  <Clock className="w-5 h-5 text-[#dc2626] mx-auto mb-2" />
                                  <p className="text-[#fafafa] font-medium">
                                    {slot.time}
                                  </p>
                                </button>
                              ))}
                            </div>
                          ) : trainerOnVacation ? (
                            <div className="text-center py-8">
                              <Palmtree className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                              <p className="text-[#fafafa] font-medium mb-1">{t('booking.trainerOnVacation')}</p>
                              <p className="text-[#71717a] text-sm">{t('booking.trainerOnVacationDesc')}</p>
                            </div>
                          ) : (
                            <p className="text-[#a1a1aa] text-center py-8">
                              {t("booking.noSlots")}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-[#a1a1aa] text-sm mb-2">
                              {t("booking.yourName")}
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (fieldErrors.name) setFieldErrors(prev => { const n = {...prev}; delete n.name; return n; });
                              }}
                              className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-xl text-[#fafafa] focus:outline-none transition-colors ${fieldErrors.name ? 'border-red-500 focus:border-red-500' : 'border-[#27272a] focus:border-[#dc2626]'}`}
                              placeholder="John Doe"
                              maxLength={100}
                            />
                            {fieldErrors.name && (
                              <p className="flex items-center gap-1 text-red-400 text-xs mt-1"><AlertCircle className="w-3 h-3" />{fieldErrors.name}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-[#a1a1aa] text-sm mb-2">
                              {t("booking.yourEmail")}
                            </label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                if (fieldErrors.email) setFieldErrors(prev => { const n = {...prev}; delete n.email; return n; });
                              }}
                              className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-xl text-[#fafafa] focus:outline-none transition-colors ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-[#27272a] focus:border-[#dc2626]'}`}
                              placeholder="john@example.com"
                            />
                            {fieldErrors.email && (
                              <p className="flex items-center gap-1 text-red-400 text-xs mt-1"><AlertCircle className="w-3 h-3" />{fieldErrors.email}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-[#a1a1aa] text-sm mb-2">
                              {t("booking.yourPhone")}
                            </label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => {
                                setFormData({ ...formData, phone: e.target.value });
                                if (fieldErrors.phone) setFieldErrors(prev => { const n = {...prev}; delete n.phone; return n; });
                              }}
                              className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-xl text-[#fafafa] focus:outline-none transition-colors ${fieldErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-[#27272a] focus:border-[#dc2626]'}`}
                              placeholder="+39 041 0000000"
                            />
                            {fieldErrors.phone && (
                              <p className="flex items-center gap-1 text-red-400 text-xs mt-1"><AlertCircle className="w-3 h-3" />{fieldErrors.phone}</p>
                            )}
                          </div>
                          {bookingError && (
                            <p className="text-red-500 text-sm text-center">
                              {bookingError}
                            </p>
                          )}
                          <button
                            onClick={handleBook}
                            disabled={
                              !formData.name ||
                              !formData.email ||
                              !formData.phone ||
                              isSubmitting
                            }
                            className="w-full py-4 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {t("booking.sendingRequest")}…
                              </span>
                            ) : (
                              t("booking.sendRequest")
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              </div>
            </section>
          )}
        </AnimatePresence>

        {/* Benefits Section */}
        <section className="py-16 sm:py-24 bg-[#111111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-4">
                {t("benefits.title")}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { key: "customized", icon: Target },
                { key: "accountability", icon: Users },
                { key: "faster", icon: Award },
                { key: "technique", icon: Shield },
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.key}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-[#0a0a0a] border border-[#27272a] rounded-2xl p-6 hover:border-[#dc2626]/30 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#dc2626]/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#dc2626]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#fafafa] mb-2">
                      {t(`benefits.${benefit.key}.title`)}
                    </h3>
                    <p className="text-[#a1a1aa] text-sm">
                      {t(`benefits.${benefit.key}.description`)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

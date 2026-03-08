"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  Info,
  Send,
  ThumbsUp,
  MessageSquare,
  ChevronDown,
  Filter,
  Quote,
} from "lucide-react";

interface Review {
  id: number;
  trainer_id: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  title: string | null;
  comment: string;
  created_at: string;
}

interface ReviewAverage {
  trainer_id: string;
  avg_rating: number;
  review_count: number;
}

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
  const [specialtyTrainerId, setSpecialtyTrainerId] = useState<string | null>(null);
  const { toast } = useToast();

  // ── Review system state ──
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewAverages, setReviewAverages] = useState<ReviewAverage[]>([]);
  const [reviewTrainerFilter, setReviewTrainerFilter] = useState<string>("all");
  const [reviewSort, setReviewSort] = useState<"recent" | "highest" | "lowest">("recent");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormTrainer, setReviewFormTrainer] = useState<string>("");
  const [reviewFormData, setReviewFormData] = useState({ name: "", email: "", title: "", comment: "" });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [visibleReviews, setVisibleReviews] = useState(6);
  const reviewsSectionRef = useRef<HTMLElement>(null);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setReviewAverages(data.averages ?? []);
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const getTrainerReviewStats = (trainerId: string) => {
    const avg = reviewAverages.find((a) => a.trainer_id === trainerId);
    return { avgRating: avg?.avg_rating ?? 0, reviewCount: avg?.review_count ?? 0 };
  };

  const handleSubmitReview = async () => {
    setReviewError(null);
    if (!reviewFormTrainer) return;
    if (reviewRating === 0) { setReviewError(t("reviews.selectRating")); return; }
    if (reviewFormData.comment.trim().length < 10) { setReviewError(t("reviews.minChars")); return; }

    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerId: reviewFormTrainer,
          reviewerName: reviewFormData.name.trim(),
          reviewerEmail: reviewFormData.email.trim(),
          rating: reviewRating,
          title: reviewFormData.title.trim() || null,
          comment: reviewFormData.comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit review");
      setReviewSuccess(true);
      toast(t("reviews.thankYou"));
      await fetchReviews();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setReviewError(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filteredReviews = reviews
    .filter((r) => reviewTrainerFilter === "all" || r.trainer_id === reviewTrainerFilter)
    .sort((a, b) => {
      if (reviewSort === "highest") return b.rating - a.rating;
      if (reviewSort === "lowest") return a.rating - b.rating;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

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

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
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
                  <div className="aspect-[3/4] sm:aspect-4/5 bg-linear-to-b from-[#27272a] to-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
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
                    {(() => {
                      const stats = getTrainerReviewStats(trainer.id);
                      const displayRating = stats.reviewCount > 0 ? stats.avgRating : trainer.rating;
                      const displayRatingFormatted = typeof displayRating === 'number' ? (Math.round(displayRating * 10) / 10).toFixed(1) : displayRating;
                      return (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#0a0a0a]/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#27272a] z-10">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-[#fafafa] font-semibold text-sm">
                            {displayRatingFormatted}
                          </span>
                          {stats.reviewCount > 0 && (
                            <span className="text-[#71717a] text-xs">
                              ({stats.reviewCount})
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Info Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSpecialtyTrainerId(
                          specialtyTrainerId === trainer.id ? null : trainer.id,
                        );
                      }}
                      className="absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm rounded-full border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#dc2626] transition-all"
                      title="View specializations"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Specialization Popover */}
                  <AnimatePresence>
                    {specialtyTrainerId === trainer.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-[#27272a] bg-[#0a0a0a]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-5 space-y-3">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
                              Specialization
                            </span>
                          </div>
                          <p className="text-[#dc2626] font-semibold text-sm">
                            {trainer.specialty}
                          </p>
                          <p className="text-[#a1a1aa] text-xs leading-relaxed">
                            {trainer.description}
                          </p>
                          <div className="flex items-center gap-1 pt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.round(trainer.rating)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-[#3f3f46]'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-[#71717a] ml-1">
                              {trainer.rating}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Trainer Info */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-xl font-bold text-[#fafafa] mb-1 sm:mb-2 truncate">
                      {trainer.name}
                    </h3>
                    <p className="text-[#dc2626] font-medium text-xs sm:text-sm mb-2 sm:mb-3">
                      {trainer.specialty}
                    </p>
                    <p className="text-[#a1a1aa] text-xs sm:text-sm leading-relaxed line-clamp-2 hidden sm:block">
                      {trainer.description}
                    </p>

                    <button className="mt-3 sm:mt-4 w-full py-2 sm:py-2.5 rounded-lg border border-[#27272a] text-[#fafafa] text-sm font-medium hover:bg-[#dc2626] hover:border-[#dc2626] transition-all">
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

        {/* ── Write a Review Section ── */}
        <section className="py-16 sm:py-24 bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#dc2626]/5 rounded-full blur-[150px]" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-3 block">
                <MessageSquare className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                {t("reviews.writeReview")}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-3">
                {t("reviews.title")}
              </h2>
              <p className="text-[#a1a1aa] text-lg max-w-xl mx-auto">{t("reviews.subtitle")}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#111111] border border-[#27272a] rounded-3xl p-6 sm:p-10"
            >
              {reviewSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ThumbsUp className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#fafafa] mb-3">{t("reviews.thankYou")}</h3>
                  <p className="text-[#a1a1aa] mb-8">{t("reviews.thankYouMessage")}</p>
                  <button
                    onClick={() => {
                      setReviewSuccess(false);
                      setReviewFormData({ name: "", email: "", title: "", comment: "" });
                      setReviewRating(0);
                      setReviewFormTrainer("");
                      setReviewError(null);
                    }}
                    className="px-6 py-3 border border-[#27272a] text-[#fafafa] hover:border-[#dc2626] font-medium rounded-xl transition-all"
                  >
                    {t("reviews.writeAnother")}
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Trainer select */}
                  <div>
                    <label className="block text-[#a1a1aa] text-sm mb-2 font-medium">
                      {t("booking.selectTrainer")}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {trainers.map((tr) => (
                        <button
                          key={tr.id}
                          onClick={() => setReviewFormTrainer(tr.id)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center ${
                            reviewFormTrainer === tr.id
                              ? "border-[#dc2626] bg-[#dc2626]/10 shadow-lg shadow-[#dc2626]/10"
                              : "border-[#27272a] bg-[#0a0a0a] hover:border-[#dc2626]/50"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-[#27272a] overflow-hidden flex items-center justify-center">
                            <img src={tr.image} alt={tr.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                          </div>
                          <span className="text-[#fafafa] text-xs font-medium leading-tight">{tr.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div>
                    <label className="block text-[#a1a1aa] text-sm mb-3 font-medium">
                      {t("reviews.selectRating")}
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onMouseEnter={() => setReviewHoverRating(star)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                          onClick={() => setReviewRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              star <= (reviewHoverRating || reviewRating)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-[#3f3f46]"
                            }`}
                          />
                        </button>
                      ))}
                      {reviewRating > 0 && (
                        <span className="ml-3 text-[#fafafa] font-semibold text-lg">{reviewRating}.0</span>
                      )}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#a1a1aa] text-sm mb-2">{t("reviews.yourName")}</label>
                      <input
                        type="text"
                        value={reviewFormData.name}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-[#fafafa] focus:outline-none focus:border-[#dc2626] transition-colors"
                        placeholder="Mario Rossi"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="block text-[#a1a1aa] text-sm mb-2">{t("reviews.yourEmail")}</label>
                      <input
                        type="email"
                        value={reviewFormData.email}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-[#fafafa] focus:outline-none focus:border-[#dc2626] transition-colors"
                        placeholder="mario@email.com"
                      />
                    </div>
                  </div>

                  {/* Optional Title */}
                  <div>
                    <label className="block text-[#a1a1aa] text-sm mb-2">{t("reviews.reviewTitle")}</label>
                    <input
                      type="text"
                      value={reviewFormData.title}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-[#fafafa] focus:outline-none focus:border-[#dc2626] transition-colors"
                      placeholder={t("reviews.reviewTitlePlaceholder")}
                      maxLength={100}
                    />
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-[#a1a1aa] text-sm mb-2">{t("reviews.yourReview")}</label>
                    <textarea
                      value={reviewFormData.comment}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-[#fafafa] focus:outline-none focus:border-[#dc2626] transition-colors resize-none h-32"
                      placeholder={t("reviews.reviewPlaceholder")}
                      maxLength={1000}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[#52525b] text-xs">{t("reviews.minChars")}</span>
                      <span className="text-[#52525b] text-xs">{reviewFormData.comment.length}/1000</span>
                    </div>
                  </div>

                  {reviewError && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {reviewError}
                    </div>
                  )}

                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting || !reviewFormTrainer || reviewRating === 0 || !reviewFormData.name || !reviewFormData.email || reviewFormData.comment.length < 10}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {reviewSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t("reviews.submitting")}
                      </span>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {t("reviews.submitReview")}
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Reviews Display Section ── */}
        <section ref={reviewsSectionRef} className="py-16 sm:py-24 bg-[#111111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-3">
                {t("reviews.title")}
              </h2>
              <p className="text-[#a1a1aa] text-lg">{t("reviews.subtitle")}</p>
            </motion.div>

            {/* Rating Summary Cards */}
            {reviewAverages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10"
              >
                {trainers.map((tr) => {
                  const stats = getTrainerReviewStats(tr.id);
                  if (stats.reviewCount === 0) return null;
                  return (
                    <div
                      key={tr.id}
                      onClick={() => setReviewTrainerFilter(reviewTrainerFilter === tr.id ? "all" : tr.id)}
                      className={`bg-[#0a0a0a] border rounded-2xl p-4 cursor-pointer transition-all ${
                        reviewTrainerFilter === tr.id
                          ? "border-[#dc2626] shadow-lg shadow-[#dc2626]/10"
                          : "border-[#27272a] hover:border-[#dc2626]/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#27272a] overflow-hidden">
                          <img src={tr.image} alt={tr.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        </div>
                        <span className="text-[#fafafa] text-sm font-semibold truncate">{tr.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-[#fafafa] font-bold">{(Math.round(stats.avgRating * 10) / 10).toFixed(1)}</span>
                        <span className="text-[#71717a] text-xs">({stats.reviewCount})</span>
                      </div>
                      {/* Mini rating bar */}
                      <div className="mt-2 h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all"
                          style={{ width: `${(stats.avgRating / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setReviewTrainerFilter("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    reviewTrainerFilter === "all"
                      ? "bg-[#dc2626] text-white"
                      : "bg-[#0a0a0a] border border-[#27272a] text-[#a1a1aa] hover:border-[#dc2626]/50"
                  }`}
                >
                  {t("reviews.allTrainers")}
                </button>
                {trainers.map((tr) => {
                  const stats = getTrainerReviewStats(tr.id);
                  if (stats.reviewCount === 0) return null;
                  return (
                    <button
                      key={tr.id}
                      onClick={() => setReviewTrainerFilter(reviewTrainerFilter === tr.id ? "all" : tr.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        reviewTrainerFilter === tr.id
                          ? "bg-[#dc2626] text-white"
                          : "bg-[#0a0a0a] border border-[#27272a] text-[#a1a1aa] hover:border-[#dc2626]/50"
                      }`}
                    >
                      {tr.name}
                    </button>
                  );
                })}
              </div>
              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value as "recent" | "highest" | "lowest")}
                className="bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-2 text-sm text-[#fafafa] focus:border-[#dc2626] focus:outline-none cursor-pointer"
              >
                <option value="recent">{t("reviews.sortRecent")}</option>
                <option value="highest">{t("reviews.sortHighest")}</option>
                <option value="lowest">{t("reviews.sortLowest")}</option>
              </select>
            </motion.div>

            {/* Reviews Grid */}
            {filteredReviews.length === 0 ? (
              <div className="text-center py-16">
                <Quote className="w-12 h-12 text-[#3f3f46] mx-auto mb-4" />
                <p className="text-[#a1a1aa] text-lg">{t("reviews.noReviews")}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredReviews.slice(0, visibleReviews).map((review, idx) => {
                    const reviewTrainer = trainers.find((tr) => tr.id === review.trainer_id);
                    return (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-[#0a0a0a] border border-[#27272a] rounded-2xl p-6 hover:border-[#27272a]/80 transition-all group"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center text-white font-bold text-sm">
                              {review.reviewer_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[#fafafa] font-semibold text-sm">{review.reviewer_name}</p>
                              <p className="text-[#71717a] text-xs">
                                {new Date(review.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-4 h-4 ${
                                  s <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-[#3f3f46]"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Trainer Tag */}
                        {reviewTrainer && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#dc2626]/10 rounded-full mb-3">
                            <div className="w-4 h-4 rounded-full bg-[#27272a] overflow-hidden">
                              <img src={reviewTrainer.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                            </div>
                            <span className="text-[#dc2626] text-xs font-medium">{reviewTrainer.name}</span>
                          </div>
                        )}

                        {/* Content */}
                        {review.title && (
                          <h4 className="text-[#fafafa] font-semibold mb-2">{review.title}</h4>
                        )}
                        <p className="text-[#a1a1aa] text-sm leading-relaxed">{review.comment}</p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Show More / Less */}
                {filteredReviews.length > 6 && (
                  <div className="text-center mt-8">
                    {visibleReviews < filteredReviews.length ? (
                      <button
                        onClick={() => setVisibleReviews((prev) => prev + 6)}
                        className="inline-flex items-center gap-2 px-6 py-3 border border-[#27272a] text-[#fafafa] hover:border-[#dc2626] rounded-xl font-medium transition-all"
                      >
                        <ChevronDown className="w-4 h-4" />
                        {t("reviews.showMore")}
                      </button>
                    ) : (
                      <button
                        onClick={() => setVisibleReviews(6)}
                        className="inline-flex items-center gap-2 px-6 py-3 border border-[#27272a] text-[#a1a1aa] hover:border-[#dc2626] rounded-xl font-medium transition-all"
                      >
                        {t("reviews.showLess")}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

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

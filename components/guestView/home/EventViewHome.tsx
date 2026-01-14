"use client";
import { app } from "@/lib/firebase";
import { collection, getDocs, getFirestore, orderBy, query } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowRight, FiCalendar, FiClock, FiExternalLink } from "react-icons/fi";
import { IoSparkles, IoTimeOutline } from "react-icons/io5";

interface Event {
  id: string;
  eventName: string;
  dateEvent: string;
  imageUrl: string;
  descriptionEvent: string;
  linkForm: string;
  statusEvent?: string;
  timeEvent?: string;
  categoryEvent?: string;
}

export default function EventViewHome() {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const db = getFirestore(app);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("dateEvent", "desc"));
        const querySnapshot = await getDocs(q);
        const eventList = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Event,
        );

        const filteredEvents = eventList.filter((event) => !["festi", "sibarmati"].includes(event.eventName?.toLowerCase() || ""));

        setEvents(filteredEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, [db]);

  useEffect(() => {
    if (events.length <= 1 || isHovered || !isVisible) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length, isHovered, isVisible]);

  const formatDate = (dateString: string) => {
    try {
      const [day, month, year] = dateString.split("/");
      const date = new Date(`${year}-${month}-${day}`);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Selesai":
        return "bg-green-100 text-green-800";
      case "Sedang Berlangsung":
        return "bg-blue-100 text-blue-800";
      case "Coming Soon":
        return "bg-yellow-100 text-yellow-800";
      case "Batal":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]"></div>

        {/* Floating shapes */}
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-cyan-300/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
            <IoSparkles className="text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Event Terbaru</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Kegiatan</span> HMPTI
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">Event berkualitas untuk pengembangan kompetensi mahasiswa Teknik Informatika</p>
        </motion.div>

        {/* Event cards */}
        {events.length > 0 ? (
          <div className="relative">
            {/* Desktop grid view */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-8">
              {events.slice(0, 3).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, transform: "translateY(50px)" }}
                  whileInView={{ opacity: 1, transform: "translateY(0px)" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="h-full bg-white rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-200/30 hover:-translate-y-2 will-change-transform border border-gray-100">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.eventName}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 will-change-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(event.statusEvent)}`}>{event.statusEvent}</span>
                      </div>
                      {event.categoryEvent && (
                        <div className="absolute top-4 left-4">
                          <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded">{event.categoryEvent}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                          <FiCalendar className="text-blue-500" />
                          {formatDate(event.dateEvent)}
                        </span>
                        {event.timeEvent && (
                          <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                            <FiClock className="text-blue-500" />
                            {event.timeEvent}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{event.eventName}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{event.descriptionEvent}</p>
                      <Link href={`/pages/event/${event.id}`} className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors group/link">
                        Detail Event
                        <FiArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile carousel */}
            <div className="md:hidden relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
              <div className="overflow-hidden rounded-2xl">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={events[activeIndex]?.id}
                    initial={{ opacity: 0, transform: "translateX(100%)" }}
                    animate={{ opacity: 1, transform: "translateX(0%)" }}
                    exit={{ opacity: 0, transform: "translateX(-100%)" }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                  >
                    {events[activeIndex] && (
                      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="aspect-video relative overflow-hidden">
                          <img src={events[activeIndex].imageUrl} alt={events[activeIndex].eventName} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                          <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(events[activeIndex].statusEvent)}`}>
                              {events[activeIndex].statusEvent}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                              <FiCalendar className="text-blue-500" />
                              {formatDate(events[activeIndex].dateEvent)}
                            </span>
                            {events[activeIndex].timeEvent && (
                              <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                                <FiClock className="text-blue-500" />
                                {events[activeIndex].timeEvent}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{events[activeIndex].eventName}</h3>
                          <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{events[activeIndex].descriptionEvent}</p>
                          <Link href={`/pages/event/${events[activeIndex].id}`} className="inline-flex items-center gap-2 text-blue-600 font-medium">
                            Detail Event
                            <FiArrowRight />
                          </Link>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Carousel indicators */}
              {events.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {events.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${activeIndex === index ? "bg-blue-600 w-6" : "bg-gray-300 hover:bg-gray-400"}`}
                      aria-label={`Go to event ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Navigation arrows for mobile */}
              {events.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveIndex((prev) => (prev - 1 + events.length) % events.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                    aria-label="Previous event"
                  >
                    <FiArrowRight className="text-gray-700 rotate-180" />
                  </button>
                  <button
                    onClick={() => setActiveIndex((prev) => (prev + 1) % events.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                    aria-label="Next event"
                  >
                    <FiArrowRight className="text-gray-700" />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <IoTimeOutline className="text-gray-400 text-3xl" />
            </div>
            <p className="text-gray-500 text-lg">Tidak ada event yang tersedia saat ini</p>
            <p className="text-gray-400 text-sm mt-2">Event baru akan segera hadir</p>
          </motion.div>
        )}

        {/* CTA section */}
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              href="/pages/event"
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all group/cta"
            >
              <span>Lihat Semua Event</span>
              <FiExternalLink className="group-hover/cta:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

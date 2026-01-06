"use client";
import { app } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowRight, FiCalendar, FiChevronRight, FiClock, FiUser, FiArrowLeft, FiShare2, FiExternalLink } from "react-icons/fi";
import { IoSparkles, IoCalendarOutline, IoTimeOutline, IoPeopleOutline } from "react-icons/io5";

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
  highlights?: string[];
  organizer?: string;
  location?: string;
  capacity?: number;
}

export default function EventDetail() {
  const [event, setEvent] = useState<Event | null>(null);
  const [latestEvents, setLatestEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = useParams();
  const db = getFirestore(app);

  useEffect(() => {
    if (!id) {
      router.push("/pages/event");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current event
        const eventDoc = await getDoc(doc(db, "events", id as string));
        if (!eventDoc.exists()) {
          throw new Error("Event tidak ditemukan");
        }
        const currentEvent = { id: eventDoc.id, ...eventDoc.data() } as Event;
        setEvent(currentEvent);

        // Fetch latest events with fallback
        try {
          const eventsRef = collection(db, "events");
          const q = query(
            eventsRef,
            where("id", "!=", id),
            orderBy("dateEvent", "desc"),
            limit(4)
          );
          const snapshot = await getDocs(q);
          const eventsList = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as Event
          );
          setLatestEvents(eventsList);
        } catch (queryError) {
          console.warn("Index error, falling back to client-side filtering:", queryError);
          const eventsRef = collection(db, "events");
          const q = query(eventsRef, orderBy("dateEvent", "desc"), limit(10));
          const snapshot = await getDocs(q);
          const eventsList = snapshot.docs
            .filter((doc) => doc.id !== id)
            .slice(0, 4)
            .map((doc) => ({ id: doc.id, ...doc.data() }) as Event);
          setLatestEvents(eventsList);
        }
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, db, router]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Selesai":
        return "bg-green-100 text-green-800";
      case "Sedang Berlangsung":
        return "bg-blue-100 text-blue-800";
      case "Coming Soon":
        return "bg-yellow-100 text-yellow-800";
      case "Cooming Soon":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      'Web Development': 'bg-blue-100 text-blue-800',
      'UI/UX': 'bg-purple-100 text-purple-800',
      'Data Science': 'bg-green-100 text-green-800',
      'Mobile Development': 'bg-orange-100 text-orange-800',
      'Cyber Security': 'bg-red-100 text-red-800',
      'Workshop': 'bg-cyan-100 text-cyan-800',
      'Seminar': 'bg-indigo-100 text-indigo-800',
      'Competition': 'bg-pink-100 text-pink-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category || 'default'] || colors.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoCalendarOutline className="text-red-600 text-2xl" />
          </div>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Link 
            href="/pages/event" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <FiArrowLeft className="text-sm" />
            Kembali ke halaman event
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pt-12">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/pages/event"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Event
          </Link>
        </motion.div>

        {/* Event Detail Section */}
        <article className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 p-8"
          >
            {/* Header with category and status */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                {event.categoryEvent && (
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getCategoryColor(event.categoryEvent)}`}>
                    {event.categoryEvent}
                  </span>
                )}
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(event.statusEvent)}`}>
                  {event.statusEvent}
                </span>
              </div>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <FiShare2 size={18} />
              </button>
            </div>

            {/* Event Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {event.eventName}
            </h1>

            {/* Event Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <FiCalendar className="text-blue-500" />
                  <span className="font-medium">{formatDate(event.dateEvent)}</span>
                </div>
                {event.timeEvent && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FiClock className="text-blue-500" />
                    <span className="font-medium">{event.timeEvent}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {event.organizer && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <IoPeopleOutline className="text-blue-500" />
                    <span className="font-medium">{event.organizer}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FiUser className="text-blue-500" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative aspect-video w-full mb-8 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={event.imageUrl}
                alt={event.eventName}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              />
            </div>

            {/* Event Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <IoSparkles className="text-blue-600" />
                  Highlights Event
                </h3>
                <ul className="space-y-3">
                  {event.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 mt-1.5 mr-3 w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-gray-700 leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Event Description */}
            <div className="prose prose-lg max-w-none text-gray-700 mb-8">
              <p className="text-lg leading-relaxed whitespace-pre-line">
                {event.descriptionEvent}
              </p>
            </div>

            {/* Registration CTA */}
            {event.statusEvent === "Sedang Berlangsung" && event.linkForm && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100"
              >
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Tertarik untuk bergabung?</h3>
                <p className="text-gray-600 mb-4">Daftar sekarang dan jadilah bagian dari event ini!</p>
                <a
                  href={event.linkForm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all"
                >
                  <span>Daftar Sekarang</span>
                  <FiExternalLink className="text-sm" />
                </a>
              </motion.div>
            )}
          </motion.div>
        </article>

        {/* Latest Events Section */}
        <section className="mt-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 p-8"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Lainnya</span>
              </h2>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </div>

            {latestEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {latestEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ y: -5 }}
                    className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all border border-gray-100 group"
                  >
                    <Link href={`/pages/event/${event.id}`} className="block h-full">
                      <div className="relative aspect-video">
                        <Image
                          src={event.imageUrl}
                          alt={event.eventName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          {event.categoryEvent && (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(event.categoryEvent)}`}>
                              {event.categoryEvent}
                            </span>
                          )}
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.statusEvent)}`}>
                            {event.statusEvent}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {event.eventName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <FiCalendar size={12} />
                          <span>{formatDate(event.dateEvent)}</span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                          {event.descriptionEvent}
                        </p>
                        <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                          Lihat detail
                          <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <IoCalendarOutline className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-500">Belum ada event lainnya</p>
              </div>
            )}

            <div className="text-center mt-12">
              <Link
                href="/pages/event"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all group/cta"
              >
                <span>Lihat Semua Event</span>
                <FiChevronRight className="group-hover/cta:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
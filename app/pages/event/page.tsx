"use client";
import { app } from "@/lib/firebase";
import { collection, getDocs, getFirestore, orderBy, query } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowRight, FiCalendar, FiChevronLeft, FiChevronRight, FiExternalLink } from "react-icons/fi";
import { IoSparkles, IoCalendarOutline } from "react-icons/io5";

interface Event {
  id: string;
  eventName: string;
  dateEvent: string;
  imageUrl: string;
  descriptionEvent: string;
  linkForm: string;
  statusEvent?: string;
  categoryEvent?: string;
  timeEvent?: string;
}

function HeroViewEvent() {
  return (
    <section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-cyan-700/90"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')]"></div>
        
        {/* Floating shapes */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6"
        >
          <IoSparkles className="text-white" />
          <span className="text-sm font-medium text-white">Event & Kegiatan</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight text-white"
        >
          BERSAMA MEMBANGUN <span className="text-cyan-300">MASA DEPAN</span> TEKNOLOGI
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg text-white/90 max-w-3xl mx-auto uppercase tracking-wide"
        >
          Ikuti perkembangan terbaru, eksplorasi inovasi, dan jadi bagian dari perubahan!
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
   

          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function EventView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const eventsPerPage = 8;
  const router = useRouter();
  const db = getFirestore(app);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("dateEvent", "desc"));
        const eventSnapshot = await getDocs(q);
        const eventList = eventSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];

        setEvents(eventList);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [db]);

  const startIndex = currentPage * eventsPerPage;
  const selectedEvents = events.slice(startIndex, startIndex + eventsPerPage);
  const totalPages = Math.ceil(events.length / eventsPerPage);

  const statusColor = (status?: string) => {
    switch (status) {
      case "Selesai":
        return "bg-green-100 text-green-800";
      case "Berlangsung":
        return "bg-blue-100 text-blue-800";
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

  const formatDate = (dateString: string) => {
    try {
      const [day, month, year] = dateString.split('/');
      const date = new Date(`${year}-${month}-${day}`);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <section className="relative w-full py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]"></div>
        
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
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
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
            <IoCalendarOutline className="text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Semua Event</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Kegiatan
            </span>{' '}
            HMPTI
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Temukan kegiatan terbaru dan menarik dari HMPTI Universitas Duta Bangsa
          </p>
        </motion.div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: eventsPerPage }).map((_, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {selectedEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-blue-200/30 hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push(`/pages/event/${event.id}`)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <div className="relative aspect-square">
                      <Image 
                        src={event.imageUrl} 
                        alt={event.eventName} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                      />
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${statusColor(event.statusEvent)}`}>
                          {event.statusEvent}
                        </span>
                      </div>
                      {event.categoryEvent && (
                        <div className="absolute top-4 left-4">
                          <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded">
                            {event.categoryEvent}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                          <FiCalendar className="text-blue-500" />
                          {formatDate(event.dateEvent)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{event.eventName}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">{event.descriptionEvent}</p>
                      <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                        Lihat detail 
                        <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty state */}
            {events.length === 0 && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 inline-block">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IoCalendarOutline className="text-gray-400 text-2xl" />
                  </div>
                  <p className="text-gray-500">Belum ada event yang tersedia</p>
                  <p className="text-gray-400 text-sm mt-2">Event baru akan segera hadir</p>
                </div>
              </motion.div>
            )}

            {/* Pagination */}
            {events.length > eventsPerPage && (
              <div className="flex justify-center items-center mt-12 gap-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className={`p-3 rounded-full shadow-lg ${currentPage === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white text-blue-600 hover:bg-blue-50 border border-gray-200"}`}
                >
                  <FiChevronLeft size={20} />
                </motion.button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx;
                    } else if (currentPage < 3) {
                      pageNum = idx;
                    } else if (currentPage > totalPages - 4) {
                      pageNum = totalPages - 5 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-full font-medium ${
                          currentPage === pageNum 
                            ? "bg-blue-600 text-white shadow-lg" 
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === totalPages - 1}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className={`p-3 rounded-full shadow-lg ${
                    currentPage === totalPages - 1 
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-blue-600 hover:bg-blue-50 border border-gray-200"
                  }`}
                >
                  <FiChevronRight size={20} />
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default function EventPage() {
  return (
    <main className="min-h-screen">
      <HeroViewEvent />
      <EventView />
    </main>
  );
}
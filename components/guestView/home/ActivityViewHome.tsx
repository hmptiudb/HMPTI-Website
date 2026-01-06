"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FiCalendar, FiExternalLink, FiUsers, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { IoSparkles } from "react-icons/io5";

interface Event {
  id: string;
  eventName: string;
  imageUrl: string;
  descriptionEvent: string;
  statusEvent?: string;
  linkForm: string;
  categoryAudiens?: string;
  categoryEvent?: string;
}

export default function ActivityViewHome() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0);

  // Data statis event
  const staticEvents: Event[] = [
    {
      id: "1",
      eventName: "SIBARMATI",
      imageUrl: "/assets/image/sibarmati.png",
      descriptionEvent: "Seminar dan Workshop Teknologi Informasi",
      statusEvent: "active",
      linkForm: "#",
      categoryAudiens: "Mahasiswa",
      categoryEvent: "Seminar"
    },
    {
      id: "2",
      eventName: "FESTI",
      imageUrl: "/assets/image/festii.png",
      descriptionEvent: "Festival Teknologi dan Inovasi",
      statusEvent: "upcoming",
      linkForm: "#",
      categoryAudiens: "Umum",
      categoryEvent: "Festival"
    },
    {
      id: "3",
      eventName: "NGOBAR",
      imageUrl: "/assets/image/ngobar.png",
      descriptionEvent: "Ngoding Bareng",
      statusEvent: "upcoming",
      linkForm: "#",
      categoryAudiens: "Umum",
      categoryEvent: "Workshop"
    }
  ];

  useEffect(() => {
    // Gunakan data statis
    setEvents(staticEvents);
  }, []);

  useEffect(() => {
    if (events.length === 0 || isHovered) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [events, isHovered]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
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
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          viewport={{ once: true }} 
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
            <IoSparkles className="text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Program Unggulan</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="relative inline-block">
              <span className="relative z-10">Kegiatan</span>
              <span className="absolute bottom-0 left-0 w-full h-3 bg-blue-100 opacity-60 -z-0"></span>
            </span>
            {' '}HMPTI
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Event berkualitas untuk pengembangan kompetensi mahasiswa Teknik Informatika
          </p>
        </motion.div>

        {/* Event content */}
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Event image carousel */}
          <div className="w-full lg:w-1/2 relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {events.length > 0 ? (
              <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-blue-500/10 border border-gray-100">
                <AnimatePresence custom={direction} mode="popLayout" initial={false}>
                  <motion.div
                    key={events[currentIndex].id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                    className="aspect-video w-full relative"
                  >
                    <img 
                      src={events[currentIndex].imageUrl} 
                      alt={events[currentIndex].eventName} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    
                    {/* Event info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <motion.span
                        className="inline-block px-3 py-1.5 text-xs font-semibold tracking-wider text-white uppercase bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-3"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {events[currentIndex].categoryEvent || "events"}
                      </motion.span>
                      
                      <motion.h3 
                        className="text-2xl sm:text-3xl font-bold mb-3" 
                        initial={{ y: 10, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        transition={{ delay: 0.3 }}
                      >
                        {events[currentIndex].eventName}
                      </motion.h3>
                      
                      <motion.div 
                        className="flex items-center gap-4 text-sm" 
                        initial={{ y: 10, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        transition={{ delay: 0.4 }}
                      >
               
                        <span className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full">
                          <FiUsers className="text-blue-300" />
                          {events[currentIndex].categoryAudiens || "Mahasiswa"}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                {events.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                      aria-label="Previous slide"
                    >
                      <FiArrowLeft className="text-gray-700" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                      aria-label="Next slide"
                    >
                      <FiArrowRight className="text-gray-700" />
                    </button>
                  </>
                )}

                {/* Navigation dots */}
                {events.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {events.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setDirection(index > currentIndex ? 1 : -1);
                          setCurrentIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentIndex === index 
                            ? "bg-white w-6" 
                            : "bg-white/50 hover:bg-white/80"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCalendar className="text-gray-400 text-2xl" />
                  </div>
                  <p className="text-gray-500">Belum ada event tersedia</p>
                </div>
              </div>
            )}
          </div>

          {/* Event description */}
          <div className="w-full lg:w-1/2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5, delay: 0.2 }} 
              viewport={{ once: true }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                  Event Berkualitas
                </span>{' '}
                untuk Pengembangan Diri
              </h3>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                HMPTI Universitas Duta Bangsa menyelenggarakan berbagai program unggulan 
                untuk meningkatkan kompetensi teknis dan soft skill mahasiswa Informatika.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Seminar dan workshop dengan praktisi industri",
                  "Kompetisi untuk mengasah kemampuan teknis",
                  "Kegiatan sosial untuk pengembangan karakter"
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start gap-4 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      </div>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            
          </div>
        </div>
      </div>
    </section>
  );
}
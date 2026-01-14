"use client";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowRight, FiCalendar, FiChevronLeft, FiChevronRight, FiExternalLink, FiUser } from "react-icons/fi";
import { IoNewspaperOutline } from "react-icons/io5";

interface NewsItem {
  id: string;
  titleNews: string;
  descriptionNews: string;
  writterNews: string;
  categoryNews?: string;
  imageUrl: string;
  dateCreated: string;
  createdAt: string | number | Date;
}

export default function NewsViewHome() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const q = query(collection(db, "news"), orderBy("dateCreated", "desc"));
        const querySnapshot = await getDocs(q);
        const newsData = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as NewsItem,
        );
        setNews(newsData);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    if (news.length <= 1 || !isAutoPlaying || isHovered || !isVisible) return;

    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [news.length, isAutoPlaying, isHovered, isVisible]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? news.length - 1 : prev - 1));
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === news.length - 1 ? 0 : prev + 1));
    setIsAutoPlaying(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const variants = {
    enter: (direction: number) => ({
      transform: `translateX(${direction > 0 ? "100%" : "-100%"})`,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      transform: "translateX(0%)",
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      transform: `translateX(${direction < 0 ? "100%" : "-100%"})`,
      opacity: 0,
      scale: 0.96,
    }),
  };

  const getCategoryColor = (category: string | undefined) => {
    const colors: Record<string, string> = {
      Teknologi: "bg-blue-100 text-blue-800",
      Lifestyle: "bg-pink-100 text-pink-800",
      Art: "bg-purple-100 text-purple-800",
      Ekonomi: "bg-green-100 text-green-800",
      Sejarah: "bg-yellow-100 text-yellow-800",
      Pendidikan: "bg-indigo-100 text-indigo-800",
      Olahraga: "bg-red-100 text-red-800",
      Hiburan: "bg-orange-100 text-orange-800",
      Hukum: "bg-gray-100 text-gray-800",
      Politik: "bg-teal-100 text-teal-800",
    };

    return colors[category || "Teknologi"] || "bg-gray-100 text-gray-800";
  };

  return (
    <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]"></div>

        {/* Floating shapes */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"
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
          className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-300/15 rounded-full blur-3xl"
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
        <motion.div
          initial={{ opacity: 0, transform: "translateY(20px)" }}
          whileInView={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
            <IoNewspaperOutline className="text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Berita Terbaru</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Update Terkini</span> HMPTI
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">Kegiatan, prestasi, dan informasi terbaru dari Himpunan Mahasiswa Teknik Informatika</p>
        </motion.div>

        {/* News carousel */}
        <div className="relative">
          {news.length > 0 ? (
            <>
              <div
                className="relative h-[600px] w-full overflow-hidden rounded-2xl shadow-2xl shadow-blue-500/10 bg-white border border-gray-100"
                onMouseEnter={() => {
                  setIsHovered(true);
                  setIsAutoPlaying(false);
                }}
                onMouseLeave={() => {
                  setIsHovered(false);
                  setIsAutoPlaying(true);
                }}
              >
                <AnimatePresence custom={direction} initial={false}>
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 flex flex-col lg:flex-row will-change-transform"
                  >
                    {/* News image */}
                    <div className="w-full lg:w-1/2 h-72 lg:h-full relative">
                      <Image src={news[currentIndex].imageUrl} alt={news[currentIndex].titleNews} fill className="object-cover" priority={false} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent lg:bg-gradient-to-r lg:from-black/20 lg:via-transparent lg:to-transparent"></div>

                      {/* Category badge */}
                      <div className="absolute top-6 left-6">
                        {news[currentIndex].categoryNews && (
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getCategoryColor(news[currentIndex].categoryNews)}`}>
                            {news[currentIndex].categoryNews}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* News content */}
                    <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col justify-center bg-white">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 flex-wrap">
                        <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                          <FiCalendar className="text-blue-500" />
                          {formatDate(news[currentIndex].dateCreated)}
                        </span>
                        <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                          <FiUser className="text-blue-500" />
                          {news[currentIndex].writterNews}
                        </span>
                      </div>

                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">{news[currentIndex].titleNews}</h3>

                      <p className="text-gray-600 mb-6 line-clamp-4 leading-relaxed">{news[currentIndex].descriptionNews}</p>

                      <Link
                        href={`/pages/news/${news[currentIndex].id}`}
                        className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors group/link"
                      >
                        Baca Selengkapnya
                        <FiArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all z-10 backdrop-blur-sm"
                aria-label="Previous news"
              >
                <FiChevronLeft className="text-gray-700 text-xl" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all z-10 backdrop-blur-sm"
                aria-label="Next news"
              >
                <FiChevronRight className="text-gray-700 text-xl" />
              </button>

              {/* Indicators */}
              {news.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {news.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setDirection(index > currentIndex ? 1 : -1);
                        setCurrentIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${currentIndex === index ? "bg-blue-600 w-6" : "bg-gray-300 hover:bg-gray-400"}`}
                      aria-label={`Go to news ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, transform: "translateY(20px)" }}
              whileInView={{ opacity: 1, transform: "translateY(0px)" }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoNewspaperOutline className="text-gray-400 text-2xl" />
              </div>
              <p className="text-gray-500">Tidak ada berita tersedia saat ini</p>
              <p className="text-gray-400 text-sm mt-2">Berita terbaru akan segera hadir</p>
            </motion.div>
          )}
        </div>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, transform: "translateY(20px)" }}
          whileInView={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link
            href="/news"
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all group/cta"
          >
            <span>Lihat Semua Berita</span>
            <FiExternalLink className="group-hover/cta:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

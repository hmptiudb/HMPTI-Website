"use client";
import { newsCollection } from "@/lib/firebase";
import { getDocs, orderBy, query } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiUser, FiArrowRight } from "react-icons/fi";
import { IoSparkles, IoNewspaperOutline } from "react-icons/io5";

function HeroViewNews() {
  return (
    <section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-indigo-700/90"></div>
      
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
          className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"
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
          <IoNewspaperOutline className="text-white" />
          <span className="text-sm font-medium text-white">Berita & Artikel</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight text-white"
        >
          BERITA <span className="text-blue-300">TERKINI,</span> INFORMASI TERPERCAYA!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg text-white/90 max-w-3xl mx-auto uppercase tracking-wide"
        >
          Selalu Update dengan Kabar Terbaru di Dunia Teknologi dan Kampus!
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

function NewsContent() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const newsPerPage = 8;
  const router = useRouter();

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

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const q = query(newsCollection, orderBy("dateCreated", "desc"));
        const newsSnapshot = await getDocs(q);
        const newsList = newsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as NewsItem[];

        setNews(newsList);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const startIndex = currentPage * newsPerPage;
  const selectedNews = news.slice(startIndex, startIndex + newsPerPage);
  const totalPages = Math.ceil(news.length / newsPerPage);

  const categoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      'Acara': 'bg-blue-100 text-blue-800',
      'Pengumuman': 'bg-purple-100 text-purple-800',
      'Prestasi': 'bg-green-100 text-green-800',
      'Teknologi': 'bg-cyan-100 text-cyan-800',
      'Pendidikan': 'bg-indigo-100 text-indigo-800',
      'Hiburan': 'bg-orange-100 text-orange-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    
    return colors[category || 'default'] || colors.default;
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
          className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-300/15 rounded-full blur-3xl"
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
          viewport={{ once: true }} 
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
            <IoSparkles className="text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Update Terbaru</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Berita
            </span>{' '}
            HMPTI
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Update terbaru dari kegiatan dan perkembangan HMPTI Universitas Duta Bangsa
          </p>
        </motion.div>

        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: newsPerPage }).map((_, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="aspect-video bg-gray-200 animate-pulse" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {selectedNews.map((newsItem) => (
                  <motion.div
                    key={newsItem.id}
                    className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-blue-200/30 hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push(`/pages/news/${newsItem.id}`)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <div className="relative aspect-video">
                      <Image 
                        src={newsItem.imageUrl} 
                        alt={newsItem.titleNews} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                      />
                      {newsItem.categoryNews && (
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${categoryColor(newsItem.categoryNews)}`}>
                            {newsItem.categoryNews}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {newsItem.titleNews}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                        {newsItem.descriptionNews}
                      </p>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-100 p-2 rounded-full">
                            <FiUser className="text-gray-600 text-sm" />
                          </div>
                          <span className="text-sm text-gray-600">{newsItem.writterNews}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FiCalendar className="text-blue-500" size={14} />
                          <span>{formatDate(newsItem.dateCreated)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty state */}
            {news.length === 0 && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 inline-block">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IoNewspaperOutline className="text-gray-400 text-2xl" />
                  </div>
                  <p className="text-gray-500">Belum ada berita yang tersedia</p>
                  <p className="text-gray-400 text-sm mt-2">Berita terbaru akan segera hadir</p>
                </div>
              </motion.div>
            )}

            {/* Pagination */}
            {news.length > newsPerPage && (
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
                    } else if (currentPage < 2) {
                      pageNum = idx;
                    } else if (currentPage > totalPages - 3) {
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

export default function NewsPage() {
  return (
    <main className="min-h-screen">
      <HeroViewNews />
      <NewsContent />
    </main>
  );
}
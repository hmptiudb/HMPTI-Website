"use client";
import { app } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query } from "firebase/firestore";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowRight, FiCalendar, FiChevronRight, FiUser, FiArrowLeft, FiShare2 } from "react-icons/fi";
import { IoSparkles, IoNewspaperOutline, IoTimeOutline } from "react-icons/io5";

interface NewsItem {
  id: string;
  titleNews: string;
  descriptionNews: string;
  imageUrl: string;
  categoryNews?: string;
  writterNews: string;
  dateCreated: string;
  content?: string;
}

export default function NewsDetail() {
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();
  const db = getFirestore(app);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch current news item
        const newsDoc = await getDoc(doc(db, "news", id as string));
        if (!newsDoc.exists()) {
          router.push("/pages/news");
          return;
        }
        setNewsItem({ id: newsDoc.id, ...newsDoc.data() } as NewsItem);

        // Fetch latest news
        const q = query(collection(db, "news"), orderBy("dateCreated", "desc"));
        const querySnapshot = await getDocs(q);
        const newsList = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as NewsItem,
        );

        setLatestNews(
          newsList
            .filter((item) => item.id !== id)
            .slice(0, 4)
        );
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 24) {
        return `${diffInHours} jam yang lalu`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} hari yang lalu`;
      }
    } catch {
      return dateString;
    }
  };

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

  // Fungsi untuk memformat teks dengan pemisahan paragraf
  const formatTextWithParagraphs = (text: string) => {
    if (!text) return [];
    
    // Pisahkan teks menjadi paragraf berdasarkan newline
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    
    // Jika tidak ada paragraf yang terpisah, coba pisahkan berdasarkan single newline
    if (paragraphs.length <= 1) {
      return text.split('\n').filter(p => p.trim().length > 0);
    }
    
    return paragraphs;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <IoNewspaperOutline className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Berita tidak ditemukan</p>
          <Link href="/pages/news" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Kembali ke Berita
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pt-16">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAwNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]"></div>
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
            href="/pages/news"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Berita
          </Link>
        </motion.div>

        {/* Article Section */}
        <article className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 p-8"
          >
            {/* Category and Date */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                {newsItem.categoryNews && (
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${categoryColor(newsItem.categoryNews)}`}>
                    {newsItem.categoryNews}
                  </span>
                )}
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <IoTimeOutline />
                  {formatTimeAgo(newsItem.dateCreated)}
                </span>
              </div>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <FiShare2 size={18} />
              </button>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {newsItem.titleNews}
            </h1>

            {/* Author and Date */}
            <div className="flex items-center gap-6 text-gray-500 mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiUser className="text-blue-600" />
                </div>
                <span className="font-medium">{newsItem.writterNews}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="text-blue-500" />
                <span>{formatDate(newsItem.dateCreated)}</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative aspect-video w-full mb-8 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={newsItem.imageUrl}
                alt={newsItem.titleNews}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none text-gray-700">
              {/* Deskripsi dengan format paragraf yang rapi */}
              <div className="space-y-4 mb-6">
                {formatTextWithParagraphs(newsItem.descriptionNews).map((paragraph, index) => (
                  <p key={index} className="text-lg leading-relaxed text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {/* Konten tambahan jika ada */}
              {newsItem.content && (
                <div className="space-y-4">
                  {formatTextWithParagraphs(newsItem.content).map((paragraph, index) => (
                    <p key={index} className="leading-relaxed text-justify">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
              <span className="text-sm text-gray-500">Tags:</span>
              {newsItem.categoryNews && (
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                  #{newsItem.categoryNews}
                </span>
              )}
              <span className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-full">
                #HMPTI
              </span>
              <span className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-full">
                #Informatika
              </span>
            </div>
          </motion.div>
        </article>

        {/* Latest News Section */}
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
                Berita <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Terkini</span> Lainnya
              </h2>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </div>

            {latestNews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {latestNews.map((news) => (
                  <motion.div
                    key={news.id}
                    whileHover={{ y: -5 }}
                    className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all border border-gray-100 group"
                  >
                    <Link href={`/pages/news/${news.id}`} className="block h-full">
                      <div className="relative aspect-video">
                        <Image
                          src={news.imageUrl}
                          alt={news.titleNews}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {news.categoryNews && (
                          <div className="absolute top-3 left-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryColor(news.categoryNews)}`}>
                              {news.categoryNews}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {news.titleNews}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <FiCalendar size={12} />
                          <span>{formatTimeAgo(news.dateCreated)}</span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed text-justify">
                          {news.descriptionNews}
                        </p>
                        <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                          Baca selengkapnya
                          <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <IoNewspaperOutline className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada berita lainnya</p>
              </div>
            )}

            <div className="text-center mt-12">
              <Link
                href="/pages/news"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all group/cta"
              >
                <span>Lihat Semua Berita</span>
                <FiChevronRight className="group-hover/cta:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
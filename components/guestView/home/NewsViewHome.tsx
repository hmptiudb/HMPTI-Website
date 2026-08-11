"use client";

import { newsCollection } from "@/lib/firebase";

import { getDocs, type Timestamp } from "firebase/firestore";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useMemo, useRef, useState } from "react";

import { FiArrowRight, FiCalendar, FiChevronLeft, FiChevronRight, FiExternalLink, FiRefreshCw, FiUser } from "react-icons/fi";

import { IoNewspaperOutline } from "react-icons/io5";

// =========================================================
// TYPES
// =========================================================

interface NewsItem {
  id: string;

  titleNews: string;

  descriptionNews: string;

  /**
   * Nama field ini tetap menggunakan
   * writterNews agar kompatibel dengan
   * schema Firestore lama.
   */
  writterNews: string;

  categoryNews?: string;

  imageUrl: string;

  /**
   * Tanggal versi legacy.
   */
  dateCreated: string;

  /**
   * Timestamp terbaru dari Admin News.
   */
  dateCreatedAt?: Timestamp;

  createdAt?: Timestamp;

  updatedAt?: Timestamp;
}

// =========================================================
// CONSTANTS
// =========================================================

const HOME_NEWS_LIMIT = 6;

const AUTO_PLAY_DELAY = 6000;

// =========================================================
// DATE HELPERS
// =========================================================

function createValidatedDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day, 12, 0, 0);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

function parseNewsDate(value?: string): Date | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  // =======================================================
  // FORMAT BARU
  // YYYY-MM-DD
  // =======================================================

  const isoDateMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;

    return createValidatedDate(Number(year), Number(month), Number(day));
  }

  // =======================================================
  // FORMAT LEGACY
  // DD/MM/YYYY
  // DD-MM-YYYY
  // =======================================================

  const legacyMatch = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (legacyMatch) {
    const [, day, month, year] = legacyMatch;

    return createValidatedDate(Number(year), Number(month), Number(day));
  }

  // =======================================================
  // ISO DATETIME / FALLBACK
  // =======================================================

  const fallback = new Date(normalized);

  if (Number.isNaN(fallback.getTime())) {
    return null;
  }

  return fallback;
}

function getNewsDate(news: NewsItem): Date | null {
  // =======================================================
  // TIMESTAMP BARU
  // =======================================================

  if (news.dateCreatedAt && typeof news.dateCreatedAt.toDate === "function") {
    return news.dateCreatedAt.toDate();
  }

  // =======================================================
  // LEGACY STRING
  // =======================================================

  const legacyDate = parseNewsDate(news.dateCreated);

  if (legacyDate) {
    return legacyDate;
  }

  // =======================================================
  // FALLBACK CREATED AT
  // =======================================================

  if (news.createdAt && typeof news.createdAt.toDate === "function") {
    return news.createdAt.toDate();
  }

  return null;
}

function getNewsTimestamp(news: NewsItem) {
  return getNewsDate(news)?.getTime() ?? 0;
}

function formatNewsDate(news: NewsItem) {
  const date = getNewsDate(news);

  if (!date) {
    return news.dateCreated || "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// =========================================================
// CATEGORY
// =========================================================

function getCategoryClass(category?: string) {
  const categoryClasses: Record<string, string> = {
    Teknologi: "border-blue-100 bg-blue-50 text-blue-700",

    Lifestyle: "border-pink-100 bg-pink-50 text-pink-700",

    Art: "border-purple-100 bg-purple-50 text-purple-700",

    Ekonomi: "border-green-100 bg-green-50 text-green-700",

    Sejarah: "border-amber-100 bg-amber-50 text-amber-700",

    Pendidikan: "border-indigo-100 bg-indigo-50 text-indigo-700",

    Olahraga: "border-red-100 bg-red-50 text-red-700",

    Hiburan: "border-orange-100 bg-orange-50 text-orange-700",

    Hukum: "border-gray-200 bg-gray-100 text-gray-700",

    Politik: "border-teal-100 bg-teal-50 text-teal-700",

    // =========================================
    // LEGACY
    // =========================================

    Acara: "border-blue-100 bg-blue-50 text-blue-700",

    Pengumuman: "border-purple-100 bg-purple-50 text-purple-700",

    Prestasi: "border-green-100 bg-green-50 text-green-700",
  };

  return categoryClasses[category ?? ""] ?? "border-gray-200 bg-gray-100 text-gray-700";
}

// =========================================================
// SLIDE VARIANTS
// =========================================================

const slideVariants = {
  enter: (direction: number) => ({
    opacity: 0,

    x: direction > 0 ? 40 : -40,
  }),

  center: {
    opacity: 1,
    x: 0,
  },

  exit: (direction: number) => ({
    opacity: 0,

    x: direction < 0 ? 40 : -40,
  }),
};

// =========================================================
// COMPONENT
// =========================================================

export default function NewsViewHome() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const [news, setNews] = useState<NewsItem[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [direction, setDirection] = useState(1);

  const [isHovered, setIsHovered] = useState(false);

  const [isVisible, setIsVisible] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [retryKey, setRetryKey] = useState(0);

  // =======================================================
  // SECTION VISIBILITY
  // =======================================================

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.2,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  // =======================================================
  // FETCH NEWS
  // =======================================================

  useEffect(() => {
    let active = true;

    const fetchNews = async () => {
      try {
        setLoading(true);

        setError(null);

        /**
         * Tidak memakai orderBy("dateCreated")
         * karena data baru memakai
         * dateCreatedAt Timestamp.
         *
         * Sorting dilakukan di client agar
         * data lama tetap kompatibel.
         */
        const snapshot = await getDocs(newsCollection);

        const newsData = snapshot.docs
          .map(
            (document) =>
              ({
                id: document.id,

                ...document.data(),
              }) as NewsItem,
          )
          .sort((a, b) => getNewsTimestamp(b) - getNewsTimestamp(a))
          .slice(0, HOME_NEWS_LIMIT);

        if (!active) {
          return;
        }

        setNews(newsData);

        setCurrentIndex(0);

        setDirection(1);
      } catch (fetchError) {
        console.error("Error fetching home news:", fetchError);

        if (!active) {
          return;
        }

        setError("Berita belum dapat dimuat. Silakan coba kembali.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchNews();

    return () => {
      active = false;
    };
  }, [retryKey]);

  // =======================================================
  // AUTOPLAY
  // =======================================================

  useEffect(() => {
    if (news.length <= 1 || isHovered || !isVisible) {
      return;
    }

    const interval = window.setInterval(() => {
      setDirection(1);

      setCurrentIndex((previous) => (previous + 1) % news.length);
    }, AUTO_PLAY_DELAY);

    return () => {
      window.clearInterval(interval);
    };
  }, [news.length, isHovered, isVisible]);

  // =======================================================
  // CURRENT NEWS
  // =======================================================

  const currentNews = news[currentIndex];

  // =======================================================
  // RECENT NEWS PREVIEW
  // =======================================================

  const recentNews = useMemo(() => news.filter((item) => item.id !== currentNews?.id).slice(0, 3), [news, currentNews?.id]);

  // =======================================================
  // PREVIOUS
  // =======================================================

  const handlePrevious = () => {
    if (news.length <= 1) {
      return;
    }

    setDirection(-1);

    setCurrentIndex((previous) => (previous === 0 ? news.length - 1 : previous - 1));
  };

  // =======================================================
  // NEXT
  // =======================================================

  const handleNext = () => {
    if (news.length <= 1) {
      return;
    }

    setDirection(1);

    setCurrentIndex((previous) => (previous === news.length - 1 ? 0 : previous + 1));
  };

  // =======================================================
  // GO TO NEWS
  // =======================================================

  const selectNews = (index: number) => {
    if (index === currentIndex) {
      return;
    }

    setDirection(index > currentIndex ? 1 : -1);

    setCurrentIndex(index);
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        className="
          relative
          w-full
          overflow-hidden
          bg-white
          px-4
          py-14

          sm:px-6
          sm:py-16

          lg:px-8
          lg:py-20
        "
      >
        {/* =========================================
            BACKGROUND
        ========================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
          "
        >
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-gray-50/80
              via-white
              to-blue-50/30
            "
          />

          <div
            className="
              absolute
              inset-0
              opacity-[0.07]
              bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]
            "
          />

          <div
            className="
              absolute
              -left-32
              top-10
              hidden
              h-80
              w-80
              rounded-full
              bg-blue-200/15
              blur-3xl

              md:block
            "
          />

          <div
            className="
              absolute
              -bottom-32
              -right-24
              hidden
              h-80
              w-80
              rounded-full
              bg-cyan-200/15
              blur-3xl

              md:block
            "
          />
        </div>

        {/* =========================================
            CONTAINER
        ========================================== */}

        <div
          className="
            relative
            z-10
            mx-auto
            max-w-7xl
          "
        >
          {/* =======================================
              HEADER
          ======================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            className="
              mx-auto
              mb-10
              max-w-3xl
              text-center

              sm:mb-12
            "
          >
            <div
              className="
                mb-5
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-blue-100
                bg-blue-50
                px-4
                py-2
              "
            >
              <IoNewspaperOutline
                className="
                  text-blue-500
                "
              />

              <span
                className="
                  text-xs
                  font-semibold
                  text-blue-700

                  sm:text-sm
                "
              >
                Berita Terbaru
              </span>
            </div>

            <h2
              className="
                text-3xl
                font-bold
                tracking-tight
                text-gray-900

                sm:text-4xl

                lg:text-5xl
              "
            >
              <span
                className="
                  bg-gradient-to-r
                  from-blue-600
                  to-cyan-500
                  bg-clip-text
                  text-transparent
                "
              >
                Update Terkini
              </span>

              {" HMPTI"}
            </h2>

            <p
              className="
                mx-auto
                mt-4
                max-w-2xl
                text-sm
                leading-7
                text-gray-600

                sm:text-base

                md:text-lg
              "
            >
              Ikuti berbagai berita, informasi, perkembangan, dan aktivitas terbaru dari HMPTI Universitas Duta Bangsa.
            </p>
          </motion.div>

          {/* =======================================
              LOADING
          ======================================== */}

          {loading && <NewsHomeSkeleton />}

          {/* =======================================
              ERROR
          ======================================== */}

          {!loading && error && <NewsHomeError message={error} onRetry={() => setRetryKey((previous) => previous + 1)} />}

          {/* =======================================
              NEWS
          ======================================== */}

          {!loading && !error && currentNews && (
            <>
              {/* =================================
                    FEATURED NEWS
                ================================== */}

              <div
                className="
                    relative
                    overflow-hidden
                    rounded-3xl
                    border
                    border-gray-100
                    bg-white
                    shadow-xl
                    shadow-gray-900/5
                  "
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <AnimatePresence custom={direction} mode="wait" initial={false}>
                  <motion.article
                    key={currentNews.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      duration: 0.35,
                      ease: "easeOut",
                    }}
                    className="
                        grid
                        min-w-0
                        grid-cols-1

                        lg:grid-cols-2
                      "
                  >
                    {/* ===========================
                          IMAGE
                      ============================ */}

                    <FeaturedNewsImage news={currentNews} />

                    {/* ===========================
                          CONTENT
                      ============================ */}

                    <div
                      className="
                          flex
                          min-w-0
                          flex-col
                          justify-center
                          p-5

                          sm:p-7

                          lg:min-h-[430px]
                          lg:p-10
                        "
                    >
                      {/* CATEGORY */}

                      <div>
                        <span
                          className={`
                              inline-flex
                              rounded-full
                              border
                              px-3
                              py-1.5
                              text-xs
                              font-semibold

                              ${getCategoryClass(currentNews.categoryNews)}
                            `}
                        >
                          {currentNews.categoryNews || "Berita HMPTI"}
                        </span>
                      </div>

                      {/* META */}

                      <div
                        className="
                            mt-5
                            flex
                            flex-wrap
                            gap-2
                          "
                      >
                        <span
                          className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              bg-gray-50
                              px-3
                              py-1.5
                              text-xs
                              font-medium
                              text-gray-500
                            "
                        >
                          <FiCalendar className="text-blue-500" />

                          {formatNewsDate(currentNews)}
                        </span>

                        {currentNews.writterNews && (
                          <span
                            className="
                                inline-flex
                                min-w-0
                                items-center
                                gap-1.5
                                rounded-full
                                bg-gray-50
                                px-3
                                py-1.5
                                text-xs
                                font-medium
                                text-gray-500
                              "
                          >
                            <FiUser
                              className="
                                  shrink-0
                                  text-blue-500
                                "
                            />

                            <span className="truncate">{currentNews.writterNews}</span>
                          </span>
                        )}
                      </div>

                      {/* TITLE */}

                      <h3
                        className="
                            mt-5
                            max-w-2xl
                            text-2xl
                            font-bold
                            leading-tight
                            tracking-tight
                            text-gray-900

                            sm:text-3xl

                            lg:text-4xl
                          "
                      >
                        {currentNews.titleNews}
                      </h3>

                      {/* DESCRIPTION */}

                      <p
                        className="
                            mt-4
                            line-clamp-4
                            max-w-2xl
                            text-sm
                            leading-7
                            text-gray-600

                            sm:text-base
                          "
                      >
                        {currentNews.descriptionNews}
                      </p>

                      {/* READ */}

                      <div className="mt-6">
                        <Link
                          href={`/pages/news/${currentNews.id}`}
                          className="
                              group
                              inline-flex
                              items-center
                              gap-2
                              text-sm
                              font-semibold
                              text-blue-600
                              transition-colors

                              hover:text-blue-700
                            "
                        >
                          Baca Selengkapnya
                          <FiArrowRight
                            className="
                                transition-transform

                                group-hover:translate-x-1
                              "
                          />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                </AnimatePresence>

                {/* =================================
                      DESKTOP NAVIGATION
                  ================================== */}

                {news.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevious}
                      aria-label="Berita sebelumnya"
                      className="
                          absolute
                          left-3
                          top-[31%]
                          z-10
                          hidden
                          h-11
                          w-11
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/40
                          bg-white/90
                          text-gray-700
                          shadow-lg
                          backdrop-blur-md
                          transition-all

                          hover:bg-white
                          hover:text-blue-600

                          lg:flex
                          lg:top-1/2
                        "
                    >
                      <FiChevronLeft className="text-xl" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Berita berikutnya"
                      className="
                          absolute
                          right-3
                          top-[31%]
                          z-10
                          hidden
                          h-11
                          w-11
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/40
                          bg-white/90
                          text-gray-700
                          shadow-lg
                          backdrop-blur-md
                          transition-all

                          hover:bg-white
                          hover:text-blue-600

                          lg:flex
                          lg:top-1/2
                        "
                    >
                      <FiChevronRight className="text-xl" />
                    </button>
                  </>
                )}
              </div>

              {/* =================================
                    MOBILE / TABLET CONTROLS
                ================================== */}

              {news.length > 1 && (
                <div
                  className="
                      mt-5
                      flex
                      items-center
                      justify-between
                      gap-4

                      lg:hidden
                    "
                >
                  <button
                    type="button"
                    onClick={handlePrevious}
                    aria-label="Berita sebelumnya"
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        text-gray-600
                        shadow-sm
                        transition-colors

                        hover:bg-blue-50
                        hover:text-blue-600
                      "
                  >
                    <FiChevronLeft />
                  </button>

                  <NewsIndicators news={news} currentIndex={currentIndex} onChange={selectNews} />

                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Berita berikutnya"
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        text-gray-600
                        shadow-sm
                        transition-colors

                        hover:bg-blue-50
                        hover:text-blue-600
                      "
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}

              {/* =================================
                    DESKTOP INDICATORS
                ================================== */}

              {news.length > 1 && (
                <div
                  className="
                      mt-6
                      hidden
                      justify-center

                      lg:flex
                    "
                >
                  <NewsIndicators news={news} currentIndex={currentIndex} onChange={selectNews} />
                </div>
              )}

              {/* =================================
                    RECENT NEWS
                ================================== */}

              {recentNews.length > 0 && (
                <div
                  className="
                      mt-10

                      sm:mt-12
                    "
                >
                  <div
                    className="
                        mb-5
                        flex
                        items-end
                        justify-between
                        gap-4
                      "
                  >
                    <div>
                      <p
                        className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.12em]
                            text-blue-600
                          "
                      >
                        Berita Lainnya
                      </p>

                      <h3
                        className="
                            mt-1
                            text-xl
                            font-bold
                            text-gray-900

                            sm:text-2xl
                          "
                      >
                        Informasi Terbaru
                      </h3>
                    </div>

                    <Link
                      href="/pages/news"
                      className="
                          hidden
                          items-center
                          gap-1.5
                          text-sm
                          font-semibold
                          text-blue-600

                          hover:text-blue-700

                          sm:inline-flex
                        "
                    >
                      Lihat semua
                      <FiArrowRight />
                    </Link>
                  </div>

                  <div
                    className="
                        grid
                        grid-cols-1
                        gap-4

                        sm:grid-cols-3
                      "
                  >
                    {recentNews.map((item) => (
                      <SmallNewsCard key={item.id} news={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* =================================
                    MAIN CTA
                ================================== */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 16,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                className="
                    mt-10
                    flex
                    justify-center

                    sm:mt-12
                  "
              >
                <Link
                  href="/pages/news"
                  className="
                      group
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      shadow-lg
                      shadow-blue-600/15
                      transition-all

                      hover:-translate-y-0.5
                      hover:bg-blue-500
                      hover:shadow-xl

                      sm:px-6
                    "
                >
                  Lihat Semua Berita
                  <FiExternalLink
                    className="
                        transition-transform

                        group-hover:-translate-y-0.5
                        group-hover:translate-x-0.5
                      "
                  />
                </Link>
              </motion.div>
            </>
          )}

          {/* =======================================
              EMPTY
          ======================================== */}

          {!loading && !error && news.length === 0 && <NewsHomeEmpty />}
        </div>
      </section>
    </MotionConfig>
  );
}

// =========================================================
// FEATURED IMAGE
// =========================================================

function FeaturedNewsImage({ news }: { news: NewsItem }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [news.imageUrl]);

  return (
    <div
      className="
        relative
        aspect-[4/3]
        min-w-0
        overflow-hidden
        bg-gray-100

        sm:aspect-video

        lg:aspect-auto
        lg:min-h-[430px]
      "
    >
      {news.imageUrl && !imageError ? (
        <Image
          src={news.imageUrl}
          alt={news.titleNews}
          fill
          sizes="
            (max-width: 1023px) 100vw,
            50vw
          "
          onError={() => setImageError(true)}
          className="
            object-cover
          "
        />
      ) : (
        <NewsImageFallback />
      )}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-t
          from-gray-950/25
          via-transparent
          to-transparent

          lg:bg-gradient-to-r
          lg:from-gray-950/20
          lg:via-transparent
          lg:to-transparent
        "
      />

      {/* =========================================
          MOBILE CATEGORY
      ========================================== */}

      {news.categoryNews && (
        <div
          className="
            absolute
            left-3
            top-3

            lg:hidden
          "
        >
          <span
            className="
              rounded-full
              bg-gray-950/75
              px-2.5
              py-1
              text-[11px]
              font-semibold
              text-white
              backdrop-blur-md
            "
          >
            {news.categoryNews}
          </span>
        </div>
      )}
    </div>
  );
}

// =========================================================
// SMALL NEWS CARD
// =========================================================

function SmallNewsCard({ news }: { news: NewsItem }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [news.imageUrl]);

  return (
    <Link
      href={`/pages/news/${news.id}`}
      className="
        group
        flex
        min-w-0
        gap-3
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-3
        shadow-sm
        transition-all

        hover:-translate-y-0.5
        hover:border-blue-100
        hover:shadow-md
      "
    >
      {/* IMAGE */}

      <div
        className="
          relative
          h-20
          w-24
          shrink-0
          overflow-hidden
          rounded-xl
          bg-gray-100
        "
      >
        {news.imageUrl && !imageError ? (
          <Image
            src={news.imageUrl}
            alt={news.titleNews}
            fill
            sizes="96px"
            onError={() => setImageError(true)}
            className="
              object-cover
              transition-transform
              duration-300

              group-hover:scale-[1.04]
            "
          />
        ) : (
          <NewsImageFallback />
        )}
      </div>

      {/* CONTENT */}

      <div
        className="
          min-w-0
          flex-1
          py-0.5
        "
      >
        <span
          className="
            text-[10px]
            font-medium
            text-gray-400
          "
        >
          {formatNewsDate(news)}
        </span>

        <h4
          className="
            mt-1
            line-clamp-2
            text-sm
            font-bold
            leading-5
            text-gray-900
            transition-colors

            group-hover:text-blue-600
          "
        >
          {news.titleNews}
        </h4>

        <span
          className="
            mt-1.5
            inline-flex
            items-center
            gap-1
            text-[11px]
            font-semibold
            text-blue-600
          "
        >
          Baca
          <FiArrowRight />
        </span>
      </div>
    </Link>
  );
}

// =========================================================
// INDICATORS
// =========================================================

function NewsIndicators({
  news,
  currentIndex,
  onChange,
}: {
  news: NewsItem[];

  currentIndex: number;

  onChange: (index: number) => void;
}) {
  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        justify-center
        gap-2
      "
    >
      {news.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(index)}
          aria-label={`Tampilkan berita ${index + 1}`}
          aria-current={currentIndex === index ? "true" : undefined}
          className={`
              h-2
              rounded-full
              transition-all

              ${
                currentIndex === index
                  ? `
                    w-6
                    bg-blue-600
                  `
                  : `
                    w-2
                    bg-gray-300

                    hover:bg-gray-400
                  `
              }
            `}
        />
      ))}
    </div>
  );
}

// =========================================================
// IMAGE FALLBACK
// =========================================================

function NewsImageFallback() {
  return (
    <div
      className="
        flex
        h-full
        w-full
        items-center
        justify-center
        bg-gradient-to-br
        from-blue-50
        to-cyan-100
      "
    >
      <IoNewspaperOutline
        className="
          text-4xl
          text-blue-300
        "
      />
    </div>
  );
}

// =========================================================
// LOADING
// =========================================================

function NewsHomeSkeleton() {
  return (
    <div>
      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-gray-100
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            grid
            grid-cols-1

            lg:grid-cols-2
          "
        >
          <div
            className="
              aspect-[4/3]
              animate-pulse
              bg-gray-200

              sm:aspect-video

              lg:aspect-auto
              lg:min-h-[430px]
            "
          />

          <div
            className="
              flex
              flex-col
              justify-center
              space-y-4
              p-5

              sm:p-7

              lg:p-10
            "
          >
            <div
              className="
                h-7
                w-28
                animate-pulse
                rounded-full
                bg-gray-100
              "
            />

            <div
              className="
                h-4
                w-48
                max-w-full
                animate-pulse
                rounded
                bg-gray-100
              "
            />

            <div
              className="
                h-8
                w-4/5
                animate-pulse
                rounded
                bg-gray-200
              "
            />

            <div
              className="
                h-8
                w-2/3
                animate-pulse
                rounded
                bg-gray-200
              "
            />

            <div
              className="
                h-4
                animate-pulse
                rounded
                bg-gray-100
              "
            />

            <div
              className="
                h-4
                w-5/6
                animate-pulse
                rounded
                bg-gray-100
              "
            />

            <div
              className="
                h-5
                w-32
                animate-pulse
                rounded
                bg-blue-100
              "
            />
          </div>
        </div>
      </div>

      <div
        className="
          mt-10
          grid
          grid-cols-1
          gap-4

          sm:grid-cols-3
        "
      >
        {Array.from({
          length: 3,
        }).map((_, index) => (
          <div
            key={index}
            className="
                flex
                gap-3
                rounded-2xl
                border
                border-gray-100
                bg-white
                p-3
              "
          >
            <div
              className="
                  h-20
                  w-24
                  shrink-0
                  animate-pulse
                  rounded-xl
                  bg-gray-200
                "
            />

            <div
              className="
                  flex-1
                  space-y-2
                "
            >
              <div
                className="
                    h-3
                    w-20
                    animate-pulse
                    rounded
                    bg-gray-100
                  "
              />

              <div
                className="
                    h-4
                    animate-pulse
                    rounded
                    bg-gray-200
                  "
              />

              <div
                className="
                    h-4
                    w-3/4
                    animate-pulse
                    rounded
                    bg-gray-100
                  "
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================
// ERROR
// =========================================================

function NewsHomeError({
  message,
  onRetry,
}: {
  message: string;

  onRetry: () => void;
}) {
  return (
    <div
      className="
        mx-auto
        max-w-md
        rounded-3xl
        border
        border-red-100
        bg-white
        px-6
        py-10
        text-center
        shadow-sm
      "
    >
      <div
        className="
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-red-50
          text-red-500
        "
      >
        <IoNewspaperOutline className="text-2xl" />
      </div>

      <h3
        className="
          mt-4
          text-lg
          font-bold
          text-gray-900
        "
      >
        Berita Gagal Dimuat
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-gray-500
        "
      >
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-gray-900
          px-5
          py-2.5
          text-sm
          font-semibold
          text-white
          transition-colors

          hover:bg-gray-800
        "
      >
        <FiRefreshCw />
        Coba Lagi
      </button>
    </div>
  );
}

// =========================================================
// EMPTY
// =========================================================

function NewsHomeEmpty() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      className="
        mx-auto
        max-w-md
        rounded-3xl
        border
        border-dashed
        border-gray-200
        bg-white/70
        px-6
        py-12
        text-center
      "
    >
      <div
        className="
          mx-auto
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-gray-100
          text-gray-400
        "
      >
        <IoNewspaperOutline className="text-3xl" />
      </div>

      <h3
        className="
          mt-4
          text-lg
          font-bold
          text-gray-900
        "
      >
        Belum Ada Berita
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-gray-500
        "
      >
        Berita dan informasi terbaru HMPTI akan ditampilkan di bagian ini setelah tersedia.
      </p>
    </motion.div>
  );
}

"use client";

import { newsCollection } from "@/lib/firebase";

import { getDocs, type Timestamp } from "firebase/firestore";

import { motion, useReducedMotion } from "framer-motion";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

import { FiArrowRight, FiCalendar, FiChevronLeft, FiChevronRight, FiUser } from "react-icons/fi";

import { IoNewspaperOutline } from "react-icons/io5";

// =========================================================
// TYPES
// =========================================================

interface NewsItem {
  id: string;

  titleNews: string;

  descriptionNews: string;

  /**
   * Nama field lama sengaja tetap
   * menggunakan writterNews agar
   * kompatibel dengan Firestore.
   */
  writterNews: string;

  categoryNews?: string;

  imageUrl: string;

  /**
   * Field tanggal lama.
   */
  dateCreated: string;

  /**
   * Timestamp baru dari Admin News.
   */
  dateCreatedAt?: Timestamp;

  createdAt?: Timestamp;

  updatedAt?: Timestamp;
}

// =========================================================
// CONSTANTS
// =========================================================

const NEWS_PER_PAGE = 8;

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

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  // =======================================================
  // FORMAT BARU:
  // YYYY-MM-DD
  // =======================================================

  const isoMatch = normalizedValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;

    return createValidatedDate(Number(year), Number(month), Number(day));
  }

  // =======================================================
  // FORMAT LAMA:
  // DD/MM/YYYY
  // DD-MM-YYYY
  // =======================================================

  const legacyMatch = normalizedValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (legacyMatch) {
    const [, day, month, year] = legacyMatch;

    return createValidatedDate(Number(year), Number(month), Number(day));
  }

  // =======================================================
  // FALLBACK
  // ISO DATETIME / STRING DATE LAMA
  // =======================================================

  const fallbackDate = new Date(normalizedValue);

  if (Number.isNaN(fallbackDate.getTime())) {
    return null;
  }

  return fallbackDate;
}

function getNewsDate(news: NewsItem): Date | null {
  /**
   * Prioritas pertama:
   * Firestore Timestamp terbaru.
   */
  if (news.dateCreatedAt && typeof news.dateCreatedAt.toDate === "function") {
    return news.dateCreatedAt.toDate();
  }

  /**
   * Fallback:
   * field string data lama.
   */
  const legacyDate = parseNewsDate(news.dateCreated);

  if (legacyDate) {
    return legacyDate;
  }

  /**
   * Fallback terakhir:
   * waktu document dibuat.
   */
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
// PAGE
// =========================================================

export default function NewsPage() {
  return (
    <main
      className="
        min-h-screen
        bg-white
      "
    >
      <HeroViewNews />

      <NewsView />
    </main>
  );
}

// =========================================================
// HERO
// =========================================================

function HeroViewNews() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="
        relative
        flex
        min-h-[64svh]
        w-full
        items-center
        justify-center
        overflow-hidden
        bg-gradient-to-br
        from-blue-950
        via-blue-900
        to-cyan-900
        px-4
        pb-16
        pt-28

        sm:min-h-[68svh]
        sm:px-6
        sm:pb-20
        sm:pt-32

        lg:px-8
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
            bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.18),transparent_40%)]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.10]
            bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')]
          "
        />

        {/* =======================================
            FLOATING SHAPE LEFT
        ======================================== */}

        <motion.div
          className="
            absolute
            left-[8%]
            top-[18%]
            hidden
            h-64
            w-64
            rounded-full
            bg-blue-400/10
            blur-3xl

            md:block
          "
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  scale: [1, 1.12, 1],

                  x: [0, 14, 0],

                  y: [0, -12, 0],
                }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />

        {/* =======================================
            FLOATING SHAPE RIGHT
        ======================================== */}

        <motion.div
          className="
            absolute
            bottom-[12%]
            right-[8%]
            hidden
            h-72
            w-72
            rounded-full
            bg-cyan-400/10
            blur-3xl

            md:block
          "
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  scale: [1.08, 1, 1.08],

                  x: [0, -12, 0],

                  y: [0, 14, 0],
                }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  duration: 14,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      </div>

      {/* =========================================
          CONTENT
      ========================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-5xl
          text-center
        "
      >
        {/* =======================================
            BADGE
        ======================================== */}

        <motion.div
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 12,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-white/15
            bg-white/10
            px-4
            py-2
            backdrop-blur-md
          "
        >
          <IoNewspaperOutline className="text-white" />

          <span
            className="
              text-xs
              font-semibold
              text-white

              sm:text-sm
            "
          >
            Berita & Artikel
          </span>
        </motion.div>

        {/* =======================================
            TITLE
        ======================================== */}

        <motion.h1
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 18,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.65,
            delay: shouldReduceMotion ? 0 : 0.08,
          }}
          className="
            mx-auto
            max-w-4xl
            text-4xl
            font-bold
            leading-[1.08]
            tracking-tight
            text-white

            sm:text-5xl
            md:text-6xl
            lg:text-7xl
          "
        >
          Informasi Terkini
          <span
            className="
              mx-2
              bg-gradient-to-r
              from-cyan-300
              to-blue-300
              bg-clip-text
              text-transparent
            "
          >
            Seputar
          </span>
          HMPTI
        </motion.h1>

        {/* =======================================
            DESCRIPTION
        ======================================== */}

        <motion.p
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 18,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.65,
            delay: shouldReduceMotion ? 0 : 0.16,
          }}
          className="
            mx-auto
            mt-6
            max-w-2xl
            text-sm
            leading-7
            text-blue-50/80

            sm:text-base

            md:text-lg
            md:leading-8
          "
        >
          Ikuti berita, informasi, perkembangan teknologi, dan berbagai kabar terbaru dari HMPTI Universitas Duta Bangsa.
        </motion.p>

        {/* =======================================
            CTA
        ======================================== */}

        <motion.div
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 16,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            delay: shouldReduceMotion ? 0 : 0.24,
          }}
          className="mt-8"
        >
          <a
            href="#daftar-berita"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-white
              px-6
              py-3
              text-sm
              font-semibold
              text-blue-900
              transition-all

              hover:-translate-y-0.5
              hover:bg-blue-50
            "
          >
            Lihat Berita
            <FiArrowRight />
          </a>
        </motion.div>
      </div>

      {/* =========================================
          SCROLL INDICATOR
      ========================================== */}

      <motion.div
        aria-hidden="true"
        initial={{
          opacity: 0,
        }}
        animate={
          shouldReduceMotion
            ? {
                opacity: 1,
              }
            : {
                opacity: 1,

                y: [0, 8, 0],
              }
        }
        transition={
          shouldReduceMotion
            ? {
                duration: 0.4,
                delay: 0.6,
              }
            : {
                opacity: {
                  duration: 0.4,
                  delay: 0.6,
                },

                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
        }
        className="
          absolute
          bottom-5
          left-1/2
          hidden
          -translate-x-1/2

          sm:block
        "
      >
        <div
          className="
            flex
            h-9
            w-5
            justify-center
            rounded-full
            border
            border-white/30
          "
        >
          <div
            className="
              mt-2
              h-2
              w-1
              rounded-full
              bg-white/70
            "
          />
        </div>
      </motion.div>
    </section>
  );
}

// =========================================================
// NEWS VIEW
// =========================================================

function NewsView() {
  const shouldReduceMotion = useReducedMotion();

  const [news, setNews] = useState<NewsItem[]>([]);

  const [currentPage, setCurrentPage] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [retryKey, setRetryKey] = useState(0);

  // =======================================================
  // FETCH
  // =======================================================

  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      try {
        setLoading(true);

        setError(null);

        const snapshot = await getDocs(newsCollection);

        const newsList = snapshot.docs.map(
          (document) =>
            ({
              id: document.id,

              ...document.data(),
            }) as NewsItem,
        );

        // =========================================
        // SORT DATE
        // =========================================

        const sortedNews = [...newsList].sort((a, b) => getNewsTimestamp(b) - getNewsTimestamp(a));

        if (isMounted) {
          setNews(sortedNews);

          setCurrentPage(0);
        }
      } catch (fetchError) {
        console.error("Error fetching news:", fetchError);

        if (isMounted) {
          setError("Gagal memuat data berita. Silakan coba kembali.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchNews();

    return () => {
      isMounted = false;
    };
  }, [retryKey]);

  // =======================================================
  // PAGINATION
  // =======================================================

  const totalPages = Math.ceil(news.length / NEWS_PER_PAGE);

  const selectedNews = useMemo(() => {
    const startIndex = currentPage * NEWS_PER_PAGE;

    return news.slice(startIndex, startIndex + NEWS_PER_PAGE);
  }, [currentPage, news]);

  const changePage = (page: number) => {
    if (page < 0 || page >= totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);

    window.requestAnimationFrame(() => {
      document.getElementById("daftar-berita")?.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",

        block: "start",
      });
    });
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <section
      id="daftar-berita"
      className="
        relative
        scroll-mt-20
        overflow-hidden
        bg-gradient-to-br
        from-gray-50
        via-white
        to-blue-50/30
        px-4
        py-14

        sm:px-6
        sm:py-16

        lg:px-8
        lg:py-20
      "
    >
      <NewsBackground />

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
        "
      >
        {/* =========================================
            HEADER
        ========================================== */}

        <motion.div
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 20,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.15,
          }}
          transition={{
            duration: 0.5,
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
            <IoNewspaperOutline className="text-blue-500" />

            <span
              className="
                text-xs
                font-semibold
                text-blue-700

                sm:text-sm
              "
            >
              Semua Berita
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
              Berita
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
            Temukan informasi terbaru, kabar organisasi, perkembangan, dan berbagai artikel menarik dari HMPTI Universitas Duta Bangsa.
          </p>
        </motion.div>

        {/* =========================================
            LOADING
        ========================================== */}

        {loading && <NewsSkeleton />}

        {/* =========================================
            ERROR
        ========================================== */}

        {!loading && error && <NewsError message={error} onRetry={() => setRetryKey((value) => value + 1)} />}

        {/* =========================================
            CONTENT
        ========================================== */}

        {!loading && !error && (
          <>
            {selectedNews.length > 0 && (
              <motion.div
                key={currentPage}
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 12,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.35,
                }}
                className="
                    grid
                    grid-cols-1
                    gap-5

                    sm:grid-cols-2
                    sm:gap-6

                    lg:grid-cols-3

                    xl:grid-cols-4
                  "
              >
                {selectedNews.map((newsItem, index) => (
                  <NewsCard key={newsItem.id} news={newsItem} index={index} />
                ))}
              </motion.div>
            )}

            {/* =================================
                  EMPTY
              ================================== */}

            {news.length === 0 && <EmptyNewsState />}

            {/* =================================
                  PAGINATION
              ================================== */}

            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onChange={changePage} />}
          </>
        )}
      </div>
    </section>
  );
}

// =========================================================
// NEWS BACKGROUND
// =========================================================

function NewsBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        absolute
        inset-0
        overflow-hidden
      "
    >
      {/* =========================================
          GRID
      ========================================== */}

      <div
        className="
          absolute
          inset-0
          opacity-[0.08]
          bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]
        "
      />

      {/* =========================================
          RIGHT BLUR
      ========================================== */}

      <motion.div
        className="
          absolute
          right-[7%]
          top-[10%]
          hidden
          h-64
          w-64
          rounded-full
          bg-blue-200/15
          blur-3xl

          md:block
        "
        animate={
          shouldReduceMotion
            ? undefined
            : {
                scale: [1, 1.1, 1],
              }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : {
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />

      {/* =========================================
          LEFT BLUR
      ========================================== */}

      <motion.div
        className="
          absolute
          bottom-[8%]
          left-[6%]
          hidden
          h-72
          w-72
          rounded-full
          bg-cyan-300/10
          blur-3xl

          md:block
        "
        animate={
          shouldReduceMotion
            ? undefined
            : {
                scale: [1.08, 1, 1.08],
              }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : {
                duration: 14,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />
    </div>
  );
}

// =========================================================
// NEWS CARD
// =========================================================

function NewsCard({
  news,
  index,
}: {
  news: NewsItem;

  index: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={
        shouldReduceMotion
          ? false
          : {
              opacity: 0,
              y: 18,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,

        delay: shouldReduceMotion ? 0 : Math.min(index * 0.04, 0.2),
      }}
      className="h-full"
    >
      <Link
        href={`/pages/news/${news.id}`}
        className="
          group
          flex
          h-full
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-gray-100
          bg-white
          shadow-sm
          transition-all
          duration-300

          hover:-translate-y-1
          hover:shadow-xl
          hover:shadow-blue-100/50
        "
      >
        {/* =========================================
            IMAGE
        ========================================== */}

        <div
          className="
            relative
            aspect-[4/3]
            overflow-hidden
            bg-gray-100
          "
        >
          {news.imageUrl ? (
            <Image
              src={news.imageUrl}
              alt={news.titleNews}
              fill
              sizes="
                (max-width: 639px) 92vw,
                (max-width: 1023px) 46vw,
                (max-width: 1279px) 30vw,
                285px
              "
              className="
                object-cover
                transition-transform
                duration-500

                group-hover:scale-[1.035]
              "
            />
          ) : (
            <NewsImagePlaceholder />
          )}

          {/* =======================================
              IMAGE OVERLAY
          ======================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/20
              via-transparent
              to-transparent
            "
          />

          {/* =======================================
              CATEGORY
          ======================================== */}

          {news.categoryNews && (
            <div
              className="
                absolute
                left-3
                top-3
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

        {/* =========================================
            CONTENT
        ========================================== */}

        <div
          className="
            flex
            flex-1
            flex-col
            p-5
          "
        >
          {/* =======================================
              DATE
          ======================================== */}

          <div
            className="
              mb-3
              inline-flex
              w-fit
              items-center
              gap-2
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

            {formatNewsDate(news)}
          </div>

          {/* =======================================
              TITLE
          ======================================== */}

          <h3
            className="
              line-clamp-2
              text-lg
              font-bold
              leading-snug
              text-gray-900
              transition-colors

              group-hover:text-blue-600
            "
          >
            {news.titleNews}
          </h3>

          {/* =======================================
              AUTHOR
          ======================================== */}

          {news.writterNews && (
            <div
              className="
                mt-3
                flex
                items-center
                gap-2
                text-xs
                text-gray-500
              "
            >
              <FiUser
                className="
                  shrink-0
                  text-blue-500
                "
              />

              <span
                className="
                  truncate
                "
              >
                {news.writterNews}
              </span>
            </div>
          )}

          {/* =======================================
              DESCRIPTION
          ======================================== */}

          <p
            className="
              mt-3
              line-clamp-3
              text-sm
              leading-6
              text-gray-600
            "
          >
            {news.descriptionNews}
          </p>

          {/* =======================================
              DETAIL
          ======================================== */}

          <div
            className="
              mt-auto
              flex
              items-center
              pt-5
              text-sm
              font-semibold
              text-blue-600
            "
          >
            Baca selengkapnya
            <FiArrowRight
              className="
                ml-1.5
                transition-transform

                group-hover:translate-x-1
              "
            />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

// =========================================================
// IMAGE PLACEHOLDER
// =========================================================

function NewsImagePlaceholder() {
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
          text-blue-400
        "
      />
    </div>
  );
}

// =========================================================
// SKELETON
// =========================================================

function NewsSkeleton() {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-5

        sm:grid-cols-2
        sm:gap-6

        lg:grid-cols-3

        xl:grid-cols-4
      "
    >
      {Array.from({
        length: NEWS_PER_PAGE,
      }).map((_, index) => (
        <div
          key={index}
          className="
              overflow-hidden
              rounded-2xl
              border
              border-gray-100
              bg-white
              shadow-sm
            "
        >
          <div
            className="
                aspect-[4/3]
                animate-pulse
                bg-gray-200
              "
          />

          <div
            className="
                space-y-3
                p-5
              "
          >
            <div
              className="
                  h-7
                  w-2/3
                  animate-pulse
                  rounded-full
                  bg-gray-100
                "
            />

            <div
              className="
                  h-5
                  animate-pulse
                  rounded
                  bg-gray-200
                "
            />

            <div
              className="
                  h-4
                  w-2/5
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
                  bg-gray-100
                "
            />

            <div
              className="
                  h-4
                  w-4/5
                  animate-pulse
                  rounded
                  bg-gray-100
                "
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// =========================================================
// ERROR
// =========================================================

function NewsError({
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
        p-6
        text-center
        shadow-sm

        sm:p-8
      "
    >
      <div
        className="
          mx-auto
          mb-4
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-red-50
        "
      >
        <IoNewspaperOutline
          className="
            text-2xl
            text-red-500
          "
        />
      </div>

      <h3
        className="
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
        Coba Lagi
      </button>
    </div>
  );
}

// =========================================================
// EMPTY
// =========================================================

function EmptyNewsState() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? false
          : {
              opacity: 0,
              y: 16,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        mx-auto
        max-w-md
        rounded-3xl
        border
        border-gray-100
        bg-white
        p-7
        text-center
        shadow-sm
      "
    >
      <div
        className="
          mx-auto
          mb-4
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-gray-100
        "
      >
        <IoNewspaperOutline
          className="
            text-2xl
            text-gray-400
          "
        />
      </div>

      <h3
        className="
          text-lg
          font-bold
          text-gray-800
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
        Berita dan informasi terbaru HMPTI akan segera tersedia di halaman ini.
      </p>
    </motion.div>
  );
}

// =========================================================
// PAGINATION
// =========================================================

function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;

  totalPages: number;

  onChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from(
        {
          length: totalPages,
        },
        (_, index) => index,
      );
    }

    let start = Math.max(currentPage - 2, 0);

    if (start + 5 > totalPages) {
      start = totalPages - 5;
    }

    return Array.from(
      {
        length: 5,
      },
      (_, index) => start + index,
    );
  }, [currentPage, totalPages]);

  return (
    <nav
      aria-label="Navigasi halaman berita"
      className="
        mt-10
        flex
        flex-wrap
        items-center
        justify-center
        gap-2

        sm:mt-12
        sm:gap-3
      "
    >
      {/* =========================================
          PREVIOUS
      ========================================== */}

      <button
        type="button"
        aria-label="Halaman sebelumnya"
        disabled={currentPage === 0}
        onClick={() => onChange(currentPage - 1)}
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-gray-200
          bg-white
          text-blue-600
          shadow-sm
          transition-all

          hover:bg-blue-50

          disabled:cursor-not-allowed
          disabled:bg-gray-100
          disabled:text-gray-300
          disabled:shadow-none
        "
      >
        <FiChevronLeft />
      </button>

      {/* =========================================
          PAGE NUMBER
      ========================================== */}

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          aria-label={`Halaman ${page + 1}`}
          aria-current={currentPage === page ? "page" : undefined}
          onClick={() => onChange(page)}
          className={`
              flex
              h-10
              min-w-10
              items-center
              justify-center
              rounded-xl
              px-3
              text-sm
              font-semibold
              transition-all

              ${
                currentPage === page
                  ? `
                    bg-blue-600
                    text-white
                    shadow-md
                    shadow-blue-500/20
                  `
                  : `
                    border
                    border-gray-200
                    bg-white
                    text-gray-600

                    hover:bg-gray-50
                  `
              }
            `}
        >
          {page + 1}
        </button>
      ))}

      {/* =========================================
          NEXT
      ========================================== */}

      <button
        type="button"
        aria-label="Halaman berikutnya"
        disabled={currentPage === totalPages - 1}
        onClick={() => onChange(currentPage + 1)}
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-gray-200
          bg-white
          text-blue-600
          shadow-sm
          transition-all

          hover:bg-blue-50

          disabled:cursor-not-allowed
          disabled:bg-gray-100
          disabled:text-gray-300
          disabled:shadow-none
        "
      >
        <FiChevronRight />
      </button>
    </nav>
  );
}

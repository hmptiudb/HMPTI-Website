"use client";

import { newsCollection } from "@/lib/firebase";

import { doc, getDoc, getDocs, type Timestamp } from "firebase/firestore";

import { motion, useReducedMotion } from "framer-motion";

import Image from "next/image";
import Link from "next/link";

import { useParams } from "next/navigation";

import { useEffect, useState } from "react";

import { FiArrowLeft, FiArrowRight, FiCalendar, FiCheck, FiShare2, FiUser } from "react-icons/fi";

import { IoNewspaperOutline, IoTimeOutline } from "react-icons/io5";

// =========================================================
// TYPES
// =========================================================

interface NewsItem {
  id: string;

  titleNews: string;

  descriptionNews: string;

  imageUrl: string;

  categoryNews?: string;

  writterNews: string;

  dateCreated: string;

  dateCreatedAt?: Timestamp;

  createdAt?: Timestamp;

  updatedAt?: Timestamp;

  /**
   * Field legacy.
   *
   * Tetap dibaca jika berita lama
   * memiliki content tambahan.
   */
  content?: string;
}

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
  // YYYY-MM-DD
  // =======================================================

  const isoDateMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;

    return createValidatedDate(Number(year), Number(month), Number(day));
  }

  // =======================================================
  // LEGACY
  // =======================================================

  const legacyMatch = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (legacyMatch) {
    const [, day, month, year] = legacyMatch;

    return createValidatedDate(Number(year), Number(month), Number(day));
  }

  // =======================================================
  // ISO DATETIME
  // =======================================================

  const fallback = new Date(normalized);

  if (Number.isNaN(fallback.getTime())) {
    return null;
  }

  return fallback;
}

function getNewsTimestamp(item: NewsItem) {
  if (item.dateCreatedAt && typeof item.dateCreatedAt.toMillis === "function") {
    return item.dateCreatedAt.toMillis();
  }

  const legacyDate = parseNewsDate(item.dateCreated);

  if (legacyDate) {
    return legacyDate.getTime();
  }

  if (item.createdAt && typeof item.createdAt.toMillis === "function") {
    return item.createdAt.toMillis();
  }

  return 0;
}

function formatNewsDate(value: string) {
  const date = parseNewsDate(value);

  if (!date) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTimeAgo(value: string) {
  const date = parseNewsDate(value);

  if (!date) {
    return "";
  }

  const difference = Date.now() - date.getTime();

  /**
   * Jika tanggal berita berada
   * di masa depan, jangan menampilkan
   * angka negatif.
   */
  if (difference < 0) {
    return formatNewsDate(value);
  }

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) {
    return "Baru saja";
  }

  if (minutes < 60) {
    return `${minutes} menit yang lalu`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} jam yang lalu`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} hari yang lalu`;
  }

  return formatNewsDate(value);
}

// =========================================================
// CATEGORY
// =========================================================

function getCategoryClass(category?: string) {
  const classes: Record<string, string> = {
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

    /**
     * Legacy categories.
     */
    Acara: "border-blue-100 bg-blue-50 text-blue-700",

    Pengumuman: "border-purple-100 bg-purple-50 text-purple-700",

    Prestasi: "border-green-100 bg-green-50 text-green-700",
  };

  return classes[category ?? ""] ?? "border-gray-200 bg-gray-100 text-gray-700";
}

// =========================================================
// TEXT
// =========================================================

function splitParagraphs(text?: string) {
  if (!text) {
    return [];
  }

  const doubleBreak = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (doubleBreak.length > 1) {
    return doubleBreak;
  }

  return text
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

// =========================================================
// PAGE
// =========================================================

export default function NewsDetail() {
  const params = useParams<{
    id: string;
  }>();

  const id = params?.id;

  const reduceMotion = useReducedMotion();

  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);

  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [shareFeedback, setShareFeedback] = useState("");

  // =======================================================
  // FETCH
  // =======================================================

  useEffect(() => {
    if (!id) {
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        setError(null);

        const [currentDocument, allNewsSnapshot] = await Promise.all([getDoc(doc(newsCollection, id)), getDocs(newsCollection)]);

        if (!mounted) {
          return;
        }

        // =========================================
        // NOT FOUND
        // =========================================

        if (!currentDocument.exists()) {
          setNewsItem(null);

          setError("Berita yang Anda cari tidak ditemukan.");

          return;
        }

        const currentNews = {
          ...currentDocument.data(),

          id: currentDocument.id,
        } as NewsItem;

        setNewsItem(currentNews);

        // =========================================
        // RELATED / LATEST NEWS
        // =========================================

        const allNews = allNewsSnapshot.docs.map(
          (document) =>
            ({
              ...document.data(),

              id: document.id,
            }) as NewsItem,
        );

        const related = allNews
          .filter((item) => item.id !== id)
          .sort((a, b) => getNewsTimestamp(b) - getNewsTimestamp(a))
          .slice(0, 4);

        setLatestNews(related);
      } catch (fetchError) {
        console.error("Error fetching news:", fetchError);

        if (!mounted) {
          return;
        }

        setError("Terjadi kesalahan saat memuat berita.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      mounted = false;
    };
  }, [id]);

  // =======================================================
  // SHARE
  // =======================================================

  const handleShare = async () => {
    if (!newsItem) {
      return;
    }

    const url = window.location.href;

    const shareData = {
      title: newsItem.titleNews,

      text: newsItem.descriptionNews,

      url,
    };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);

        return;
      } catch (shareError) {
        if (shareError instanceof DOMException && shareError.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);

      setShareFeedback("Tautan disalin");
    } catch {
      setShareFeedback("Gagal menyalin");
    }
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return <NewsDetailSkeleton />;
  }

  // =======================================================
  // NOT FOUND / ERROR
  // =======================================================

  if (!newsItem) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-gray-50
          px-4
          pb-16
          pt-28
        "
      >
        <div
          className="
            max-w-md
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
              bg-white
              text-2xl
              text-gray-300
              shadow-sm
            "
          >
            <IoNewspaperOutline />
          </div>

          <h1
            className="
              mt-5
              text-2xl
              font-bold
              text-gray-900
            "
          >
            Berita Tidak Ditemukan
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-gray-500
            "
          >
            {error ?? "Berita yang Anda cari tidak tersedia."}
          </p>

          <Link
            href="/pages/news"
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition-colors

              hover:bg-blue-500
            "
          >
            <FiArrowLeft />
            Kembali ke Berita
          </Link>
        </div>
      </main>
    );
  }

  const descriptionParagraphs = splitParagraphs(newsItem.descriptionNews);

  const contentParagraphs = splitParagraphs(newsItem.content);

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-gradient-to-b
        from-gray-50
        via-white
        to-white
        pb-16
        pt-24

        sm:pt-28

        lg:pb-20
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
        "
      >
        <div
          className="
            absolute
            -right-40
            top-20
            h-96
            w-96
            rounded-full
            bg-blue-100/50
            blur-3xl
          "
        />
      </div>

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-4

          sm:px-6

          lg:px-8
        "
      >
        {/* =======================================
            BACK
        ======================================== */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  x: -10,
                }
          }
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="
            mx-auto
            mb-6
            max-w-5xl

            sm:mb-8
          "
        >
          <Link
            href="/pages/news"
            className="
              group
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-gray-500
              transition-colors

              hover:text-blue-700
            "
          >
            <FiArrowLeft
              className="
                transition-transform

                group-hover:-translate-x-1
              "
            />
            Kembali ke Berita
          </Link>
        </motion.div>

        {/* =======================================
            ARTICLE
        ======================================== */}

        <motion.article
          initial={
            reduceMotion
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
          }}
          className="
            mx-auto
            max-w-5xl
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-xl
            shadow-gray-900/5

            sm:rounded-3xl
          "
        >
          {/* =====================================
              ARTICLE HEADER
          ====================================== */}

          <div
            className="
              px-5
              pb-6
              pt-6

              sm:px-8
              sm:pb-8
              sm:pt-8

              lg:px-10
              lg:pt-10
            "
          >
            <div
              className="
                flex
                flex-wrap
                items-center
                justify-between
                gap-4
              "
            >
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                {newsItem.categoryNews && (
                  <span
                    className={`
                      rounded-full
                      border
                      px-3
                      py-1.5
                      text-xs
                      font-semibold

                      ${getCategoryClass(newsItem.categoryNews)}
                    `}
                  >
                    {newsItem.categoryNews}
                  </span>
                )}

                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    text-xs
                    text-gray-400
                  "
                >
                  <IoTimeOutline />

                  {formatTimeAgo(newsItem.dateCreated)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  void handleShare();
                }}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-gray-600
                  transition-colors

                  hover:bg-gray-50
                  hover:text-blue-700
                "
              >
                {shareFeedback === "Tautan disalin" ? <FiCheck className="text-green-600" /> : <FiShare2 />}

                {shareFeedback || "Bagikan"}
              </button>
            </div>

            {/* ===================================
                TITLE
            ==================================== */}

            <h1
              className="
                mt-6
                max-w-4xl
                text-3xl
                font-bold
                leading-tight
                tracking-tight
                text-gray-900

                sm:text-4xl

                lg:text-5xl
              "
            >
              {newsItem.titleNews}
            </h1>

            {/* ===================================
                META
            ==================================== */}

            <div
              className="
                mt-6
                flex
                flex-col
                gap-3
                rounded-2xl
                bg-gray-50
                p-4

                sm:flex-row
                sm:items-center
                sm:gap-6
              "
            >
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <FiUser />
                </span>

                <div className="min-w-0">
                  <p
                    className="
                      text-[11px]
                      font-medium
                      uppercase
                      tracking-wide
                      text-gray-400
                    "
                  >
                    Penulis
                  </p>

                  <p
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-gray-700
                    "
                  >
                    {newsItem.writterNews}
                  </p>
                </div>
              </div>

              <div
                className="
                  hidden
                  h-8
                  w-px
                  bg-gray-200

                  sm:block
                "
              />

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <FiCalendar />
                </span>

                <div>
                  <p
                    className="
                      text-[11px]
                      font-medium
                      uppercase
                      tracking-wide
                      text-gray-400
                    "
                  >
                    Dipublikasikan
                  </p>

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-gray-700
                    "
                  >
                    {formatNewsDate(newsItem.dateCreated)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================
              FEATURED IMAGE
          ====================================== */}

          <ArticleImage src={newsItem.imageUrl} alt={newsItem.titleNews} />

          {/* =====================================
              ARTICLE CONTENT
          ====================================== */}

          <div
            className="
              px-5
              py-8

              sm:px-8
              sm:py-10

              lg:px-10
              lg:py-12
            "
          >
            <div
              className="
                mx-auto
                max-w-3xl
              "
            >
              <div className="space-y-5">
                {descriptionParagraphs.map((paragraph, index) => (
                  <p
                    key={`${index}-${paragraph.slice(0, 20)}`}
                    className="
                        text-base
                        leading-8
                        text-gray-700

                        sm:text-lg
                      "
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {contentParagraphs.length > 0 && (
                <div
                  className="
                    mt-6
                    space-y-5
                  "
                >
                  {contentParagraphs.map((paragraph, index) => (
                    <p
                      key={`${index}-${paragraph.slice(0, 20)}`}
                      className="
                          text-base
                          leading-8
                          text-gray-700

                          sm:text-lg
                        "
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {/* =================================
                  TAGS
              ================================== */}

              <div
                className="
                  mt-10
                  flex
                  flex-wrap
                  items-center
                  gap-2
                  border-t
                  border-gray-100
                  pt-6
                "
              >
                <span
                  className="
                    mr-1
                    text-xs
                    font-medium
                    text-gray-400
                  "
                >
                  Topik
                </span>

                {newsItem.categoryNews && (
                  <span
                    className="
                      rounded-full
                      bg-blue-50
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      text-blue-700
                    "
                  >
                    #{newsItem.categoryNews}
                  </span>
                )}

                <span
                  className="
                    rounded-full
                    bg-gray-100
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-gray-600
                  "
                >
                  #HMPTI
                </span>

                <span
                  className="
                    rounded-full
                    bg-gray-100
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-gray-600
                  "
                >
                  #TeknikInformatika
                </span>
              </div>
            </div>
          </div>
        </motion.article>

        {/* =======================================
            LATEST NEWS
        ======================================== */}

        <section
          className="
            mx-auto
            mt-14
            max-w-7xl

            sm:mt-16

            lg:mt-20
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3

              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <span
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-blue-600
                "
              >
                Baca Berikutnya
              </span>

              <h2
                className="
                  mt-2
                  text-2xl
                  font-bold
                  tracking-tight
                  text-gray-900

                  sm:text-3xl
                "
              >
                Berita Terkini Lainnya
              </h2>
            </div>

            <Link
              href="/pages/news"
              className="
                group
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-blue-600
              "
            >
              Lihat semua
              <FiArrowRight
                className="
                  transition-transform

                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>

          {latestNews.length > 0 ? (
            <div
              className="
                mt-6
                grid
                grid-cols-1
                gap-5

                sm:grid-cols-2

                lg:grid-cols-4
              "
            >
              {latestNews.map((item) => (
                <RelatedNewsCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div
              className="
                mt-6
                rounded-2xl
                border
                border-dashed
                border-gray-200
                bg-white
                px-5
                py-12
                text-center
              "
            >
              <IoNewspaperOutline
                className="
                  mx-auto
                  text-3xl
                  text-gray-300
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  text-gray-500
                "
              >
                Belum ada berita lainnya.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// =========================================================
// ARTICLE IMAGE
// =========================================================

function ArticleImage({
  src,
  alt,
}: {
  src?: string;

  alt: string;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <div
      className="
        relative
        aspect-video
        w-full
        overflow-hidden
        bg-gray-100
      "
    >
      {src && !hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="
            (max-width: 1023px) 100vw,
            960px
          "
          onError={() => setHasError(true)}
          className="object-cover"
        />
      ) : (
        <div
          className="
            flex
            h-full
            w-full
            items-center
            justify-center
            bg-gradient-to-br
            from-blue-50
            to-gray-100
          "
        >
          <IoNewspaperOutline
            className="
              text-4xl
              text-gray-300
            "
          />
        </div>
      )}
    </div>
  );
}

// =========================================================
// RELATED NEWS CARD
// =========================================================

function RelatedNewsCard({ item }: { item: NewsItem }) {
  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-lg
        hover:shadow-gray-900/5
      "
    >
      <Link
        href={`/pages/news/${item.id}`}
        className="
          flex
          h-full
          flex-col
        "
      >
        <div
          className="
            relative
            aspect-[4/3]
            overflow-hidden
            bg-gray-100
          "
        >
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.titleNews}
              fill
              sizes="
                (max-width: 639px) 100vw,
                (max-width: 1023px) 50vw,
                25vw
              "
              className="
                object-cover
                transition-transform
                duration-500

                group-hover:scale-[1.035]
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
              "
            >
              <IoNewspaperOutline
                className="
                  text-3xl
                  text-gray-300
                "
              />
            </div>
          )}

          {item.categoryNews && (
            <span
              className={`
                absolute
                left-3
                top-3
                rounded-full
                border
                px-2.5
                py-1
                text-[10px]
                font-semibold

                ${getCategoryClass(item.categoryNews)}
              `}
            >
              {item.categoryNews}
            </span>
          )}
        </div>

        <div
          className="
            flex
            flex-1
            flex-col
            p-4
          "
        >
          <span
            className="
              flex
              items-center
              gap-1.5
              text-[11px]
              text-gray-400
            "
          >
            <FiCalendar />

            {formatNewsDate(item.dateCreated)}
          </span>

          <h3
            className="
              mt-2
              line-clamp-2
              text-sm
              font-bold
              leading-5
              text-gray-900
              transition-colors

              group-hover:text-blue-700
            "
          >
            {item.titleNews}
          </h3>

          <p
            className="
              mt-2
              line-clamp-2
              text-xs
              leading-5
              text-gray-500
            "
          >
            {item.descriptionNews}
          </p>

          <span
            className="
              mt-auto
              inline-flex
              items-center
              gap-1
              pt-4
              text-xs
              font-semibold
              text-blue-600
            "
          >
            Baca selengkapnya
            <FiArrowRight
              className="
                transition-transform

                group-hover:translate-x-1
              "
            />
          </span>
        </div>
      </Link>
    </article>
  );
}

// =========================================================
// DETAIL SKELETON
// =========================================================

function NewsDetailSkeleton() {
  return (
    <main
      className="
        min-h-screen
        bg-gray-50
        px-4
        pb-16
        pt-24

        sm:px-6
        sm:pt-28

        lg:px-8
      "
    >
      <div
        className="
          mx-auto
          max-w-5xl
        "
      >
        <div
          className="
            mb-6
            h-5
            w-32
            animate-pulse
            rounded
            bg-gray-200
          "
        />

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
          "
        >
          <div
            className="
              space-y-4
              p-6

              sm:p-8
            "
          >
            <div
              className="
                h-6
                w-28
                animate-pulse
                rounded-full
                bg-gray-100
              "
            />

            <div
              className="
                h-9
                w-4/5
                animate-pulse
                rounded
                bg-gray-200
              "
            />

            <div
              className="
                h-9
                w-2/3
                animate-pulse
                rounded
                bg-gray-200
              "
            />

            <div
              className="
                h-16
                animate-pulse
                rounded-xl
                bg-gray-100
              "
            />
          </div>

          <div
            className="
              aspect-video
              animate-pulse
              bg-gray-200
            "
          />

          <div
            className="
              space-y-4
              p-6

              sm:p-8
            "
          >
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="
                    h-4
                    animate-pulse
                    rounded
                    bg-gray-100
                  "
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

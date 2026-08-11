"use client";

import { db } from "@/lib/firebase";

import { collection, getDocs, type Timestamp } from "firebase/firestore";

import { motion, useReducedMotion } from "framer-motion";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

import { FiArrowRight, FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiMapPin } from "react-icons/fi";

import { IoCalendarOutline } from "react-icons/io5";

// =========================================================
// TYPES
// =========================================================

interface Event {
  id: string;

  eventName: string;

  /**
   * Field tanggal lama.
   *
   * Tetap dipakai agar data lama
   * masih dapat ditampilkan.
   */
  dateEvent: string;

  /**
   * Field tanggal baru dari admin.
   *
   * Digunakan untuk sorting tanggal
   * dengan lebih akurat.
   */
  dateEventAt?: Timestamp;

  imageUrl: string;

  descriptionEvent: string;

  linkForm?: string;

  statusEvent?: string;

  categoryEvent?: string;

  categoryAudiens?: string;

  timeEvent?: string;

  organizer?: string;

  location?: string;

  capacity?: number | null;
}

// =========================================================
// CONSTANTS
// =========================================================

const EVENTS_PER_PAGE = 8;

// =========================================================
// DATE HELPERS
// =========================================================

function parseEventDate(value: string): Date | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();

  // =======================================================
  // FORMAT BARU: YYYY-MM-DD
  // =======================================================

  const isoMatch = normalizedValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;

    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  // =======================================================
  // FORMAT LAMA:
  // DD/MM/YYYY
  // DD-MM-YYYY
  // =======================================================

  const legacyMatch = normalizedValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (legacyMatch) {
    const [, day, month, year] = legacyMatch;

    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  // =======================================================
  // FALLBACK
  // =======================================================

  const fallbackDate = new Date(normalizedValue);

  if (Number.isNaN(fallbackDate.getTime())) {
    return null;
  }

  return fallbackDate;
}

function formatEventDate(value: string) {
  const date = parseEventDate(value);

  if (!date) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getEventTimestamp(event: Event) {
  /**
   * Prioritas pertama:
   * Timestamp baru dari Firestore.
   */
  if (event.dateEventAt && typeof event.dateEventAt.toMillis === "function") {
    return event.dateEventAt.toMillis();
  }

  /**
   * Fallback untuk event lama.
   */
  return parseEventDate(event.dateEvent)?.getTime() ?? 0;
}

// =========================================================
// STATUS HELPERS
// =========================================================

function getStatusLabel(status?: string) {
  const normalized = status?.trim().toLowerCase();

  if (normalized === "cooming soon" || normalized === "coming soon") {
    return "Coming Soon";
  }

  if (normalized === "berlangsung" || normalized === "sedang berlangsung") {
    return "Sedang Berlangsung";
  }

  return status?.trim() || "Belum Ditentukan";
}

function getStatusClass(status?: string) {
  const normalized = status?.trim().toLowerCase();

  if (normalized === "selesai") {
    return `
      border-green-100
      bg-green-50
      text-green-700
    `;
  }

  if (normalized === "berlangsung" || normalized === "sedang berlangsung") {
    return `
      border-blue-100
      bg-blue-50
      text-blue-700
    `;
  }

  if (normalized === "coming soon" || normalized === "cooming soon") {
    return `
      border-amber-100
      bg-amber-50
      text-amber-700
    `;
  }

  if (normalized === "batal") {
    return `
      border-red-100
      bg-red-50
      text-red-700
    `;
  }

  return `
    border-gray-200
    bg-gray-100
    text-gray-600
  `;
}

// =========================================================
// PAGE
// =========================================================

export default function EventPage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroViewEvent />

      <EventView />
    </main>
  );
}

// =========================================================
// HERO
// =========================================================

function HeroViewEvent() {
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
        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
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
          <IoCalendarOutline className="text-white" />

          <span
            className="
              text-xs
              font-semibold
              text-white

              sm:text-sm
            "
          >
            Event & Kegiatan
          </span>
        </motion.div>

        <motion.h1
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.65,
            delay: 0.08,
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
          Bersama Membangun
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
            Masa Depan
          </span>
          Teknologi
        </motion.h1>

        <motion.p
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.65,
            delay: 0.16,
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
          Ikuti berbagai kegiatan HMPTI, eksplorasi inovasi, dan temukan pengalaman baru bersama komunitas teknologi.
        </motion.p>

        <motion.div
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            delay: 0.24,
          }}
          className="mt-8"
        >
          <a
            href="#daftar-event"
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
            Lihat Event
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
// EVENT VIEW
// =========================================================

function EventView() {
  const shouldReduceMotion = useReducedMotion();

  const [events, setEvents] = useState<Event[]>([]);

  const [currentPage, setCurrentPage] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        setLoading(true);

        setError(null);

        const snapshot = await getDocs(collection(db, "events"));

        const eventList = snapshot.docs.map(
          (document) =>
            ({
              id: document.id,

              ...document.data(),
            }) as Event,
        );

        // =========================================
        // SORT DATE
        // =========================================

        const sortedEvents = [...eventList].sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a));

        if (isMounted) {
          setEvents(sortedEvents);

          setCurrentPage(0);
        }
      } catch (err) {
        console.error("Error fetching events:", err);

        if (isMounted) {
          setError("Gagal memuat data event. Silakan coba kembali.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, [retryKey]);

  const totalPages = Math.ceil(events.length / EVENTS_PER_PAGE);

  const selectedEvents = useMemo(() => {
    const startIndex = currentPage * EVENTS_PER_PAGE;

    return events.slice(startIndex, startIndex + EVENTS_PER_PAGE);
  }, [currentPage, events]);

  const changePage = (page: number) => {
    if (page < 0 || page >= totalPages) {
      return;
    }

    setCurrentPage(page);

    window.requestAnimationFrame(() => {
      document.getElementById("daftar-event")?.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",

        block: "start",
      });
    });
  };

  return (
    <section
      id="daftar-event"
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
      <EventBackground />

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
          initial={{
            opacity: 0,
            y: 20,
          }}
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
            <IoCalendarOutline className="text-blue-500" />

            <span
              className="
                text-xs
                font-semibold
                text-blue-700

                sm:text-sm
              "
            >
              Semua Event
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
              Kegiatan
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
            Temukan kegiatan terbaru dan berbagai program menarik dari HMPTI Universitas Duta Bangsa.
          </p>
        </motion.div>

        {/* =========================================
            LOADING
        ========================================== */}

        {loading && <EventSkeleton />}

        {/* =========================================
            ERROR
        ========================================== */}

        {!loading && error && <EventError message={error} onRetry={() => setRetryKey((value) => value + 1)} />}

        {/* =========================================
            CONTENT
        ========================================== */}

        {!loading && !error && (
          <>
            {selectedEvents.length > 0 && (
              <motion.div
                key={currentPage}
                initial={{
                  opacity: 0,
                  y: 12,
                }}
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
                {selectedEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </motion.div>
            )}

            {/* EMPTY */}

            {events.length === 0 && <EmptyEventState />}

            {/* PAGINATION */}

            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onChange={changePage} />}
          </>
        )}
      </div>
    </section>
  );
}

// =========================================================
// EVENT BACKGROUND
// =========================================================

function EventBackground() {
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
      <div
        className="
          absolute
          inset-0
          opacity-[0.08]
          bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]
        "
      />

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
// EVENT CARD
// =========================================================

function EventCard({ event, index }: { event: Event; index: number }) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,

        delay: Math.min(index * 0.04, 0.2),
      }}
      className="h-full"
    >
      <Link
        href={`/pages/event/${event.id}`}
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
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.eventName}
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
            <EventImagePlaceholder />
          )}

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

          {/* CATEGORY */}

          {event.categoryEvent && (
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
                {event.categoryEvent}
              </span>
            </div>
          )}

          {/* STATUS */}

          <div
            className="
              absolute
              right-3
              top-3
            "
          >
            <span
              className={`
                rounded-full
                border
                px-2.5
                py-1
                text-[11px]
                font-semibold

                ${getStatusClass(event.statusEvent)}
              `}
            >
              {getStatusLabel(event.statusEvent)}
            </span>
          </div>
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
          {/* DATE */}

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

            {formatEventDate(event.dateEvent)}
          </div>

          {/* TITLE */}

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
            {event.eventName}
          </h3>

          {/* OPTIONAL META */}

          {(event.timeEvent || event.location) && (
            <div
              className="
                mt-3
                flex
                flex-wrap
                gap-x-4
                gap-y-2
                text-xs
                text-gray-500
              "
            >
              {event.timeEvent && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                  "
                >
                  <FiClock className="text-blue-500" />

                  {event.timeEvent}
                </span>
              )}

              {event.location && (
                <span
                  className="
                    inline-flex
                    min-w-0
                    items-center
                    gap-1.5
                  "
                >
                  <FiMapPin
                    className="
                      shrink-0
                      text-blue-500
                    "
                  />

                  <span className="line-clamp-1">{event.location}</span>
                </span>
              )}
            </div>
          )}

          {/* DESCRIPTION */}

          <p
            className="
              mt-3
              line-clamp-3
              text-sm
              leading-6
              text-gray-600
            "
          >
            {event.descriptionEvent}
          </p>

          {/* LINK */}

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
            Lihat detail
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

function EventImagePlaceholder() {
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
      <IoCalendarOutline
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

function EventSkeleton() {
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
        length: EVENTS_PER_PAGE,
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

function EventError({ message, onRetry }: { message: string; onRetry: () => void }) {
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
        <IoCalendarOutline
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
        Event Gagal Dimuat
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

function EmptyEventState() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
      }}
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
        <IoCalendarOutline
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
        Belum Ada Event
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-gray-500
        "
      >
        Event dan kegiatan HMPTI berikutnya akan segera tersedia.
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
      aria-label="Navigasi halaman event"
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

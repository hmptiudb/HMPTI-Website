"use client";

import { eventsCollection } from "@/lib/firebase";

import { getDocs, type Timestamp } from "firebase/firestore";

import { MotionConfig, motion } from "framer-motion";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useMemo, useRef, useState } from "react";

import { FiArrowRight, FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiExternalLink, FiMapPin, FiRefreshCw } from "react-icons/fi";

import { IoSparkles, IoTimeOutline } from "react-icons/io5";

// =========================================================
// TYPES
// =========================================================

interface EventItem {
  id: string;

  eventName: string;

  dateEvent: string;

  dateEventAt?: Timestamp;

  imageUrl: string;

  descriptionEvent: string;

  linkForm?: string;

  statusEvent?: string;

  timeEvent?: string;

  location?: string;

  organizer?: string;

  categoryEvent?: string;

  categoryAudiens?: string;

  createdAt?: Timestamp;

  updatedAt?: Timestamp;
}

// =========================================================
// CONSTANTS
// =========================================================

const HOME_EVENT_LIMIT = 6;

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

function parseEventDate(value?: string): Date | null {
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

  const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;

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
  // FALLBACK
  // =======================================================

  const fallback = new Date(normalized);

  if (Number.isNaN(fallback.getTime())) {
    return null;
  }

  return fallback;
}

function getEventDate(event: EventItem): Date | null {
  if (event.dateEventAt && typeof event.dateEventAt.toDate === "function") {
    return event.dateEventAt.toDate();
  }

  const legacyDate = parseEventDate(event.dateEvent);

  if (legacyDate) {
    return legacyDate;
  }

  if (event.createdAt && typeof event.createdAt.toDate === "function") {
    return event.createdAt.toDate();
  }

  return null;
}

function getEventTimestamp(event: EventItem) {
  return getEventDate(event)?.getTime() ?? 0;
}

function formatEventDate(event: EventItem) {
  const date = getEventDate(event);

  if (!date) {
    return event.dateEvent || "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// =========================================================
// STATUS HELPERS
// =========================================================

function normalizeEventStatus(status?: string) {
  const normalized = status?.trim().toLowerCase();

  if (normalized === "coming soon" || normalized === "cooming soon") {
    return "Coming Soon";
  }

  if (normalized === "berlangsung" || normalized === "sedang berlangsung") {
    return "Sedang Berlangsung";
  }

  if (normalized === "selesai") {
    return "Selesai";
  }

  if (normalized === "pending") {
    return "Pending";
  }

  if (normalized === "batal") {
    return "Batal";
  }

  return status?.trim() || "Belum Ditentukan";
}

function getStatusClass(status?: string) {
  switch (normalizeEventStatus(status)) {
    case "Selesai":
      return `
        border-green-100
        bg-green-50
        text-green-700
      `;

    case "Sedang Berlangsung":
      return `
        border-blue-100
        bg-blue-50
        text-blue-700
      `;

    case "Coming Soon":
      return `
        border-amber-100
        bg-amber-50
        text-amber-700
      `;

    case "Batal":
      return `
        border-red-100
        bg-red-50
        text-red-700
      `;

    case "Pending":
      return `
        border-gray-200
        bg-gray-100
        text-gray-600
      `;

    default:
      return `
        border-gray-200
        bg-gray-100
        text-gray-600
      `;
  }
}

// =========================================================
// COMPONENT
// =========================================================

export default function EventViewHome() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const [events, setEvents] = useState<EventItem[]>([]);

  const [activeIndex, setActiveIndex] = useState(0);

  const [isHovered, setIsHovered] = useState(false);

  const [isVisible, setIsVisible] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [retryKey, setRetryKey] = useState(0);

  // =======================================================
  // OBSERVE SECTION VISIBILITY
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
  // FETCH EVENTS
  // =======================================================

  useEffect(() => {
    let active = true;

    const fetchEvents = async () => {
      try {
        setLoading(true);

        setError(null);

        /**
         * Tidak memakai orderBy Firestore
         * agar data lama dan data baru
         * tetap kompatibel.
         */
        const snapshot = await getDocs(eventsCollection);

        const eventList = snapshot.docs
          .map(
            (document) =>
              ({
                id: document.id,

                ...document.data(),
              }) as EventItem,
          )

          // =====================================
          // Hindari duplikasi dengan Activity
          // section yang sudah menampilkan
          // FESTI / SIBARMATI secara khusus.
          // =====================================

          .filter((event) => {
            const eventName = event.eventName?.trim().toLowerCase();

            return !["festi", "sibarmati"].includes(eventName || "");
          })

          // =====================================
          // SORT BERDASARKAN TANGGAL EVENT
          // =====================================

          .sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a))

          // =====================================
          // HOMEPAGE TIDAK PERLU MENAMPILKAN
          // SELURUH EVENT
          // =====================================

          .slice(0, HOME_EVENT_LIMIT);

        if (!active) {
          return;
        }

        setEvents(eventList);

        setActiveIndex(0);
      } catch (fetchError) {
        console.error("Error fetching home events:", fetchError);

        if (!active) {
          return;
        }

        setError("Event belum dapat dimuat. Silakan coba kembali.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchEvents();

    return () => {
      active = false;
    };
  }, [retryKey]);

  // =======================================================
  // AUTOPLAY MOBILE
  // =======================================================

  useEffect(() => {
    if (events.length <= 1 || isHovered || !isVisible) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % events.length);
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [events.length, isHovered, isVisible]);

  // =======================================================
  // DESKTOP EVENTS
  // =======================================================

  const desktopEvents = useMemo(() => events.slice(0, 3), [events]);

  // =======================================================
  // NAVIGATION
  // =======================================================

  const previousEvent = () => {
    if (events.length <= 1) {
      return;
    }

    setActiveIndex((previous) => (previous - 1 + events.length) % events.length);
  };

  const nextEvent = () => {
    if (events.length <= 1) {
      return;
    }

    setActiveIndex((previous) => (previous + 1) % events.length);
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
              opacity-[0.07]
              bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]
            "
          />

          <div
            className="
              absolute
              -right-32
              top-10
              hidden
              h-80
              w-80
              rounded-full
              bg-blue-200/20
              blur-3xl

              md:block
            "
          />

          <div
            className="
              absolute
              -bottom-32
              -left-24
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
              SECTION HEADER
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

              <span
                className="
                  text-xs
                  font-semibold
                  text-blue-700

                  sm:text-sm
                "
              >
                Event Terbaru
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
              Temukan berbagai kegiatan dan event HMPTI yang dirancang untuk mengembangkan kompetensi, pengalaman, dan kolaborasi mahasiswa Teknik Informatika.
            </p>
          </motion.div>

          {/* =======================================
              LOADING
          ======================================== */}

          {loading && <EventSkeleton />}

          {/* =======================================
              ERROR
          ======================================== */}

          {!loading && error && <EventError message={error} onRetry={() => setRetryKey((previous) => previous + 1)} />}

          {/* =======================================
              EVENTS
          ======================================== */}

          {!loading && !error && events.length > 0 && (
            <>
              {/* =================================
                    DESKTOP
                ================================== */}

              <div
                className="
                    hidden
                    grid-cols-1
                    gap-6

                    md:grid

                    lg:grid-cols-3
                  "
              >
                {desktopEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>

              {/* =================================
                    MOBILE CAROUSEL
                ================================== */}

              <div
                className="
                    md:hidden
                  "
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <motion.div
                  key={events[activeIndex]?.id}
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: 0.35,
                  }}
                >
                  <MobileEventCard event={events[activeIndex]} />
                </motion.div>

                {/* ===============================
                      MOBILE CONTROLS
                  ================================ */}

                {events.length > 1 && (
                  <div
                    className="
                        mt-5
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                  >
                    <button
                      type="button"
                      onClick={previousEvent}
                      aria-label="Event sebelumnya"
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

                    {/* DOTS */}

                    <div
                      className="
                          flex
                          flex-wrap
                          items-center
                          justify-center
                          gap-2
                        "
                    >
                      {events.map((event, index) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => setActiveIndex(index)}
                          aria-label={`Tampilkan event ${index + 1}`}
                          aria-current={activeIndex === index ? "true" : undefined}
                          className={`
                                h-2
                                rounded-full
                                transition-all

                                ${
                                  activeIndex === index
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

                    <button
                      type="button"
                      onClick={nextEvent}
                      aria-label="Event berikutnya"
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
              </div>

              {/* =================================
                    CTA
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
                  href="/pages/event"
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
                  Lihat Semua Event
                  <FiExternalLink
                    className="
                        transition-transform

                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                  />
                </Link>
              </motion.div>
            </>
          )}

          {/* =======================================
              EMPTY
          ======================================== */}

          {!loading && !error && events.length === 0 && <EmptyEventState />}
        </div>
      </section>
    </MotionConfig>
  );
}

// =========================================================
// DESKTOP EVENT CARD
// =========================================================

function EventCard({
  event,
  index,
}: {
  event: EventItem;

  index: number;
}) {
  return (
    <motion.article
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
        amount: 0.1,
      }}
      transition={{
        duration: 0.45,

        delay: Math.min(index * 0.07, 0.2),
      }}
      className="
        group
        h-full
      "
    >
      <Link
        href={`/pages/event/${event.id}`}
        className="
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
          hover:border-blue-100
          hover:shadow-xl
          hover:shadow-blue-900/5
        "
      >
        {/* =========================================
            IMAGE
        ========================================== */}

        <EventImage event={event} />

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
          <EventMetadata event={event} />

          <h3
            className="
              mt-4
              line-clamp-2
              text-xl
              font-bold
              leading-snug
              text-gray-900
              transition-colors

              group-hover:text-blue-600
            "
          >
            {event.eventName}
          </h3>

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
            Detail Event
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
// MOBILE EVENT CARD
// =========================================================

function MobileEventCard({ event }: { event: EventItem }) {
  return (
    <article
      className="
        overflow-hidden
        rounded-2xl
        border
        border-gray-100
        bg-white
        shadow-sm
      "
    >
      <Link href={`/pages/event/${event.id}`} className="block">
        <EventImage event={event} />

        <div className="p-5">
          <EventMetadata event={event} />

          <h3
            className="
              mt-4
              text-xl
              font-bold
              leading-snug
              text-gray-900
            "
          >
            {event.eventName}
          </h3>

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

          <div
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-blue-600
            "
          >
            Detail Event
            <FiArrowRight />
          </div>
        </div>
      </Link>
    </article>
  );
}

// =========================================================
// EVENT IMAGE
// =========================================================

function EventImage({ event }: { event: EventItem }) {
  return (
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
            (max-width: 767px) 92vw,
            (max-width: 1023px) 46vw,
            31vw
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
            bg-gradient-to-br
            from-blue-50
            to-cyan-100
          "
        >
          <FiCalendar
            className="
              text-4xl
              text-blue-300
            "
          />
        </div>
      )}

      {/* =========================================
          OVERLAY
      ========================================== */}

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

      {/* =========================================
          CATEGORY
      ========================================== */}

      {event.categoryEvent && (
        <span
          className="
            absolute
            left-3
            top-3
            max-w-[55%]
            truncate
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
      )}

      {/* =========================================
          STATUS
      ========================================== */}

      <span
        className={`
          absolute
          right-3
          top-3
          rounded-full
          border
          px-2.5
          py-1
          text-[11px]
          font-semibold
          shadow-sm

          ${getStatusClass(event.statusEvent)}
        `}
      >
        {normalizeEventStatus(event.statusEvent)}
      </span>
    </div>
  );
}

// =========================================================
// EVENT METADATA
// =========================================================

function EventMetadata({ event }: { event: EventItem }) {
  return (
    <div
      className="
        flex
        flex-wrap
        gap-2
      "
    >
      {/* DATE */}

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

        {formatEventDate(event)}
      </span>

      {/* TIME */}

      {event.timeEvent && (
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
          <FiClock className="text-blue-500" />

          {event.timeEvent}
        </span>
      )}

      {/* LOCATION */}

      {event.location && (
        <span
          className="
            inline-flex
            max-w-full
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
          <FiMapPin
            className="
              shrink-0
              text-blue-500
            "
          />

          <span className="truncate">{event.location}</span>
        </span>
      )}
    </div>
  );
}

// =========================================================
// LOADING SKELETON
// =========================================================

function EventSkeleton() {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-6

        md:grid-cols-2

        lg:grid-cols-3
      "
    >
      {Array.from({
        length: 3,
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
                  h-6
                  w-4/5
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
// ERROR STATE
// =========================================================

function EventError({
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
        <FiCalendar className="text-xl" />
      </div>

      <h3
        className="
          mt-4
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
// EMPTY STATE
// =========================================================

function EmptyEventState() {
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
        <IoTimeOutline className="text-3xl" />
      </div>

      <h3
        className="
          mt-4
          text-lg
          font-bold
          text-gray-900
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
        Event dan kegiatan terbaru HMPTI akan ditampilkan di bagian ini setelah tersedia.
      </p>
    </motion.div>
  );
}

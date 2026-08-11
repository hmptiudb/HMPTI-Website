"use client";

import { db } from "@/lib/firebase";

import { collection, doc, getDoc, getDocs, type Timestamp } from "firebase/firestore";

import { motion } from "framer-motion";

import Image from "next/image";
import Link from "next/link";

import { type ReactNode, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { FiArrowLeft, FiArrowRight, FiCalendar, FiChevronRight, FiClock, FiExternalLink, FiMapPin, FiShare2, FiUsers } from "react-icons/fi";

import { IoCalendarOutline, IoPeopleOutline } from "react-icons/io5";

// =========================================================
// TYPES
// =========================================================

interface Event {
  id: string;

  eventName: string;

  /**
   * Tanggal lama.
   *
   * Tetap dipertahankan agar data
   * event lama masih dapat dibaca.
   */
  dateEvent: string;

  /**
   * Timestamp baru dari admin Event.
   */
  dateEventAt?: Timestamp;

  imageUrl: string;

  descriptionEvent: string;

  linkForm?: string;

  statusEvent?: string;

  timeEvent?: string;

  categoryEvent?: string;

  categoryAudiens?: string;

  organizer?: string;

  location?: string;

  capacity?: number | null;
}

interface MetadataItemData {
  key: string;
  icon: ReactNode;
  label: string;
  value: string;
}

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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getEventTimestamp(event: Event) {
  if (event.dateEventAt && typeof event.dateEventAt.toMillis === "function") {
    return event.dateEventAt.toMillis();
  }

  return parseEventDate(event.dateEvent)?.getTime() ?? 0;
}

// =========================================================
// STATUS
// =========================================================

function getStatusLabel(status?: string) {
  const normalized = status?.trim().toLowerCase();

  if (normalized === "coming soon" || normalized === "cooming soon") {
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
// CATEGORY
// =========================================================

function getCategoryClass(category?: string) {
  const classes: Record<string, string> = {
    "Web Development": "bg-blue-50 text-blue-700 border-blue-100",

    "Web Design": "bg-sky-50 text-sky-700 border-sky-100",

    "UI/UX": "bg-purple-50 text-purple-700 border-purple-100",

    "Graphic Design": "bg-pink-50 text-pink-700 border-pink-100",

    "Mobile Development": "bg-orange-50 text-orange-700 border-orange-100",

    "Data Science": "bg-green-50 text-green-700 border-green-100",

    "Internet of Things": "bg-emerald-50 text-emerald-700 border-emerald-100",

    "Big Data": "bg-teal-50 text-teal-700 border-teal-100",

    "Cyber Security": "bg-red-50 text-red-700 border-red-100",

    Workshop: "bg-cyan-50 text-cyan-700 border-cyan-100",

    Seminar: "bg-indigo-50 text-indigo-700 border-indigo-100",

    Competition: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return classes[category || ""] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

// =========================================================
// PAGE
// =========================================================

export default function EventDetail() {
  const params = useParams();

  const router = useRouter();

  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [event, setEvent] = useState<Event | null>(null);

  const [latestEvents, setLatestEvents] = useState<Event[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [shareMessage, setShareMessage] = useState("");

  // =======================================================
  // FETCH DATA
  // =======================================================

  useEffect(() => {
    if (!eventId) {
      router.replace("/pages/event");

      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        setError(null);

        // =========================================
        // CURRENT EVENT
        // =========================================

        const eventDocument = await getDoc(doc(db, "events", eventId));

        if (!eventDocument.exists()) {
          throw new Error("Event tidak ditemukan");
        }

        const currentEvent = {
          id: eventDocument.id,

          ...eventDocument.data(),
        } as Event;

        // =========================================
        // OTHER EVENTS
        // =========================================

        const eventsSnapshot = await getDocs(collection(db, "events"));

        const otherEvents = eventsSnapshot.docs
          .filter((document) => document.id !== eventId)
          .map(
            (document) =>
              ({
                id: document.id,

                ...document.data(),
              }) as Event,
          )
          .sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a))
          .slice(0, 4);

        if (isMounted) {
          setEvent(currentEvent);

          setLatestEvents(otherEvents);
        }
      } catch (err) {
        console.error("Error fetching event data:", err);

        if (isMounted) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat event");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [eventId, router]);

  // =======================================================
  // SHARE
  // =======================================================

  const handleShare = async () => {
    if (!event) {
      return;
    }

    try {
      const url = window.location.href;

      // =========================================
      // NATIVE SHARE
      // =========================================

      if (navigator.share) {
        await navigator.share({
          title: event.eventName,

          text: `Lihat event ${event.eventName} dari HMPTI.`,

          url,
        });

        return;
      }

      // =========================================
      // CLIPBOARD FALLBACK
      // =========================================

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);

        setShareMessage("Tautan disalin");

        window.setTimeout(() => {
          setShareMessage("");
        }, 2000);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      console.error("Gagal membagikan event:", err);

      setShareMessage("Gagal membagikan");

      window.setTimeout(() => {
        setShareMessage("");
      }, 2000);
    }
  };

  // =======================================================
  // STATE
  // =======================================================

  if (loading) {
    return <DetailLoading />;
  }

  if (error) {
    return <DetailError message={error} />;
  }

  if (!event) {
    return null;
  }

  const normalizedStatus = event.statusEvent?.trim().toLowerCase();

  const registrationAvailable = Boolean(event.linkForm) && normalizedStatus !== "selesai" && normalizedStatus !== "batal";

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-gradient-to-br
        from-gray-50
        via-white
        to-blue-50/30
        px-4
        pb-16
        pt-28

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
      </div>

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-6xl
        "
      >
        {/* =========================================
            BACK BUTTON
        ========================================== */}

        <motion.div
          initial={{
            opacity: 0,
            x: -10,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="mb-6"
        >
          <Link
            href="/pages/event"
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
            <FiArrowLeft
              className="
                transition-transform

                group-hover:-translate-x-1
              "
            />
            Kembali ke Event
          </Link>
        </motion.div>

        {/* =========================================
            MAIN EVENT
        ========================================== */}

        <article
          className="
            mx-auto
            max-w-5xl
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="
              overflow-hidden
              rounded-3xl
              border
              border-gray-100
              bg-white
              shadow-xl
              shadow-blue-900/5
            "
          >
            {/* =====================================
                IMAGE
            ====================================== */}

            <div
              className="
                relative
                aspect-[16/10]
                w-full
                overflow-hidden
                bg-gray-100

                sm:aspect-video
              "
            >
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.eventName}
                  fill
                  priority
                  sizes="
                    (max-width: 767px) 100vw,
                    (max-width: 1199px) 90vw,
                    1024px
                  "
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
                    to-cyan-100
                  "
                >
                  <IoCalendarOutline
                    className="
                      text-5xl
                      text-blue-400
                    "
                  />
                </div>
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
            </div>

            {/* =====================================
                CONTENT
            ====================================== */}

            <div
              className="
                p-5

                sm:p-7

                lg:p-10
              "
            >
              {/* ===================================
                  BADGES + SHARE
              ==================================== */}

              <div
                className="
                  mb-5
                  flex
                  flex-wrap
                  items-start
                  justify-between
                  gap-4
                "
              >
                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  {/* CATEGORY */}

                  {event.categoryEvent && (
                    <span
                      className={`
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-xs
                        font-semibold

                        ${getCategoryClass(event.categoryEvent)}
                      `}
                    >
                      {event.categoryEvent}
                    </span>
                  )}

                  {/* AUDIENCE */}

                  {event.categoryAudiens && (
                    <span
                      className="
                        rounded-full
                        border
                        border-purple-100
                        bg-purple-50
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        text-purple-700
                      "
                    >
                      {event.categoryAudiens}
                    </span>
                  )}

                  {/* STATUS */}

                  <span
                    className={`
                      rounded-full
                      border
                      px-3
                      py-1.5
                      text-xs
                      font-semibold

                      ${getStatusClass(event.statusEvent)}
                    `}
                  >
                    {getStatusLabel(event.statusEvent)}
                  </span>
                </div>

                {/* SHARE */}

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  {shareMessage && (
                    <span
                      className="
                        text-xs
                        font-medium
                        text-gray-500
                      "
                    >
                      {shareMessage}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Bagikan event"
                    title="Bagikan event"
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50
                      text-gray-500
                      transition-all

                      hover:border-blue-100
                      hover:bg-blue-50
                      hover:text-blue-600
                    "
                  >
                    <FiShare2 />
                  </button>
                </div>
              </div>

              {/* ===================================
                  TITLE
              ==================================== */}

              <h1
                className="
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
                {event.eventName}
              </h1>

              {/* ===================================
                  METADATA
              ==================================== */}

              <EventMetadata event={event} />

              {/* ===================================
                  DESCRIPTION
              ==================================== */}

              <div
                className="
                  mt-8
                  border-t
                  border-gray-100
                  pt-8
                "
              >
                <h2
                  className="
                    mb-4
                    text-xl
                    font-bold
                    text-gray-900

                    sm:text-2xl
                  "
                >
                  Tentang Event
                </h2>

                <p
                  className="
                    whitespace-pre-line
                    text-sm
                    leading-7
                    text-gray-600

                    sm:text-base
                    sm:leading-8
                  "
                >
                  {event.descriptionEvent}
                </p>
              </div>

              {/* ===================================
                  REGISTRATION
              ==================================== */}

              {registrationAvailable && <RegistrationCTA link={event.linkForm!} />}
            </div>
          </motion.div>
        </article>

        {/* =========================================
            OTHER EVENTS
        ========================================== */}

        <OtherEventsSection events={latestEvents} />
      </div>
    </main>
  );
}

// =========================================================
// EVENT METADATA
// =========================================================

function EventMetadata({ event }: { event: Event }) {
  const metadataItems: MetadataItemData[] = [
    {
      key: "date",

      icon: <FiCalendar />,

      label: "Tanggal",

      value: formatEventDate(event.dateEvent),
    },
  ];

  // =======================================================
  // TIME
  // =======================================================

  if (event.timeEvent) {
    metadataItems.push({
      key: "time",

      icon: <FiClock />,

      label: "Waktu",

      value: event.timeEvent,
    });
  }

  // =======================================================
  // LOCATION
  // =======================================================

  if (event.location) {
    metadataItems.push({
      key: "location",

      icon: <FiMapPin />,

      label: "Lokasi",

      value: event.location,
    });
  }

  // =======================================================
  // ORGANIZER
  // =======================================================

  if (event.organizer) {
    metadataItems.push({
      key: "organizer",

      icon: <IoPeopleOutline />,

      label: "Penyelenggara",

      value: event.organizer,
    });
  }

  // =======================================================
  // CAPACITY
  // =======================================================

  if (typeof event.capacity === "number") {
    metadataItems.push({
      key: "capacity",

      icon: <FiUsers />,

      label: "Kapasitas",

      value: `${event.capacity} peserta`,
    });
  }

  return (
    <div
      className="
        mt-7
        rounded-2xl
        border
        border-gray-100
        bg-gray-50/80
        p-3

        sm:p-4

        lg:mt-8
        lg:p-5
      "
    >
      <div
        className="
          grid
          grid-cols-1
          gap-3

          sm:grid-cols-2

          lg:[grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]
          lg:gap-4
        "
      >
        {metadataItems.map((item) => (
          <MetadataItem key={item.key} icon={item.icon} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  );
}

// =========================================================
// METADATA ITEM
// =========================================================

function MetadataItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div
      className="
        flex
        min-w-0
        items-start
        gap-3
        rounded-xl
        bg-white
        p-3

        sm:p-4

        lg:min-h-[118px]
        lg:gap-4
        lg:p-5
      "
    >
      {/* ICON */}

      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-blue-50
          text-lg
          text-blue-600

          lg:h-11
          lg:w-11
        "
      >
        {icon}
      </div>

      {/* CONTENT */}

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <p
          className="
            text-xs
            font-medium
            text-gray-400

            lg:text-sm
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            break-words
            text-sm
            font-semibold
            leading-5
            text-gray-700

            lg:mt-1.5
            lg:text-base
            lg:leading-6
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// =========================================================
// REGISTRATION CTA
// =========================================================

function RegistrationCTA({ link }: { link: string }) {
  return (
    <div
      className="
        mt-8
        rounded-2xl
        border
        border-blue-100
        bg-gradient-to-r
        from-blue-50
        to-cyan-50
        p-5

        sm:p-6
      "
    >
      <h2
        className="
          text-xl
          font-bold
          text-blue-900
        "
      >
        Tertarik untuk bergabung?
      </h2>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-gray-600

          sm:text-base
        "
      >
        Daftarkan diri dan jadilah bagian dari kegiatan ini.
      </p>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="
          mt-5
          inline-flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-blue-600
          px-6
          py-3
          text-sm
          font-semibold
          text-white
          shadow-lg
          shadow-blue-500/20
          transition-all

          hover:-translate-y-0.5
          hover:bg-blue-500

          sm:w-auto
        "
      >
        Daftar Event
        <FiExternalLink />
      </a>
    </div>
  );
}

// =========================================================
// OTHER EVENTS
// =========================================================

function OtherEventsSection({ events }: { events: Event[] }) {
  return (
    <section
      className="
        mx-auto
        mt-14
        max-w-6xl

        sm:mt-16
        lg:mt-20
      "
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 18,
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
          duration: 0.5,
        }}
        className="
          rounded-3xl
          border
          border-gray-100
          bg-white
          p-5
          shadow-sm

          sm:p-7
          lg:p-8
        "
      >
        {/* =========================================
            HEADER
        ========================================== */}

        <div
          className="
            mb-7
            flex
            flex-col
            gap-2

            sm:mb-8
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.16em]
                text-blue-600
              "
            >
              Jelajahi
            </p>

            <h2
              className="
                mt-1
                text-2xl
                font-bold
                tracking-tight
                text-gray-900

                sm:text-3xl
              "
            >
              Event
              <span
                className="
                  ml-2
                  bg-gradient-to-r
                  from-blue-600
                  to-indigo-600
                  bg-clip-text
                  text-transparent
                "
              >
                Lainnya
              </span>
            </h2>
          </div>

          <Link
            href="/pages/event"
            className="
              hidden
              items-center
              gap-1
              text-sm
              font-semibold
              text-blue-600

              hover:text-blue-700

              sm:inline-flex
            "
          >
            Semua Event
            <FiChevronRight />
          </Link>
        </div>

        {/* =========================================
            EVENTS
        ========================================== */}

        {events.length > 0 ? (
          <div
            className="
              grid
              grid-cols-1
              gap-5

              sm:grid-cols-2

              lg:grid-cols-4
            "
          >
            {events.map((otherEvent) => (
              <OtherEventCard key={otherEvent.id} event={otherEvent} />
            ))}
          </div>
        ) : (
          <div
            className="
              py-10
              text-center
            "
          >
            <IoCalendarOutline
              className="
                mx-auto
                text-4xl
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
              Belum ada event lainnya.
            </p>
          </div>
        )}

        {/* MOBILE BUTTON */}

        <div
          className="
            mt-8
            text-center

            sm:hidden
          "
        >
          <Link
            href="/pages/event"
            className="
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
            "
          >
            Lihat Semua Event
            <FiChevronRight />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

// =========================================================
// OTHER EVENT CARD
// =========================================================

function OtherEventCard({ event }: { event: Event }) {
  return (
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
        bg-gray-50
        transition-all
        duration-300

        hover:-translate-y-1
        hover:bg-white
        hover:shadow-lg
      "
    >
      {/* IMAGE */}

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
              (max-width: 1023px) 45vw,
              250px
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
              items-center
              justify-center
              bg-blue-50
            "
          >
            <IoCalendarOutline
              className="
                text-3xl
                text-blue-400
              "
            />
          </div>
        )}

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
              className={`
                rounded-full
                border
                px-2
                py-1
                text-[10px]
                font-semibold

                ${getCategoryClass(event.categoryEvent)}
              `}
            >
              {event.categoryEvent}
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}

      <div
        className="
          flex
          flex-1
          flex-col
          p-4
        "
      >
        <h3
          className="
            line-clamp-2
            font-bold
            leading-snug
            text-gray-900
            transition-colors

            group-hover:text-blue-600
          "
        >
          {event.eventName}
        </h3>

        <div
          className="
            mt-2
            flex
            items-center
            gap-2
            text-xs
            text-gray-500
          "
        >
          <FiCalendar className="text-blue-500" />

          {formatEventDate(event.dateEvent)}
        </div>

        <p
          className="
            mt-3
            line-clamp-2
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
            pt-4
            text-xs
            font-semibold
            text-blue-600
          "
        >
          Lihat detail
          <FiArrowRight
            className="
              ml-1
              transition-transform

              group-hover:translate-x-1
            "
          />
        </div>
      </div>
    </Link>
  );
}

// =========================================================
// LOADING
// =========================================================

function DetailLoading() {
  return (
    <main
      className="
        min-h-screen
        bg-gray-50
        px-4
        pb-16
        pt-28

        sm:px-6
        sm:pt-32
      "
    >
      <div
        className="
          mx-auto
          max-w-5xl
          animate-pulse
        "
      >
        <div
          className="
            mb-6
            h-5
            w-32
            rounded
            bg-gray-200
          "
        />

        <div
          className="
            overflow-hidden
            rounded-3xl
            border
            border-gray-100
            bg-white
          "
        >
          <div
            className="
              aspect-video
              bg-gray-200
            "
          />

          <div
            className="
              space-y-5
              p-6

              sm:p-8
            "
          >
            <div
              className="
                h-7
                w-32
                rounded-full
                bg-gray-100
              "
            />

            <div
              className="
                h-10
                w-4/5
                rounded
                bg-gray-200
              "
            />

            <div
              className="
                h-24
                rounded-2xl
                bg-gray-100
              "
            />

            <div
              className="
                h-4
                rounded
                bg-gray-100
              "
            />

            <div
              className="
                h-4
                w-5/6
                rounded
                bg-gray-100
              "
            />
          </div>
        </div>
      </div>
    </main>
  );
}

// =========================================================
// ERROR
// =========================================================

function DetailError({ message }: { message: string }) {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-gray-50
        px-4
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-gray-100
          bg-white
          p-7
          text-center
          shadow-lg
        "
      >
        <div
          className="
            mx-auto
            mb-5
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

        <h1
          className="
            text-xl
            font-bold
            text-gray-900
          "
        >
          Event Tidak Dapat Dimuat
        </h1>

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

        <Link
          href="/pages/event"
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
          Kembali ke Event
        </Link>
      </div>
    </main>
  );
}

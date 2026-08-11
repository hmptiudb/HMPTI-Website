"use client";

import {
  AnimatePresence,
  MotionConfig,
  motion,
} from "framer-motion";

import Image from "next/image";
import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiCode,
  FiTarget,
  FiUsers,
} from "react-icons/fi";

import {
  IoSparkles,
} from "react-icons/io5";


// =========================================================
// TYPES
// =========================================================

interface ActivityItem {
  id: string;
  eventName: string;
  imageUrl: string;
  descriptionEvent: string;
  statusEvent?: string;
  categoryAudiens?: string;
  categoryEvent?: string;
}


// =========================================================
// CONSTANTS
// =========================================================

const AUTO_PLAY_DELAY = 5500;


const activities: ActivityItem[] = [
  {
    id: "1",
    eventName: "SIBARMATI",
    imageUrl:
      "/assets/image/sibarmati.png",
    descriptionEvent:
      "Seminar dan Workshop Teknologi Informasi",
    statusEvent:
      "active",
    categoryAudiens:
      "Mahasiswa",
    categoryEvent:
      "Seminar",
  },

  {
    id: "2",
    eventName: "FESTI",
    imageUrl:
      "/assets/image/festii.png",
    descriptionEvent:
      "Festival Teknologi dan Inovasi",
    statusEvent:
      "upcoming",
    categoryAudiens:
      "Umum",
    categoryEvent:
      "Festival",
  },

  {
    id: "3",
    eventName: "NGOBAR",
    imageUrl:
      "/assets/image/ngobar.png",
    descriptionEvent:
      "Ngoding Bareng",
    statusEvent:
      "upcoming",
    categoryAudiens:
      "Umum",
    categoryEvent:
      "Workshop",
  },
];


const ACTIVITY_BENEFITS = [
  {
    icon: FiCode,
    title:
      "Kompetensi",
    description:
      "Mengembangkan kemampuan teknis melalui kegiatan yang relevan dengan dunia teknologi.",
  },

  {
    icon: FiTarget,
    title:
      "Pengalaman",
    description:
      "Memberikan pengalaman baru melalui seminar, workshop, festival, dan kegiatan kolaboratif.",
  },

  {
    icon: FiUsers,
    title:
      "Kolaborasi",
    description:
      "Membuka ruang untuk bertemu, berdiskusi, dan berkembang bersama mahasiswa lainnya.",
  },
];


// =========================================================
// MOTION
// =========================================================

const slideVariants = {
  enter: (
    direction: number,
  ) => ({
    opacity: 0,

    x:
      direction > 0
        ? 32
        : -32,

    scale: 0.985,
  }),

  center: {
    opacity: 1,
    x: 0,
    scale: 1,
  },

  exit: (
    direction: number,
  ) => ({
    opacity: 0,

    x:
      direction < 0
        ? 32
        : -32,

    scale: 0.985,
  }),
};


// =========================================================
// STATUS
// =========================================================

function getStatusLabel(
  status?: string,
) {
  switch (
    status
      ?.trim()
      .toLowerCase()
  ) {
    case "active":
      return "Sedang Berjalan";

    case "upcoming":
      return "Akan Datang";

    case "finished":
      return "Selesai";

    default:
      return "Program HMPTI";
  }
}


function getStatusClass(
  status?: string,
) {
  switch (
    status
      ?.trim()
      .toLowerCase()
  ) {
    case "active":
      return `
        border-emerald-100
        bg-emerald-50
        text-emerald-700
      `;

    case "upcoming":
      return `
        border-amber-100
        bg-amber-50
        text-amber-700
      `;

    case "finished":
      return `
        border-gray-200
        bg-gray-100
        text-gray-600
      `;

    default:
      return `
        border-blue-100
        bg-blue-50
        text-blue-700
      `;
  }
}


// =========================================================
// MAIN COMPONENT
// =========================================================

export default function ActivityViewHome() {
  const sectionRef =
    useRef<HTMLElement | null>(
      null,
    );


  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);


  const [
    direction,
    setDirection,
  ] = useState(1);


  const [
    isPaused,
    setIsPaused,
  ] = useState(false);


  const [
    isVisible,
    setIsVisible,
  ] = useState(false);


  const currentActivity =
    activities[
      currentIndex
    ];


  // =======================================================
  // VISIBILITY
  // =======================================================

  useEffect(() => {
    const element =
      sectionRef.current;


    if (!element) {
      return;
    }


    const observer =
      new IntersectionObserver(
        (
          entries,
        ) => {
          setIsVisible(
            entries[0]
              ?.isIntersecting ??
              false,
          );
        },
        {
          threshold: 0.2,
        },
      );


    observer.observe(
      element,
    );


    return () => {
      observer.disconnect();
    };
  }, []);


  // =======================================================
  // AUTOPLAY
  // =======================================================

  useEffect(() => {
    if (
      activities.length <= 1 ||
      isPaused ||
      !isVisible
    ) {
      return;
    }


    const interval =
      window.setInterval(
        () => {
          setDirection(
            1,
          );


          setCurrentIndex(
            (
              previous,
            ) =>
              (
                previous +
                1
              ) %
              activities.length,
          );
        },
        AUTO_PLAY_DELAY,
      );


    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [
    isPaused,
    isVisible,
  ]);


  // =======================================================
  // PREVIOUS
  // =======================================================

  const previousSlide =
    () => {
      setDirection(
        -1,
      );


      setCurrentIndex(
        (
          previous,
        ) =>
          (
            previous -
            1 +
            activities.length
          ) %
          activities.length,
      );
    };


  // =======================================================
  // NEXT
  // =======================================================

  const nextSlide =
    () => {
      setDirection(
        1,
      );


      setCurrentIndex(
        (
          previous,
        ) =>
          (
            previous +
            1
          ) %
          activities.length,
      );
    };


  // =======================================================
  // SELECT
  // =======================================================

  const selectSlide = (
    index: number,
  ) => {
    if (
      index ===
      currentIndex
    ) {
      return;
    }


    setDirection(
      index >
        currentIndex
        ? 1
        : -1,
    );


    setCurrentIndex(
      index,
    );
  };


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={
          sectionRef
        }
        className="
          relative
          w-full
          scroll-mt-20
          overflow-hidden
          bg-white
          px-4
          pb-[calc(4rem+env(safe-area-inset-bottom))]
          pt-14

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
              from-white
              via-gray-50/60
              to-blue-50/40
            "
          />


          <div
            className="
              absolute
              inset-0
              opacity-[0.055]
              bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]
            "
          />


          <div
            className="
              absolute
              -left-28
              top-20
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
              right-0
              hidden
              h-96
              w-96
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
            w-full
            max-w-7xl
          "
        >
          {/* =======================================
              HEADER
          ======================================== */}

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
              amount: 0.15,
            }}
            transition={{
              duration: 0.5,
            }}
            className="
              mx-auto
              mb-8
              max-w-3xl
              text-center

              min-[400px]:mb-10

              sm:mb-12

              lg:mb-14
            "
          >
            <div
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-blue-100
                bg-blue-50
                px-3.5
                py-2

                sm:mb-5
                sm:px-4
              "
            >


              <span
                className="
                  text-[11px]
                  font-semibold
                  text-blue-700

                  sm:text-sm
                "
              >
                Program Unggulan
              </span>
            </div>


            <h2
              className="
                text-[1.8rem]
                font-bold
                leading-tight
                tracking-tight
                text-gray-950

                min-[400px]:text-3xl

                sm:text-4xl

                lg:text-5xl
              "
            >
              Temukan{" "}

              <span
                className="
                  bg-gradient-to-r
                  from-blue-600
                  to-cyan-500
                  bg-clip-text
                  text-transparent
                "
              >
                Aktivitas
              </span>

              {" HMPTI"}
            </h2>


            <p
              className="
                mx-auto
                mt-4
                max-w-2xl
                text-[13px]
                leading-6
                text-gray-600

                sm:text-base
                sm:leading-7

                md:text-lg
                md:leading-8
              "
            >
              Program yang dirancang sebagai
              ruang belajar, berkolaborasi, dan
              mengembangkan pengalaman mahasiswa
              Teknik Informatika.
            </p>
          </motion.div>


          {/* =======================================
              PROGRAM NAVIGATION
          ======================================== */}

          <div
            className="
              mb-6
              flex
              w-full
              justify-center

              sm:mb-8
            "
          >
            <div
              className="
                flex
                max-w-full
                items-center
                gap-1
                overflow-x-auto
                rounded-2xl
                border
                border-gray-200
                bg-white/80
                p-1.5
                shadow-sm
                backdrop-blur-md

                [scrollbar-width:none]

                [&::-webkit-scrollbar]:hidden
              "
            >
              {activities.map(
                (
                  activity,
                  index,
                ) => (
                  <button
                    key={
                      activity.id
                    }
                    type="button"
                    onClick={() =>
                      selectSlide(
                        index,
                      )
                    }
                    aria-current={
                      currentIndex ===
                      index
                        ? "true"
                        : undefined
                    }
                    className={`
                      shrink-0
                      rounded-xl
                      px-3.5
                      py-2.5
                      text-[11px]
                      font-semibold
                      transition-all

                      min-[400px]:px-4

                      sm:px-5
                      sm:text-sm

                      ${
                        currentIndex ===
                        index
                          ? `
                            bg-blue-600
                            text-white
                            shadow-md
                            shadow-blue-600/20
                          `
                          : `
                            text-gray-500

                            hover:bg-gray-50
                            hover:text-gray-900
                          `
                      }
                    `}
                  >
                    {
                      activity.eventName
                    }
                  </button>
                ),
              )}
            </div>
          </div>


          {/* =======================================
              FEATURED ACTIVITY
          ======================================== */}

          <div
            className="
              grid
              grid-cols-1
              gap-10

              sm:gap-9

              lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]
              lg:items-stretch
              lg:gap-8

              xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]
              xl:gap-10
            "
          >
            {/* =====================================
                VISUAL SIDE
            ====================================== */}

            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.1,
              }}
              transition={{
                duration: 0.5,
              }}
              onMouseEnter={() =>
                setIsPaused(
                  true,
                )
              }
              onMouseLeave={() =>
                setIsPaused(
                  false,
                )
              }
              onFocusCapture={() =>
                setIsPaused(
                  true,
                )
              }
              onBlurCapture={() =>
                setIsPaused(
                  false,
                )
              }
              className="
                relative
                min-w-0
                pb-1

                sm:pb-0
              "
            >
              {/* =============================
                  ACTIVITY CARD
              ============================== */}

              <div
                className="
                  flex
                  h-full
                  flex-col
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-gray-200
                  bg-white
                  shadow-[0_18px_50px_rgba(15,23,42,0.07)]

                  sm:rounded-[28px]
                  sm:shadow-[0_20px_60px_rgba(15,23,42,0.07)]
                "
              >
                {/* =============================
                    IMAGE AREA
                ============================== */}

                <div
                  className="
                    relative
                    aspect-[4/3]
                    overflow-hidden
                    bg-gradient-to-br
                    from-gray-50
                    via-white
                    to-blue-50/50

                    min-[400px]:aspect-[4/3]

                    sm:aspect-[16/10]

                    lg:flex-1
                    lg:aspect-auto
                    lg:min-h-[390px]

                    xl:min-h-[430px]
                  "
                >
                  {/* DECORATION */}

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
                        left-1/2
                        top-1/2
                        h-[70%]
                        w-[70%]
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-blue-100/45
                        blur-3xl
                      "
                    />


                    <div
                      className="
                        absolute
                        inset-4
                        rounded-2xl
                        border
                        border-gray-100

                        sm:inset-7
                      "
                    />
                  </div>


                  {/* IMAGE */}

                  <AnimatePresence
                    custom={
                      direction
                    }
                    mode="wait"
                    initial={
                      false
                    }
                  >
                    <motion.div
                      key={
                        currentActivity.id
                      }
                      custom={
                        direction
                      }
                      variants={
                        slideVariants
                      }
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        duration: 0.35,
                        ease:
                          "easeOut",
                      }}
                      className="
                        absolute
                        inset-0
                        z-10
                      "
                    >
                      <Image
                        src={
                          currentActivity.imageUrl
                        }
                        alt={
                          currentActivity.eventName
                        }
                        fill
                        priority={
                          currentIndex ===
                          0
                        }
                        sizes="
                          (max-width: 639px) 92vw,
                          (max-width: 1023px) 90vw,
                          55vw
                        "
                        className="
                          object-contain
                          p-9

                          min-[400px]:p-10

                          sm:p-12

                          lg:p-14

                          xl:p-16
                        "
                      />
                    </motion.div>
                  </AnimatePresence>


                  {/* =============================
                      BADGES
                  ============================== */}

                  <div
                    className="
                      absolute
                      left-3
                      top-3
                      z-20
                      flex
                      max-w-[calc(100%-1.5rem)]
                      flex-wrap
                      gap-1.5

                      sm:left-5
                      sm:top-5
                      sm:gap-2
                    "
                  >
                    <span
                      className="
                        rounded-full
                        border
                        border-gray-200
                        bg-white/90
                        px-2.5
                        py-1.5
                        text-[9px]
                        font-semibold
                        text-gray-700
                        shadow-sm
                        backdrop-blur-md

                        min-[400px]:text-[10px]

                        sm:px-3
                        sm:text-xs
                      "
                    >
                      {
                        currentActivity.categoryEvent
                      }
                    </span>


                    <span
                      className={`
                        rounded-full
                        border
                        px-2.5
                        py-1.5
                        text-[9px]
                        font-semibold
                        shadow-sm

                        min-[400px]:text-[10px]

                        sm:px-3
                        sm:text-xs

                        ${getStatusClass(
                          currentActivity.statusEvent,
                        )}
                      `}
                    >
                      {getStatusLabel(
                        currentActivity.statusEvent,
                      )}
                    </span>
                  </div>


                  {/* =============================
                      ARROWS
                  ============================== */}

                  {activities.length >
                    1 && (
                    <>
                      <button
                        type="button"
                        onClick={
                          previousSlide
                        }
                        aria-label="Aktivitas sebelumnya"
                        className="
                          absolute
                          left-2.5
                          top-1/2
                          z-30
                          flex
                          h-9
                          w-9
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-gray-200
                          bg-white/90
                          text-gray-600
                          shadow-lg
                          backdrop-blur-md
                          transition-all

                          active:scale-95

                          hover:bg-white
                          hover:text-blue-600

                          min-[400px]:left-3
                          min-[400px]:h-10
                          min-[400px]:w-10

                          sm:left-4
                          sm:h-11
                          sm:w-11
                        "
                      >
                        <FiChevronLeft />
                      </button>


                      <button
                        type="button"
                        onClick={
                          nextSlide
                        }
                        aria-label="Aktivitas berikutnya"
                        className="
                          absolute
                          right-2.5
                          top-1/2
                          z-30
                          flex
                          h-9
                          w-9
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-gray-200
                          bg-white/90
                          text-gray-600
                          shadow-lg
                          backdrop-blur-md
                          transition-all

                          active:scale-95

                          hover:bg-white
                          hover:text-blue-600

                          min-[400px]:right-3
                          min-[400px]:h-10
                          min-[400px]:w-10

                          sm:right-4
                          sm:h-11
                          sm:w-11
                        "
                      >
                        <FiChevronRight />
                      </button>
                    </>
                  )}
                </div>


                {/* =============================
                    CARD FOOTER
                ============================== */}

                <div
                  className="
                    border-t
                    border-gray-100
                    bg-white
                    px-4
                    py-5

                    min-[400px]:px-5

                    sm:px-6
                    sm:py-6

                    lg:px-7
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-4

                      sm:flex-row
                      sm:items-end
                      sm:justify-between
                    "
                  >
                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <p
                        className="
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.14em]
                          text-blue-600

                          min-[400px]:text-[10px]

                          sm:text-xs
                        "
                      >
                        Program Unggulan
                      </p>


                      <h3
                        className="
                          mt-1.5
                          break-words
                          text-xl
                          font-bold
                          tracking-tight
                          text-gray-950

                          min-[400px]:text-2xl

                          sm:text-3xl
                        "
                      >
                        {
                          currentActivity.eventName
                        }
                      </h3>


                      <p
                        className="
                          mt-1.5
                          text-xs
                          leading-5
                          text-gray-500

                          min-[400px]:text-sm
                          min-[400px]:leading-6

                          sm:text-base
                        "
                      >
                        {
                          currentActivity.descriptionEvent
                        }
                      </p>
                    </div>


                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-2
                      "
                    >
                      <FiUsers
                        className="
                          shrink-0
                          text-blue-500
                        "
                      />

                      <span
                        className="
                          text-xs
                          font-medium
                          text-gray-500

                          sm:text-sm
                        "
                      >
                        {
                          currentActivity.categoryAudiens
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>


              {/* =============================
                  DOT INDICATORS

                  DIBERI AREA SENDIRI AGAR
                  TIDAK KETUTUP CARD BERIKUTNYA
              ============================== */}

              <div
                className="
                  relative
                  z-20
                  mt-5
                  mb-1
                  flex
                  min-h-5
                  w-full
                  items-center
                  justify-center
                  gap-2

                  min-[400px]:mt-6

                  sm:mb-0
                "
              >
                {activities.map(
                  (
                    activity,
                    index,
                  ) => (
                    <button
                      key={
                        activity.id
                      }
                      type="button"
                      onClick={() =>
                        selectSlide(
                          index,
                        )
                      }
                      aria-label={`Tampilkan ${activity.eventName}`}
                      aria-current={
                        currentIndex ===
                        index
                          ? "true"
                          : undefined
                      }
                      className={`
                        block
                        h-2
                        shrink-0
                        rounded-full
                        transition-all
                        duration-300

                        ${
                          currentIndex ===
                          index
                            ? `
                              w-7
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
                  ),
                )}
              </div>
            </motion.div>


            {/* =====================================
                INFORMATION SIDE
            ====================================== */}

            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.1,
              }}
              transition={{
                duration: 0.5,
              }}
              className="
                relative
                z-10
                min-w-0

                lg:flex
                lg:flex-col
              "
            >
              <div
                className="
                  rounded-[22px]
                  border
                  border-gray-200
                  bg-white
                  p-4
                  shadow-sm

                  min-[400px]:p-5

                  sm:rounded-[24px]
                  sm:p-6

                  lg:flex
                  lg:flex-1
                  lg:flex-col
                  lg:p-7

                  xl:p-8
                "
              >
                {/* =============================
                    TOP ROW
                ============================== */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <div
                    className="
                      inline-flex
                      min-w-0
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-blue-100
                      bg-blue-50
                      px-3
                      py-1.5
                      text-[10px]
                      font-semibold
                      text-blue-700

                      sm:text-xs
                    "
                  >

                    <span className="truncate">
                      Aktivitas Mahasiswa
                    </span>
                  </div>


                  <span
                    className="
                      shrink-0
                      text-[10px]
                      font-semibold
                      tracking-wide
                      text-gray-400

                      sm:text-xs
                    "
                  >
                    {String(
                      currentIndex +
                        1,
                    ).padStart(
                      2,
                      "0",
                    )}

                    {" / "}

                    {String(
                      activities.length,
                    ).padStart(
                      2,
                      "0",
                    )}
                  </span>
                </div>


                {/* =============================
                    TITLE
                ============================== */}

                <h3
                  className="
                    mt-5
                    max-w-xl
                    break-words
                    text-[1.65rem]
                    font-bold
                    leading-[1.12]
                    tracking-tight
                    text-gray-950

                    min-[400px]:text-3xl

                    sm:text-4xl

                    lg:text-[38px]

                    xl:text-[42px]
                  "
                >
                  Ruang untuk{" "}

                  <span
                    className="
                      bg-gradient-to-r
                      from-blue-600
                      to-cyan-500
                      bg-clip-text
                      text-transparent
                    "
                  >
                    Belajar
                  </span>

                  , Berkarya, dan Berkolaborasi
                </h3>


                {/* =============================
                    DESCRIPTION
                ============================== */}

                <p
                  className="
                    mt-4
                    max-w-xl
                    break-words
                    text-[13px]
                    leading-6
                    text-gray-600

                    sm:text-base
                    sm:leading-8

                    md:[text-align:justify]
                    md:[text-justify:inter-word]
                  "
                >
                  HMPTI menghadirkan berbagai
                  kegiatan yang membantu mahasiswa
                  memperluas wawasan, meningkatkan
                  keterampilan, membangun relasi,
                  serta mendapatkan pengalaman di
                  luar proses akademik.
                </p>


                <div
                  className="
                    my-5
                    h-px
                    bg-gray-100

                    sm:my-6
                  "
                />


                {/* =============================
                    BENEFITS
                ============================== */}

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-3

                    sm:grid-cols-3

                    lg:grid-cols-1

                    xl:grid-cols-3
                  "
                >
                  {ACTIVITY_BENEFITS.map(
                    (
                      benefit,
                    ) => {
                      const Icon =
                        benefit.icon;


                      return (
                        <div
                          key={
                            benefit.title
                          }
                          className="
                            rounded-2xl
                            border
                            border-gray-100
                            bg-gray-50/60
                            p-4
                            transition-all

                            hover:border-blue-100
                            hover:bg-blue-50/40
                          "
                        >
                          <div
                            className="
                              flex
                              items-start
                              gap-3

                              sm:block
                            "
                          >
                            <div
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-white
                                text-blue-600
                                shadow-sm
                                ring-1
                                ring-gray-100
                              "
                            >
                              <Icon />
                            </div>


                            <div
                              className="
                                min-w-0

                                sm:mt-3
                              "
                            >
                              <h4
                                className="
                                  text-sm
                                  font-bold
                                  text-gray-900
                                "
                              >
                                {
                                  benefit.title
                                }
                              </h4>


                              <p
                                className="
                                  mt-1
                                  text-xs
                                  leading-5
                                  text-gray-500

                                  sm:mt-1.5
                                "
                              >
                                {
                                  benefit.description
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>


                {/* =============================
                    CTA
                ============================== */}

                <div
                  className="
                    mt-6

                    lg:mt-auto
                    lg:pt-7
                  "
                >
                  <Link
                    href="/pages/event"
                    className="
                      group
                      inline-flex
                      min-h-11
                      w-full
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

                      active:scale-[0.99]

                      hover:-translate-y-0.5
                      hover:bg-blue-500
                      hover:shadow-xl

                      sm:w-auto
                      sm:px-6
                    "
                  >
                    Lihat Semua Kegiatan

                    <FiArrowRight
                      className="
                        shrink-0
                        transition-transform

                        group-hover:translate-x-1
                      "
                    />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
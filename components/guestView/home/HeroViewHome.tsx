"use client";

import {
  MotionConfig,
  motion,
} from "framer-motion";

import Image from "next/image";
import Link from "next/link";

import {
  FiArrowRight,
  FiCalendar,
  FiCode,
  FiUsers,
} from "react-icons/fi";

import {
  IoSparkles,
} from "react-icons/io5";


// =========================================================
// STATS
// =========================================================

const heroStats = [
  {
    icon: FiUsers,
    value: "40+",
    label: "Anggota Aktif",
  },
  {
    icon: FiCalendar,
    value: "15+",
    label: "Kegiatan",
  },
  {
    icon: FiCode,
    value: "10+",
    label: "Proyek",
  },
];


// =========================================================
// PRINCIPLES
// =========================================================

const principles = [
  "Kolaboratif",
  "Inovatif",
  "Berkembang",
];


// =========================================================
// MAIN COMPONENT
// =========================================================

export default function HeroViewHome() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="hero-section"
        className="
          relative
          flex
          w-full
          items-center
          overflow-hidden
          bg-gradient-to-br
          from-gray-50
          via-white
          to-blue-50/40
          px-4
          pb-14
          pt-24

          sm:px-6
          sm:pb-16
          sm:pt-28

          lg:min-h-[720px]
          lg:px-8
          lg:pb-16
          lg:pt-24

          xl:min-h-[760px]
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
          {/* GRID */}

          <div
            className="
              absolute
              inset-0
              opacity-[0.055]
              bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]
            "
          />


          {/* LEFT GLOW */}

          <motion.div
            className="
              absolute
              -left-36
              top-[10%]
              hidden
              h-[400px]
              w-[400px]
              rounded-full
              bg-blue-200/20
              blur-3xl

              md:block
            "
            animate={{
              scale: [
                1,
                1.05,
                1,
              ],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />


          {/* RIGHT GLOW */}

          <motion.div
            className="
              absolute
              -right-40
              bottom-[4%]
              hidden
              h-[460px]
              w-[460px]
              rounded-full
              bg-cyan-200/15
              blur-3xl

              md:block
            "
            animate={{
              scale: [
                1.04,
                1,
                1.04,
              ],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />


          {/* TOP FADE */}

          <div
            className="
              absolute
              inset-x-0
              top-0
              h-28
              bg-gradient-to-b
              from-white
              to-transparent
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
          <div
            className="
              grid
              grid-cols-1
              items-center
              gap-12

              lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)]
              lg:gap-12

              xl:grid-cols-[minmax(0,1.12fr)_minmax(420px,0.88fr)]
              xl:gap-16
            "
          >
            {/* =====================================
                LEFT CONTENT
            ====================================== */}

            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
              }}
              className="
                min-w-0
                text-center

                lg:text-left
              "
            >
              {/* ===================================
                  BADGE
              ==================================== */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.08,
                }}
                className="
                  inline-flex
                  max-w-full
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-blue-100
                  bg-white/80
                  px-3.5
                  py-2
                  shadow-sm
                  backdrop-blur-md

                  sm:px-4
                "
              >
                <span
                  className="
                    h-2
                    w-2
                    shrink-0
                    rounded-full
                    bg-blue-600
                  "
                />


                <span
                  className="
                    truncate
                    text-[11px]
                    font-semibold
                    text-blue-700

                    sm:text-sm
                  "
                >
                  Organisasi Mahasiswa Teknik Informatika
                </span>
              </motion.div>


              {/* ===================================
                  HEADING
              ==================================== */}

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.14,
                }}
                className="
                  mx-auto
                  mt-5
                  max-w-[720px]
                  text-[2.25rem]
                  font-bold
                  leading-[1.05]
                  tracking-[-0.04em]
                  text-gray-950

                  min-[400px]:text-[2.55rem]

                  sm:mt-6
                  sm:text-5xl

                  md:text-[3.4rem]

                  lg:mx-0
                  lg:text-[3.65rem]

                  xl:text-[4.15rem]
                "
              >
                Himpunan Mahasiswa{" "}

                <span
                  className="
                    block
                    bg-gradient-to-r
                    from-blue-700
                    via-blue-600
                    to-cyan-500
                    bg-clip-text
                    text-transparent
                  "
                >
                  Teknik Informatika
                </span>
              </motion.h1>


              {/* ===================================
                  UNIVERSITY
              ==================================== */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.22,
                }}
                className="
                  mx-auto
                  mt-5
                  flex
                  w-fit
                  items-center
                  gap-3

                  lg:mx-0
                "
              >
                <span
                  aria-hidden="true"
                  className="
                    h-6
                    w-1
                    rounded-full
                    bg-gradient-to-b
                    from-blue-600
                    to-cyan-500
                  "
                />

                <span
                  className="
                    text-sm
                    font-semibold
                    text-gray-600

                    sm:text-base
                  "
                >
                  Universitas Duta Bangsa
                </span>
              </motion.div>


              {/* ===================================
                  DESCRIPTION
              ==================================== */}

              <motion.p
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.3,
                }}
                className="
                  mx-auto
                  mt-5
                  max-w-2xl
                  text-sm
                  leading-7
                  text-gray-600

                  sm:mt-6
                  sm:text-base
                  sm:leading-8

                  md:text-lg

                  lg:mx-0
                  lg:max-w-xl
                "
              >
                Wadah mahasiswa Teknik Informatika
                untuk belajar, berkolaborasi,
                berkembang, dan menciptakan dampak
                melalui teknologi.
              </motion.p>


              {/* ===================================
                  CTA
              ==================================== */}

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
                  duration: 0.5,
                  delay: 0.38,
                }}
                className="
                  mt-7
                  flex
                  w-full
                  flex-col
                  gap-3

                  min-[440px]:mx-auto
                  min-[440px]:max-w-md
                  min-[440px]:flex-row

                  sm:mt-8

                  lg:mx-0
                  lg:max-w-none
                "
              >
                <Link
                  href="#tentang-hmpti"
                  className="
                    group
                    inline-flex
                    min-h-12
                    flex-1
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
                    shadow-blue-600/20
                    transition-all

                    hover:-translate-y-0.5
                    hover:bg-blue-500
                    hover:shadow-xl

                    min-[440px]:flex-none

                    sm:px-6
                  "
                >
                  Tentang HMPTI

                  <FiArrowRight
                    className="
                      shrink-0
                      transition-transform

                      group-hover:translate-x-1
                    "
                  />
                </Link>


                <Link
                  href="/pages/event"
                  className="
                    group
                    inline-flex
                    min-h-12
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-gray-200
                    bg-white/80
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-gray-700
                    shadow-sm
                    backdrop-blur-sm
                    transition-all

                    hover:-translate-y-0.5
                    hover:border-blue-200
                    hover:bg-blue-50
                    hover:text-blue-700

                    min-[440px]:flex-none

                    sm:px-6
                  "
                >
                  Lihat Event

                  <FiCalendar
                    className="
                      shrink-0
                      text-blue-500
                    "
                  />
                </Link>
              </motion.div>


              {/* ===================================
                  STATS
              ==================================== */}

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
                  duration: 0.5,
                  delay: 0.46,
                }}
                className="
                  mt-8
                  grid
                  grid-cols-3
                  divide-x
                  divide-gray-200
                  border-t
                  border-gray-200
                  pt-6

                  sm:mt-9
                  sm:pt-7

                  lg:max-w-xl
                "
              >
                {heroStats.map(
                  (
                    stat,
                  ) => {
                    const Icon =
                      stat.icon;


                    return (
                      <div
                        key={
                          stat.label
                        }
                        className="
                          flex
                          min-w-0
                          flex-col
                          items-center
                          px-2

                          sm:px-4

                          lg:items-start

                          first:lg:pl-0
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <div
                            className="
                              hidden
                              h-8
                              w-8
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              bg-blue-50
                              text-blue-600

                              sm:flex
                            "
                          >
                            <Icon className="text-sm" />
                          </div>


                          <span
                            className="
                              text-lg
                              font-bold
                              tracking-tight
                              text-gray-950

                              sm:text-xl
                            "
                          >
                            {
                              stat.value
                            }
                          </span>
                        </div>


                        <p
                          className="
                            mt-1
                            text-center
                            text-[10px]
                            font-medium
                            leading-4
                            text-gray-500

                            min-[400px]:text-[11px]

                            sm:text-xs

                            lg:text-left
                          "
                        >
                          {
                            stat.label
                          }
                        </p>
                      </div>
                    );
                  },
                )}
              </motion.div>
            </motion.div>


            {/* =====================================
                RIGHT VISUAL
            ====================================== */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.98,
                y: 18,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              transition={{
                duration: 0.65,
                delay: 0.18,
                ease: "easeOut",
              }}
              className="
                mx-auto
                w-full
                max-w-[520px]

                lg:max-w-none
                lg:translate-y-4
              "
            >
              <div
                className="
                  relative
                  px-1
                  pb-2
                  pt-1

                  sm:px-3
                  sm:pb-3
                  sm:pt-3
                "
              >
                {/* =================================
                    BACK CARD
                ================================== */}

                <div
                  aria-hidden="true"
                  className="
                    absolute
                    inset-4
                    translate-x-2.5
                    translate-y-2.5
                    rounded-[26px]
                    bg-gradient-to-br
                    from-blue-100
                    to-cyan-100
                    opacity-60

                    sm:inset-6
                    sm:rounded-[30px]
                  "
                />


                {/* =================================
                    MAIN CARD
                ================================== */}

                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-[26px]
                    border
                    border-gray-200
                    bg-white/95
                    shadow-[0_24px_70px_rgba(37,99,235,0.10)]
                    backdrop-blur-xl

                    sm:rounded-[30px]
                  "
                >
                  {/* ===============================
                      CARD HEADER
                  ================================ */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      border-b
                      border-gray-100
                      px-5
                      py-4

                      sm:px-6
                    "
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-2
                      "
                    >
                      <span
                        className="
                          h-2
                          w-2
                          shrink-0
                          rounded-full
                          bg-blue-600
                        "
                      />

                      <span
                        className="
                          truncate
                          text-xs
                          font-semibold
                          text-gray-700

                          sm:text-sm
                        "
                      >
                        HMPTI
                      </span>
                    </div>


                    <span
                      className="
                        shrink-0
                        rounded-full
                        bg-blue-50
                        px-2.5
                        py-1
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.1em]
                        text-blue-600

                        sm:text-[10px]
                      "
                    >
                      Informatika
                    </span>
                  </div>


                  {/* ===============================
                      LOGO AREA
                  ================================ */}

                  <div
                    className="
                      relative
                      aspect-[5/4]
                      overflow-hidden
                      bg-gradient-to-br
                      from-gray-50
                      via-white
                      to-blue-50/50

                      sm:aspect-[4/3]

                      lg:aspect-[5/4]
                    "
                  >
                    {/* GRID */}

                    <div
                      aria-hidden="true"
                      className="
                        absolute
                        inset-0
                        opacity-[0.055]
                        bg-[linear-gradient(rgba(37,99,235,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.5)_1px,transparent_1px)]
                        bg-[size:34px_34px]
                      "
                    />


                    {/* GLOW */}

                    <div
                      aria-hidden="true"
                      className="
                        absolute
                        left-1/2
                        top-1/2
                        h-[68%]
                        w-[68%]
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-blue-100/55
                        blur-3xl
                      "
                    />


                    {/* INNER FRAME */}

                    <div
                      aria-hidden="true"
                      className="
                        absolute
                        inset-5
                        rounded-[22px]
                        border
                        border-blue-100/70

                        sm:inset-7
                        sm:rounded-[24px]
                      "
                    />


                    {/* LOGO */}

                    <motion.div
                      animate={{
                        y: [
                          0,
                          -4,
                          0,
                        ],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="
                        absolute
                        inset-0
                        z-10
                      "
                    >
                      <Image
                        src="/assets/image/logoHMPTI.png"
                        alt="Logo HMPTI Universitas Duta Bangsa"
                        fill
                        priority
                        sizes="
                          (max-width: 1023px) 90vw,
                          40vw
                        "
                        className="
                          object-contain
                          p-12

                          min-[400px]:p-14

                          sm:p-16

                          lg:p-14

                          xl:p-16
                        "
                      />
                    </motion.div>


                    {/* DECORATION DOT */}

                    <div
                      aria-hidden="true"
                      className="
                        absolute
                        right-6
                        top-6
                        h-2.5
                        w-2.5
                        rounded-full
                        bg-cyan-400/80

                        sm:right-8
                        sm:top-8
                      "
                    />


                    <div
                      aria-hidden="true"
                      className="
                        absolute
                        bottom-7
                        left-7
                        h-2
                        w-2
                        rounded-full
                        bg-blue-500/70

                        sm:bottom-9
                        sm:left-9
                      "
                    />
                  </div>


                  {/* ===============================
                      CARD INFORMATION
                  ================================ */}

                  <div
                    className="
                      border-t
                      border-gray-100
                      px-5
                      py-5

                      sm:px-6
                      sm:py-6
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-bold
                        text-gray-900

                        sm:text-base
                      "
                    >
                      Bersama Tumbuh melalui Teknologi
                    </p>


                    <p
                      className="
                        mt-1.5
                        max-w-md
                        text-xs
                        leading-5
                        text-gray-500

                        sm:text-sm
                        sm:leading-6
                      "
                    >
                      Ruang bagi mahasiswa untuk belajar,
                      berkarya, dan menciptakan dampak
                      bersama.
                    </p>


                    {/* ===============================
                        PRINCIPLES
                    ================================ */}

                    <div
                      className="
                        mt-5
                        flex
                        flex-wrap
                        gap-2
                      "
                    >
                      {principles.map(
                        (
                          principle,
                        ) => (
                          <span
                            key={
                              principle
                            }
                            className="
                              rounded-full
                              border
                              border-gray-200
                              bg-gray-50
                              px-3
                              py-1.5
                              text-[10px]
                              font-semibold
                              text-gray-500

                              sm:text-xs
                            "
                          >
                            {
                              principle
                            }
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
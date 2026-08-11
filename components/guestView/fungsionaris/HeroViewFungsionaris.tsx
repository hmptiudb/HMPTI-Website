"use client";

import Link from "next/link";

import { MotionConfig, motion } from "framer-motion";

import { type ReactNode } from "react";

import { FiArrowRight, FiAward, FiBook, FiCode, FiGlobe, FiTarget, FiUsers } from "react-icons/fi";

import { IoPeopleCircleOutline, IoRocketOutline } from "react-icons/io5";

// =========================================================
// VALUES
// =========================================================

const values = [
  {
    icon: <FiCode size={26} />,
    title: "Inovasi",
    description: "Terus mendorong kreativitas dalam pengembangan teknologi dan solusi digital.",
  },
  {
    icon: <FiUsers size={26} />,
    title: "Kolaborasi",
    description: "Bekerja bersama dengan semangat tim untuk menciptakan dampak yang lebih besar.",
  },
  {
    icon: <FiAward size={26} />,
    title: "Integritas",
    description: "Bertindak jujur, transparan, dan bertanggung jawab dalam setiap kegiatan.",
  },
  {
    icon: <FiBook size={26} />,
    title: "Pembelajaran",
    description: "Terus mengembangkan pengetahuan dan keterampilan melalui pengalaman baru.",
  },
  {
    icon: <FiGlobe size={26} />,
    title: "Kontribusi Sosial",
    description: "Memberikan dampak positif bagi masyarakat melalui penerapan teknologi.",
  },
  {
    icon: <FiTarget size={26} />,
    title: "Keunggulan",
    description: "Berusaha memberikan hasil terbaik dalam setiap proses dan pencapaian.",
  },
];

// =========================================================
// MISSIONS
// =========================================================

const missions = [
  "Mengembangkan kompetensi anggota di bidang teknologi informasi",
  "Menjalin kerja sama dengan industri dan akademisi",
  "Mendorong inovasi dan kreativitas dalam pengembangan teknologi",
  "Membangun karakter kepemimpinan dan jiwa sosial anggota",
  "Meningkatkan kontribusi kepada masyarakat melalui teknologi",
];

// =========================================================
// PAGE
// =========================================================

export default function AboutUsPage() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen bg-white">
        <HeroViewFungsionaris />

        <AboutUsContent />
      </main>
    </MotionConfig>
  );
}

// =========================================================
// HERO
// =========================================================

function HeroViewFungsionaris() {
  return (
    <section
      className="
        relative
        flex
        min-h-[68svh]
        w-full
        items-center
        justify-center
        overflow-hidden
        bg-gradient-to-br
        from-blue-950
        via-blue-900
        to-indigo-900
        px-4
        pb-14
        pt-24

        sm:min-h-[72svh]
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
        {/* RADIAL */}

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_40%)]
          "
        />

        {/* GRID */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.10]
            bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')]
          "
        />

        {/* LEFT BLUR */}

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
          animate={{
            scale: [1, 1.12, 1],
            x: [0, 14, 0],
            y: [0, -12, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* RIGHT BLUR */}

        <motion.div
          className="
            absolute
            bottom-[12%]
            right-[8%]
            hidden
            h-72
            w-72
            rounded-full
            bg-indigo-400/10
            blur-3xl

            md:block
          "
          animate={{
            scale: [1.08, 1, 1.08],
            x: [0, -12, 0],
            y: [0, 14, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* =========================================
          HERO CONTENT
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
            mb-5
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-white/15
            bg-white/10
            px-3.5
            py-2
            backdrop-blur-md

            sm:mb-6
            sm:px-4
          "
        >
          <IoPeopleCircleOutline
            className="
              shrink-0
              text-white
            "
          />

          <span
            className="
              text-[11px]
              font-semibold
              text-white

              sm:text-sm
            "
          >
            Tentang HMPTI
          </span>
        </motion.div>

        {/* =======================================
            MOBILE TITLE
        ======================================== */}

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
            max-w-[22rem]
            text-[2.05rem]
            font-bold
            leading-[1.08]
            tracking-[-0.035em]
            text-white

            min-[400px]:text-[2.25rem]

            sm:hidden
          "
        >
          <span className="block">Bersama Menjadi</span>

          <span
            className="
              mt-1
              block
              bg-gradient-to-r
              from-blue-300
              to-indigo-300
              bg-clip-text
              text-transparent
            "
          >
            Penggerak
          </span>

          <span
            className="
              mt-1
              block
            "
          >
            Organisasi
          </span>
        </motion.h1>

        {/* =======================================
            TABLET / DESKTOP TITLE
            DIKEMBALIKAN SEPERTI DESAIN AWAL
        ======================================== */}

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
            hidden
            max-w-4xl
            text-5xl
            font-bold
            leading-[1.08]
            tracking-tight
            text-white

            sm:block

            md:text-6xl

            lg:text-7xl
          "
        >
          Bersama Menjadi
          <span
            className="
              mx-2
              bg-gradient-to-r
              from-blue-300
              to-indigo-300
              bg-clip-text
              text-transparent
            "
          >
            Penggerak
          </span>
          Organisasi
        </motion.h1>

        {/* =======================================
            DESCRIPTION
        ======================================== */}

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
            mt-5
            max-w-[20rem]
            text-[13px]
            leading-6
            text-blue-50/80

            min-[400px]:max-w-[22rem]

            sm:mt-6
            sm:max-w-2xl
            sm:text-base
            sm:leading-7

            md:text-lg
            md:leading-8
          "
        >
          Bangun kolaborasi, tingkatkan dedikasi, dan jadilah bagian dari perubahan yang memberikan dampak positif.
        </motion.p>

        {/* =======================================
            CTA
        ======================================== */}

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
          className="
            mx-auto
            mt-7
            flex
            w-full
            max-w-[22rem]
            flex-col
            items-stretch
            justify-center
            gap-3

            sm:mt-8
            sm:max-w-none
            sm:flex-row
            sm:items-center
          "
        >
          <a
            href="#tentang-hmpti"
            className="
              inline-flex
              min-h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-white
              px-5
              py-3
              text-sm
              font-semibold
              text-blue-900
              transition-all

              hover:-translate-y-0.5
              hover:bg-blue-50

              sm:w-auto
              sm:px-6
            "
          >
            Kenali HMPTI
            <FiArrowRight className="shrink-0" />
          </a>

          <Link
            href="/pages/fungsionaris/ketua-wakil"
            className="
              inline-flex
              min-h-11
              w-full
              items-center
              justify-center
              rounded-xl
              border
              border-white/20
              bg-white/5
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              backdrop-blur-sm
              transition-all

              hover:bg-white/10

              sm:w-auto
              sm:px-6
            "
          >
            Lihat Pengurus
          </Link>
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
        animate={{
          opacity: 1,
          y: [0, 8, 0],
        }}
        transition={{
          opacity: {
            duration: 0.4,
            delay: 0.6,
          },
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
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
// ABOUT CONTENT
// =========================================================

function AboutUsContent() {
  return (
    <div
      className="
        bg-gradient-to-br
        from-gray-50
        via-white
        to-blue-50/30
      "
    >
      <AboutSection />

      <VisionMissionSection />

      <ValuesSection />

      <CTASection />
    </div>
  );
}

// =========================================================
// ABOUT
// =========================================================

function AboutSection() {
  return (
    <section
      id="tentang-hmpti"
      className="
        relative
        scroll-mt-20
        overflow-hidden
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
            opacity-[0.08]
            bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]
          "
        />

        <motion.div
          className="
            absolute
            right-[6%]
            top-[15%]
            hidden
            h-64
            w-64
            rounded-full
            bg-blue-200/15
            blur-3xl

            md:block
          "
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
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
        <div
          className="
            grid
            grid-cols-1
            items-center
            gap-10

            lg:grid-cols-2
            lg:gap-16
          "
        >
          {/* =====================================
              TEXT
          ====================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: -24,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
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
                Tentang HMPTI
              </span>
            </div>

            <h2
              className="
                mb-5
                text-3xl
                font-bold
                tracking-tight
                text-gray-900

                sm:text-4xl

                lg:text-5xl
              "
            >
              Mengenal
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
                HMPTI
              </span>
            </h2>

            <div
              className="
                max-w-xl
                space-y-4
                text-sm
                leading-7
                text-gray-600

                sm:text-base
                sm:leading-8
              "
            >
              <p>HMPTI atau Himpunan Mahasiswa Teknik Informatika merupakan organisasi kemahasiswaan yang menjadi wadah resmi bagi mahasiswa Program Studi Teknik Informatika.</p>

              <p>
                Sejak didirikan pada tahun 2010, HMPTI menjadi ruang bagi mahasiswa untuk mengembangkan kompetensi teknis, soft skill, kepemimpinan, serta pengalaman berorganisasi.
              </p>

              <p>Kami berkomitmen menciptakan lingkungan yang mendukung pertumbuhan akademik, profesional, personal, dan sosial setiap anggota.</p>
            </div>
          </motion.div>

          {/* =====================================
              ORGANIZATION STATEMENT
          ====================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: 24,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            className="
              relative
              overflow-hidden
              rounded-[28px]
              border
              border-gray-200
              bg-white
              p-6
              shadow-[0_20px_60px_rgba(15,23,42,0.06)]

              sm:p-8

              lg:p-10
            "
          >
            {/* ===================================
                CARD DECORATION
            ==================================== */}

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
                  -right-16
                  -top-16
                  h-52
                  w-52
                  rounded-full
                  bg-blue-100/60
                  blur-3xl
                "
              />

              <div
                className="
                  absolute
                  -bottom-20
                  -left-20
                  h-48
                  w-48
                  rounded-full
                  bg-cyan-100/50
                  blur-3xl
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  opacity-[0.025]
                  bg-[linear-gradient(rgba(15,23,42,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.9)_1px,transparent_1px)]
                  bg-[size:32px_32px]
                "
              />
            </div>

            {/* ===================================
                CONTENT
            ==================================== */}

            <div
              className="
                relative
                z-10
              "
            >
              {/* EYEBROW */}

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-blue-100
                  bg-blue-50/80
                  px-3
                  py-1.5
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-blue-600
                  "
                />

                <span
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-blue-700

                    sm:text-xs
                  "
                >
                  Ruang Bertumbuh
                </span>
              </div>

              {/* TITLE */}

              <h3
                className="
                  mt-6
                  max-w-xl
                  text-2xl
                  font-bold
                  leading-tight
                  tracking-tight
                  text-gray-950

                  sm:text-3xl

                  lg:text-[34px]
                "
              >
                Tempat Mahasiswa <span className="text-blue-600">Tumbuh dan Berkarya</span>.
              </h3>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-7
                  text-gray-600

                  sm:text-base
                  sm:leading-8
                "
              >
                HMPTI menjadi ruang bagi mahasiswa Teknik Informatika untuk belajar, berkolaborasi, mengembangkan potensi, dan menciptakan kontribusi melalui teknologi.
              </p>

              {/* =================================
                  STATEMENT
              ================================== */}

              <div
                className="
                  mt-7
                  border-l-2
                  border-blue-600
                  pl-4

                  sm:pl-5
                "
              >
                <p
                  className="
                    max-w-lg
                    text-sm
                    font-medium
                    leading-7
                    text-gray-800

                    sm:text-base
                  "
                >
                  Bukan hanya tentang organisasi, tetapi tentang proses bertumbuh, belajar, dan bergerak bersama.
                </p>
              </div>

              {/* =================================
                  HIGHLIGHTS
              ================================== */}

              <div
                className="
                  mt-8
                  grid
                  grid-cols-1
                  border-t
                  border-gray-100

                  sm:grid-cols-3
                "
              >
                <AboutHighlight value="2010" label="Berdiri Sejak" />

                <AboutHighlight value="Teknologi" label="Bidang Utama" />

                <AboutHighlight value="Kolaboratif" label="Budaya Organisasi" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// =========================================================
// ABOUT HIGHLIGHT
// =========================================================

function AboutHighlight({
  value,
  label,
}: {
  value: string;

  label: string;
}) {
  return (
    <div
      className="
        relative
        py-5

        sm:px-5

        first:sm:pl-0
        last:sm:pr-0

        [&:not(:last-child)]:border-b
        [&:not(:last-child)]:border-gray-100

        sm:[&:not(:last-child)]:border-b-0
        sm:[&:not(:last-child)]:border-r
      "
    >
      <p
        className="
          text-lg
          font-bold
          tracking-tight
          text-gray-950

          sm:text-xl
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1
          text-xs
          font-medium
          leading-5
          text-gray-400

          sm:text-sm
        "
      >
        {label}
      </p>
    </div>
  );
}

// =========================================================
// VISION & MISSION
// =========================================================

function VisionMissionSection() {
  return (
    <section
      id="visi-misi"
      className="
        relative
        bg-white
        px-4
        py-14

        sm:px-6
        sm:py-16

        lg:px-8
        lg:py-20
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
        "
      >
        <SectionHeader
          title={
            <>
              <span
                className="
                  bg-gradient-to-r
                  from-blue-600
                  to-indigo-600
                  bg-clip-text
                  text-transparent
                "
              >
                Visi
              </span>

              {" dan "}

              <span
                className="
                  bg-gradient-to-r
                  from-indigo-600
                  to-purple-600
                  bg-clip-text
                  text-transparent
                "
              >
                Misi
              </span>
            </>
          }
          description="Pedoman yang menjadi arah perjalanan dan pengembangan organisasi."
        />

        <div
          className="
            grid
            grid-cols-1
            gap-6

            lg:grid-cols-2
            lg:gap-8
          "
        >
          {/* =====================================
              VISION
          ====================================== */}

          <motion.article
            initial={{
              opacity: 0,
              y: 24,
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
              duration: 0.55,
            }}
            className="
              rounded-3xl
              border
              border-gray-100
              bg-white
              p-6
              shadow-sm
              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:shadow-lg

              sm:p-8
            "
          >
            <div
              className="
                mb-6
                flex
                items-center
                gap-4
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-50
                  text-blue-600
                  ring-1
                  ring-blue-100
                "
              >
                <FiTarget size={22} />
              </div>

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
                  Arah Organisasi
                </p>

                <h3
                  className="
                    mt-1
                    text-2xl
                    font-bold
                    text-gray-900
                  "
                >
                  Visi
                </h3>
              </div>
            </div>

            <blockquote
              className="
                text-base
                leading-8
                text-gray-600

                sm:text-lg
              "
            >
              &ldquo;Menjadi himpunan mahasiswa terdepan yang mencetak insan profesional di bidang teknologi informasi yang berkarakter, inovatif, dan berdaya saing global.&rdquo;
            </blockquote>
          </motion.article>

          {/* =====================================
              MISSION
          ====================================== */}

          <motion.article
            initial={{
              opacity: 0,
              y: 24,
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
              duration: 0.55,
              delay: 0.08,
            }}
            className="
              rounded-3xl
              border
              border-gray-100
              bg-white
              p-6
              shadow-sm
              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:shadow-lg

              sm:p-8
            "
          >
            <div
              className="
                mb-6
                flex
                items-center
                gap-4
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-50
                  text-indigo-600
                  ring-1
                  ring-indigo-100
                "
              >
                <FiBook size={22} />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-indigo-600
                  "
                >
                  Langkah Bersama
                </p>

                <h3
                  className="
                    mt-1
                    text-2xl
                    font-bold
                    text-gray-900
                  "
                >
                  Misi
                </h3>
              </div>
            </div>

            <ul className="space-y-4">
              {missions.map((item) => (
                <li
                  key={item}
                  className="
                      flex
                      items-start
                      gap-3
                    "
                >
                  <span
                    className="
                        mt-[9px]
                        h-1.5
                        w-1.5
                        shrink-0
                        rounded-full
                        bg-indigo-500
                      "
                  />

                  <span
                    className="
                        text-sm
                        leading-7
                        text-gray-600

                        sm:text-base
                      "
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.article>
        </div>
      </div>
    </section>
  );
}

// =========================================================
// VALUES
// =========================================================

function ValuesSection() {
  return (
    <section
      id="nilai"
      className="
        bg-gradient-to-br
        from-gray-50
        to-white
        px-4
        py-14

        sm:px-6
        sm:py-16

        lg:px-8
        lg:py-20
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
        "
      >
        <SectionHeader
          title={
            <>
              Nilai
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
                Inti
              </span>
              {" Kami"}
            </>
          }
          description="Prinsip yang menjadi dasar dalam setiap kegiatan, keputusan, dan proses organisasi."
        />

        <div
          className="
            grid
            grid-cols-1
            gap-5

            sm:grid-cols-2

            lg:grid-cols-3
            lg:gap-6
          "
        >
          {values.map((value, index) => (
            <motion.article
              key={value.title}
              initial={{
                opacity: 0,
                y: 24,
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
                delay: Math.min(index * 0.06, 0.25),
              }}
              className="
                  group
                  rounded-3xl
                  border
                  border-gray-100
                  bg-white
                  p-6
                  shadow-sm
                  transition-all
                  duration-300

                  hover:-translate-y-1
                  hover:shadow-lg
                  hover:shadow-blue-100/60

                  sm:p-7
                "
            >
              <div
                className="
                    mb-5
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-50
                    text-blue-600
                    ring-1
                    ring-blue-100
                    transition-transform
                    duration-300

                    group-hover:scale-105
                  "
              >
                {value.icon}
              </div>

              <h3
                className="
                    text-xl
                    font-bold
                    text-gray-900
                  "
              >
                {value.title}
              </h3>

              <p
                className="
                    mt-3
                    text-sm
                    leading-7
                    text-gray-600

                    sm:text-base
                  "
              >
                {value.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

// =========================================================
// CTA
// =========================================================

function CTASection() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-gradient-to-br
        from-gray-950
        via-blue-950
        to-indigo-950
        px-4
        py-14
        text-white

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
        "
      >
        <div
          className="
            absolute
            inset-0
            opacity-[0.08]
            bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')]
          "
        />
      </div>

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-4xl
          text-center
        "
      >
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
            duration: 0.55,
          }}
        >
          <div
            className="
              mx-auto
              mb-6
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-white/10
              bg-white/10
            "
          >
            <IoRocketOutline
              className="
                text-2xl
                text-blue-300
              "
            />
          </div>

          <h2
            className="
              text-3xl
              font-bold
              tracking-tight

              sm:text-4xl

              lg:text-5xl
            "
          >
            Kenali Lebih Dekat
            <span
              className="
                ml-2
                bg-gradient-to-r
                from-blue-300
                to-indigo-300
                bg-clip-text
                text-transparent
              "
            >
              HMPTI
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-sm
              leading-7
              text-blue-100/70

              sm:text-base

              md:text-lg
            "
          >
            Jelajahi kegiatan, program, dan orang-orang yang bergerak bersama untuk mengembangkan HMPTI.
          </p>

          <div
            className="
              mt-8
              flex
              flex-col
              justify-center
              gap-3

              sm:flex-row
            "
          >
            <Link
              href="/pages/event"
              className="
                inline-flex
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
                shadow-blue-950/20
                transition-all

                hover:-translate-y-0.5
                hover:bg-blue-500
              "
            >
              Lihat Kegiatan
              <FiArrowRight />
            </Link>

            <Link
              href="/pages/fungsionaris/ketua-wakil"
              className="
                inline-flex
                items-center
                justify-center
                rounded-xl
                border
                border-white/20
                bg-white/5
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                transition-all

                hover:bg-white/10
              "
            >
              Kenali Pengurus
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// =========================================================
// SECTION HEADER
// =========================================================

function SectionHeader({
  title,
  description,
}: {
  title: ReactNode;

  description: string;
}) {
  return (
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
      <h2
        className="
          text-3xl
          font-bold
          tracking-tight
          text-gray-900

          sm:text-4xl
        "
      >
        {title}
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
        {description}
      </p>
    </motion.div>
  );
}

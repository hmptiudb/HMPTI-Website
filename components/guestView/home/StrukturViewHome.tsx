"use client";

import {
  MotionConfig,
  motion,
} from "framer-motion";

import Image from "next/image";
import Link from "next/link";

import {
  FiArrowRight,
  FiLayers,
  FiUsers,
} from "react-icons/fi";

import {
  IoPeopleCircleOutline,
} from "react-icons/io5";


// =========================================================
// TYPES
// =========================================================

interface StructureMember {
  name: string;

  shortName: string;

  image: string;

  description: string;

  role: string;

  link: string;

  accent: string;

  accentSoft: string;

  isLeader?: boolean;
}


// =========================================================
// DATA
// =========================================================

const teamMembers: StructureMember[] = [
  {
    name: "Ketua & Wakil Ketua",
    shortName: "Ketua & Wakil",
    image:
      "/assets/image/LogoKetua.png",
    description:
      "Memimpin, mengarahkan, dan mengoordinasikan seluruh kegiatan serta perjalanan organisasi HMPTI.",
    role:
      "Pimpinan Organisasi",
    link:
      "/pages/fungsionaris/ketua-wakil",
    accent:
      "from-blue-600 to-indigo-500",
    accentSoft:
      "bg-blue-50 text-blue-700 border-blue-100",
    isLeader:
      true,
  },

  {
    name: "Sekretaris",
    shortName: "Sekretaris",
    image:
      "/assets/image/LogoSekretaris.png",
    description:
      "Mengelola administrasi, surat-menyurat, dokumentasi, dan kebutuhan kesekretariatan organisasi.",
    role:
      "Administrasi",
    link:
      "/pages/fungsionaris/sekretaris",
    accent:
      "from-emerald-500 to-green-400",
    accentSoft:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
  },

  {
    name: "Bendahara",
    shortName: "Bendahara",
    image:
      "/assets/image/LogoBendahara.png",
    description:
      "Mengelola keuangan organisasi secara teratur, transparan, dan bertanggung jawab.",
    role:
      "Keuangan",
    link:
      "/pages/fungsionaris/bendahara",
    accent:
      "from-green-600 to-lime-500",
    accentSoft:
      "bg-green-50 text-green-700 border-green-100",
  },

  {
    name: "Riset & Teknologi",
    shortName: "Riset & Teknologi",
    image:
      "/assets/image/LogoRiset.png",
    description:
      "Mengembangkan wawasan, penelitian, inovasi, dan kompetensi mahasiswa di bidang teknologi.",
    role:
      "Riset & Inovasi",
    link:
      "/pages/fungsionaris/riset-dan-teknologi",
    accent:
      "from-violet-600 to-purple-500",
    accentSoft:
      "bg-violet-50 text-violet-700 border-violet-100",
  },

  {
    name: "Kominfo",
    shortName: "Kominfo",
    image:
      "/assets/image/LogoKominfo.png",
    description:
      "Mengelola media, informasi, publikasi, dokumentasi visual, dan komunikasi digital HMPTI.",
    role:
      "Komunikasi & Informasi",
    link:
      "/pages/fungsionaris/kominfo",
    accent:
      "from-amber-500 to-orange-500",
    accentSoft:
      "bg-amber-50 text-amber-700 border-amber-100",
  },

  {
    name: "Minat & Bakat",
    shortName: "Minat & Bakat",
    image:
      "/assets/image/LogoMinatbakat.png",
    description:
      "Menjadi ruang pengembangan potensi, kreativitas, minat, dan bakat mahasiswa di luar akademik.",
    role:
      "Pengembangan Potensi",
    link:
      "/pages/fungsionaris/minat-dan-bakat",
    accent:
      "from-pink-600 to-rose-500",
    accentSoft:
      "bg-pink-50 text-pink-700 border-pink-100",
  },

  {
    name: "Humas",
    shortName: "Humas",
    image:
      "/assets/image/LogoHumas.png",
    description:
      "Membangun komunikasi dan hubungan baik antara HMPTI dengan pihak internal maupun eksternal.",
    role:
      "Hubungan Masyarakat",
    link:
      "/pages/fungsionaris/humas",
    accent:
      "from-teal-600 to-cyan-500",
    accentSoft:
      "bg-teal-50 text-teal-700 border-teal-100",
  },
];


// =========================================================
// MAIN COMPONENT
// =========================================================

export default function StrukturViewHome() {
  const leader =
    teamMembers.find(
      (
        member,
      ) =>
        member.isLeader,
    );


  const divisions =
    teamMembers.filter(
      (
        member,
      ) =>
        !member.isLeader,
    );


  return (
    <MotionConfig reducedMotion="user">
      <section
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
          {/* GRID */}

          <div
            className="
              absolute
              inset-0
              opacity-[0.055]
              bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]
            "
          />


          {/* BLURS */}

          <div
            className="
              absolute
              -left-32
              top-24
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
              -right-24
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
              SECTION HEADER
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
              mb-10
              max-w-3xl
              text-center

              sm:mb-12

              lg:mb-14
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
              <IoPeopleCircleOutline
                className="
                  shrink-0
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
                Struktur Organisasi
              </span>
            </div>


            <h2
              className="
                text-3xl
                font-bold
                leading-tight
                tracking-tight
                text-gray-950

                sm:text-4xl

                lg:text-5xl
              "
            >
              Bergerak dalam{" "}

              <span
                className="
                  bg-gradient-to-r
                  from-blue-600
                  to-cyan-500
                  bg-clip-text
                  text-transparent
                "
              >
                Satu Struktur
              </span>
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
                md:leading-8
              "
            >
              Setiap bagian memiliki tanggung
              jawab yang berbeda, tetapi bergerak
              dalam satu tujuan untuk
              mengembangkan HMPTI Universitas
              Duta Bangsa.
            </p>
          </motion.div>


          {/* =======================================
              LEADER
          ======================================== */}

          {leader && (
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
                relative
                mx-auto
                max-w-3xl
              "
            >
              <LeaderCard
                member={
                  leader
                }
              />


              {/* =================================
                  DESKTOP CONNECTOR
              ================================== */}

              <div
                aria-hidden="true"
                className="
                  absolute
                  -bottom-10
                  left-1/2
                  hidden
                  h-10
                  w-px
                  -translate-x-1/2
                  bg-gradient-to-b
                  from-blue-300
                  to-gray-200

                  md:block
                "
              />
            </motion.div>
          )}


          {/* =======================================
              DIVISION CONNECTOR
          ======================================== */}

          <div
            aria-hidden="true"
            className="
              relative
              mx-auto
              hidden
              h-10
              max-w-5xl

              md:block
            "
          >
            <div
              className="
                absolute
                left-[8%]
                right-[8%]
                top-full
                h-px
                bg-gradient-to-r
                from-transparent
                via-gray-200
                to-transparent
              "
            />
          </div>


          {/* =======================================
              DIVISIONS LABEL
          ======================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.45,
            }}
            className="
              mb-6
              mt-8
              flex
              items-center
              justify-center
              gap-2

              md:mt-6

              lg:mb-8
            "
          >
            <div
              className="
                flex
                h-9
                w-9
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
              <FiLayers />
            </div>


            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-blue-600
                "
              >
                Bidang Organisasi
              </p>

              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-700
                "
              >
                Bagian & Divisi HMPTI
              </p>
            </div>
          </motion.div>


          {/* =======================================
              DIVISION GRID
          ======================================== */}

          <div
            className="
              grid
              grid-cols-1
              gap-4

              sm:grid-cols-2
              sm:gap-5

              lg:grid-cols-3
              lg:gap-6
            "
          >
            {divisions.map(
              (
                member,
                index,
              ) => (
                <DivisionCard
                  key={
                    member.name
                  }
                  member={
                    member
                  }
                  index={
                    index
                  }
                />
              ),
            )}
          </div>


          {/* =======================================
              CLOSING CTA
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
              amount: 0.2,
            }}
            transition={{
              duration: 0.5,
            }}
            className="
              mt-12

              sm:mt-14

              lg:mt-16
            "
          >
            <div
              className="
                relative
                overflow-hidden
                rounded-[24px]
                border
                border-blue-100
                bg-white
                px-5
                py-7
                shadow-sm

                sm:px-7
                sm:py-8

                lg:rounded-[28px]
                lg:px-10
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
                    -right-20
                    -top-20
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
                    -bottom-24
                    -left-16
                    h-52
                    w-52
                    rounded-full
                    bg-cyan-100/50
                    blur-3xl
                  "
                />
              </div>


              <div
                className="
                  relative
                  z-10
                  flex
                  flex-col
                  gap-6

                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                "
              >
                {/* TEXT */}

                <div
                  className="
                    max-w-2xl
                  "
                >
                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      font-semibold
                      text-blue-600
                    "
                  >
     

                    Kenali HMPTI lebih dekat
                  </div>


                  <h3
                    className="
                      mt-2
                      text-2xl
                      font-bold
                      leading-tight
                      tracking-tight
                      text-gray-950

                      sm:text-3xl
                    "
                  >
                    Kenali orang-orang di balik
                    perjalanan HMPTI.
                  </h3>


                  <p
                    className="
                      mt-3
                      max-w-xl
                      text-sm
                      leading-7
                      text-gray-600

                      sm:text-base
                    "
                  >
                    Lihat seluruh fungsionaris dan
                    kenali lebih dekat peran setiap
                    pengurus dalam organisasi.
                  </p>
                </div>


                {/* ACTIONS */}

                <div
                  className="
                    flex
                    w-full
                    flex-col
                    gap-3

                    sm:w-auto
                    sm:flex-row
                  "
                >
                  <Link
                    href="/pages/fungsionaris"
                    className="
                      group
                      inline-flex
                      min-h-11
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

                      sm:px-6
                    "
                  >
                    Lihat Fungsionaris

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
                      inline-flex
                      min-h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-gray-700
                      transition-all

                      hover:border-blue-200
                      hover:bg-blue-50
                      hover:text-blue-700

                      sm:px-6
                    "
                  >
                    Lihat Kegiatan
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}


// =========================================================
// LEADER CARD
// =========================================================

function LeaderCard({
  member,
}: {
  member: StructureMember;
}) {
  return (
    <Link
      href={
        member.link
      }
      className="
        group
        block
        overflow-hidden
        rounded-[24px]
        border
        border-blue-100
        bg-white
        shadow-[0_20px_60px_rgba(37,99,235,0.08)]
        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-[0_26px_70px_rgba(37,99,235,0.13)]

        sm:rounded-[28px]
      "
    >
      {/* =========================================
          ACCENT
      ========================================== */}

      <div
        className={`
          h-1
          w-full
          bg-gradient-to-r

          ${member.accent}
        `}
      />


      <div
        className="
          grid
          grid-cols-1

          sm:grid-cols-[220px_minmax(0,1fr)]
          sm:items-stretch

          md:grid-cols-[250px_minmax(0,1fr)]
        "
      >
        {/* =========================================
            LOGO
        ========================================== */}

        <div
          className="
            relative
            aspect-[16/10]
            overflow-hidden
            bg-gradient-to-br
            from-blue-50
            via-white
            to-indigo-50

            sm:aspect-auto
            sm:min-h-[245px]
          "
        >
          <div
            aria-hidden="true"
            className="
              absolute
              inset-5
              rounded-2xl
              border
              border-blue-100/60
            "
          />


          <Image
            src={
              member.image
            }
            alt={`Logo ${member.name}`}
            fill
            priority
            sizes="
              (max-width: 639px) 92vw,
              250px
            "
            className="
              object-contain
              p-9
              transition-transform
              duration-500

              group-hover:scale-[1.04]

              sm:p-8
            "
          />
        </div>


        {/* =========================================
            CONTENT
        ========================================== */}

        <div
          className="
            flex
            min-w-0
            flex-col
            justify-center
            border-t
            border-gray-100
            p-5

            sm:border-l
            sm:border-t-0
            sm:p-6

            md:p-8
          "
        >
          <div>
            <span
              className={`
                inline-flex
                rounded-full
                border
                px-3
                py-1.5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.1em]

                sm:text-xs

                ${member.accentSoft}
              `}
            >
              {
                member.role
              }
            </span>
          </div>


          <h3
            className="
              mt-4
              text-2xl
              font-bold
              leading-tight
              tracking-tight
              text-gray-950

              sm:text-3xl
            "
          >
            {
              member.name
            }
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
            {
              member.description
            }
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
            Lihat Pengurus

            <FiArrowRight
              className="
                transition-transform

                group-hover:translate-x-1
              "
            />
          </div>
        </div>
      </div>
    </Link>
  );
}


// =========================================================
// DIVISION CARD
// =========================================================

function DivisionCard({
  member,
  index,
}: {
  member: StructureMember;

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

        delay: Math.min(
          index * 0.05,
          0.25,
        ),
      }}
      className="
        group
        h-full
        min-w-0
      "
    >
      <Link
        href={
          member.link
        }
        className="
          flex
          h-full
          min-w-0
          flex-col
          overflow-hidden
          rounded-[22px]
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

          sm:rounded-3xl
        "
      >
        {/* =========================================
            TOP ACCENT
        ========================================== */}

        <div
          className={`
            h-1
            w-full
            bg-gradient-to-r

            ${member.accent}
          `}
        />


        {/* =========================================
            LOGO
        ========================================== */}

        <div
          className="
            relative
            aspect-[16/10]
            overflow-hidden
            bg-gradient-to-br
            from-gray-50
            via-white
            to-blue-50/30
          "
        >
          <div
            aria-hidden="true"
            className="
              absolute
              inset-4
              rounded-2xl
              border
              border-gray-100

              sm:inset-5
            "
          />


          <Image
            src={
              member.image
            }
            alt={`Logo ${member.name}`}
            fill
            sizes="
              (max-width: 639px) 92vw,
              (max-width: 1023px) 46vw,
              31vw
            "
            className="
              object-contain
              p-8
              transition-transform
              duration-500

              group-hover:scale-[1.04]

              sm:p-9

              lg:p-10
            "
          />
        </div>


        {/* =========================================
            CONTENT
        ========================================== */}

        <div
          className="
            flex
            flex-1
            flex-col
            border-t
            border-gray-100
            p-5

            sm:p-6
          "
        >
          <div>
            <span
              className={`
                inline-flex
                rounded-full
                border
                px-2.5
                py-1
                text-[10px]
                font-semibold

                sm:text-[11px]

                ${member.accentSoft}
              `}
            >
              {
                member.role
              }
            </span>
          </div>


          <h3
            className="
              mt-3
              text-xl
              font-bold
              leading-tight
              text-gray-950

              sm:text-[22px]
            "
          >
            {
              member.name
            }
          </h3>


          <p
            className="
              mt-2.5
              text-sm
              leading-6
              text-gray-500

              sm:leading-7
            "
          >
            {
              member.description
            }
          </p>


          <div
            className="
              mt-auto
              pt-5
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
                border-t
                border-gray-100
                pt-4
              "
            >
              <span
                className="
                  text-sm
                  font-semibold
                  text-blue-600
                "
              >
                Lihat Detail
              </span>


              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-50
                  text-blue-600
                  transition-all

                  group-hover:bg-blue-600
                  group-hover:text-white
                "
              >
                <FiArrowRight
                  className="
                    text-sm
                    transition-transform

                    group-hover:translate-x-0.5
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
"use client";

import { membersCollection } from "@/lib/firebase";

import {
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import Image from "next/image";

import {
  type ReactNode,
  useEffect,
  useState,
} from "react";

import {
  FiAward,
  FiGithub,
  FiInstagram,
  FiMail,
} from "react-icons/fi";

import { FaCrow } from "react-icons/fa";

import {
  IoPeopleCircleOutline,
  IoSparkles,
} from "react-icons/io5";


// =========================================================
// TYPES
// =========================================================

interface Member {
  id: string;

  nim: string;

  name: string;

  division?: string;

  position?: string;

  imageUrl: string;

  status?: string;

  linkInstagram?: string;

  linkGithub?: string;

  email?: string;

  phone?: string;

  linkLinkedin?: string;

  linkTwitter?: string;

  bio?: string;

  motto?: string;
}


// =========================================================
// CONSTANTS
// =========================================================

const LEADER_POSITIONS = [
  "Ketua",
  "Wakil Ketua",
];


// =========================================================
// PAGE
// =========================================================

export default function KetuaPage() {
  const [
    members,
    setMembers,
  ] = useState<Member[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  // =======================================================
  // FETCH LEADERS
  // =======================================================

  useEffect(() => {
    let isMounted = true;


    const fetchMembers =
      async () => {
        try {
          setLoading(
            true,
          );

          setError(
            null,
          );


          const leadersQuery =
            query(
              membersCollection,

              where(
                "position",
                "in",
                LEADER_POSITIONS,
              ),
            );


          const snapshot =
            await getDocs(
              leadersQuery,
            );


          const leaders =
            snapshot.docs.map(
              (
                document,
              ) =>
                ({
                  id:
                    document.id,

                  ...document.data(),
                }) as Member,
            );


          // =========================================
          // KETUA SELALU DI DEPAN
          // =========================================

          const sortedLeaders =
            leaders.sort(
              (
                a,
                b,
              ) => {
                const getOrder =
                  (
                    position?: string,
                  ) => {
                    if (
                      position ===
                      "Ketua"
                    ) {
                      return 0;
                    }

                    if (
                      position ===
                      "Wakil Ketua"
                    ) {
                      return 1;
                    }

                    return 2;
                  };


                return (
                  getOrder(
                    a.position,
                  ) -
                  getOrder(
                    b.position,
                  )
                );
              },
            );


          if (isMounted) {
            setMembers(
              sortedLeaders,
            );
          }
        } catch (err) {
          console.error(
            "Error fetching members:",
            err,
          );


          if (isMounted) {
            setError(
              "Gagal memuat data kepemimpinan",
            );
          }
        } finally {
          if (isMounted) {
            setLoading(
              false,
            );
          }
        }
      };


    void fetchMembers();


    return () => {
      isMounted = false;
    };
  }, []);


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <LoadingScreen />
    );
  }


  // =======================================================
  // ERROR
  // =======================================================

  if (error) {
    return (
      <ErrorScreen
        error={
          error
        }
      />
    );
  }


  // =======================================================
  // PAGE
  // =======================================================

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-white
      "
    >
      <BackgroundElements />


      <div
        className="
          relative
          z-10
        "
      >
        <HeroSection />

        <LeadersSection
          members={
            members
          }
        />

        <VisionSection />
      </div>
    </main>
  );
}


// =========================================================
// BACKGROUND
// =========================================================

function BackgroundElements() {
  const shouldReduceMotion =
    useReducedMotion();


  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        fixed
        inset-0
        overflow-hidden
      "
    >
      {/* =========================================
          TOP GRADIENT
      ========================================== */}

      <div
        className="
          absolute
          inset-x-0
          top-0
          h-[420px]
          bg-gradient-to-br
          from-blue-50/50
          via-white/30
          to-indigo-50/30
        "
      />


      {/* =========================================
          BOTTOM GRADIENT
      ========================================== */}

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          h-[420px]
          bg-gradient-to-t
          from-gray-50/50
          to-white/20
        "
      />


      {/* =========================================
          GRID
      ========================================== */}

      <div
        className="
          absolute
          inset-0
          opacity-[0.14]
          bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2U1ZTVlNSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]
        "
      />


      {/* =========================================
          LEFT GLOW
      ========================================== */}

      <motion.div
        className="
          absolute
          left-[8%]
          top-[22%]
          hidden
          h-72
          w-72
          rounded-full
          bg-blue-200/10
          blur-3xl

          md:block

          lg:h-96
          lg:w-96
        "
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [
                  0,
                  16,
                  0,
                ],

                y: [
                  0,
                  -16,
                  0,
                ],
              }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : {
                duration: 16,

                repeat:
                  Infinity,

                ease:
                  "easeInOut",
              }
        }
      />


      {/* =========================================
          RIGHT GLOW
      ========================================== */}

      <motion.div
        className="
          absolute
          bottom-[18%]
          right-[8%]
          hidden
          h-64
          w-64
          rounded-full
          bg-indigo-200/10
          blur-3xl

          md:block

          lg:h-80
          lg:w-80
        "
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [
                  0,
                  -12,
                  0,
                ],

                y: [
                  0,
                  12,
                  0,
                ],
              }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : {
                duration: 14,

                repeat:
                  Infinity,

                ease:
                  "easeInOut",
              }
        }
      />
    </div>
  );
}


// =========================================================
// LOADING SCREEN
// =========================================================

function LoadingScreen() {
  return (
    <main
      aria-busy="true"
      aria-label="Memuat data kepemimpinan HMPTI"
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-white
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
            inset-x-0
            top-0
            h-[420px]
            bg-gradient-to-br
            from-blue-50/50
            via-white
            to-indigo-50/30
          "
        />


        <div
          className="
            absolute
            inset-0
            opacity-[0.10]
            bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2U1ZTVlNSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]
          "
        />


        <div
          className="
            absolute
            -left-32
            top-32
            hidden
            h-80
            w-80
            rounded-full
            bg-blue-100/40
            blur-3xl

            md:block
          "
        />


        <div
          className="
            absolute
            -right-24
            top-[420px]
            hidden
            h-80
            w-80
            rounded-full
            bg-indigo-100/30
            blur-3xl

            md:block
          "
        />
      </div>


      {/* =========================================
          CONTENT
      ========================================== */}

      <div
        className="
          relative
          z-10
        "
      >
        {/* =======================================
            HERO SKELETON
        ======================================== */}

        <section
          className="
            px-4
            pb-10
            pt-28

            sm:px-6
            sm:pb-14
            sm:pt-32

            lg:px-8
            lg:pb-16
            lg:pt-36
          "
        >
          <div
            className="
              mx-auto
              flex
              max-w-4xl
              flex-col
              items-center
              text-center
            "
          >
            {/* BADGE */}

            <SkeletonBlock
              className="
                h-9
                w-48
                rounded-full

                sm:w-56
              "
            />


            {/* TITLE */}

            <SkeletonBlock
              className="
                mt-6
                h-10
                w-[72%]
                max-w-[390px]
                rounded-xl

                sm:h-12
                sm:max-w-[470px]

                lg:h-14
                lg:max-w-[520px]
              "
            />


            <SkeletonBlock
              className="
                mt-3
                h-10
                w-[48%]
                max-w-[230px]
                rounded-xl

                sm:h-12
                sm:max-w-[270px]

                lg:h-14
                lg:max-w-[310px]
              "
            />


            {/* DESCRIPTION */}

            <div
              className="
                mt-6
                flex
                w-full
                max-w-2xl
                flex-col
                items-center
                gap-2.5
              "
            >
              <SkeletonBlock
                className="
                  h-4
                  w-[92%]
                  rounded-full
                "
              />

              <SkeletonBlock
                className="
                  h-4
                  w-[78%]
                  rounded-full
                "
              />
            </div>
          </div>
        </section>


        {/* =======================================
            LEADER SECTION SKELETON
        ======================================== */}

        <section
          className="
            px-4
            py-10

            sm:px-6
            sm:py-14

            lg:px-8
            lg:py-16
          "
        >
          <div
            className="
              mx-auto
              max-w-5xl
            "
          >
            {/* SECTION TITLE */}

            <div
              className="
                mx-auto
                mb-8
                flex
                max-w-2xl
                flex-col
                items-center

                sm:mb-10
              "
            >
              <SkeletonBlock
                className="
                  h-8
                  w-52
                  rounded-lg

                  sm:h-9
                  sm:w-60
                "
              />

              <SkeletonBlock
                className="
                  mt-4
                  h-4
                  w-[85%]
                  rounded-full
                "
              />

              <SkeletonBlock
                className="
                  mt-2
                  h-4
                  w-[65%]
                  rounded-full
                "
              />
            </div>


            {/* =====================================
                LEADER CARDS
            ====================================== */}

            <div
              className="
                mx-auto
                grid
                max-w-4xl
                grid-cols-1
                gap-6

                md:grid-cols-2

                lg:gap-8
              "
            >
              <LeaderCardSkeleton />

              <LeaderCardSkeleton />
            </div>
          </div>
        </section>


        {/* =======================================
            SMALL LOADING INDICATOR
        ======================================== */}

        <div
          className="
            flex
            items-center
            justify-center
            px-4
            pb-12
            pt-2
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-gray-100
              bg-white/80
              px-4
              py-2
              shadow-sm
              backdrop-blur-sm
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-blue-500
                motion-safe:animate-pulse
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
              Menyiapkan data kepemimpinan
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}


// =========================================================
// LEADER CARD SKELETON
// =========================================================

function LeaderCardSkeleton() {
  return (
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
      {/* =========================================
          IMAGE
      ========================================== */}

      <SkeletonBlock
        className="
          aspect-[5/4]
          w-full
          rounded-none
        "
      />


      {/* =========================================
          CONTENT
      ========================================== */}

      <div
        className="
          p-5

          sm:p-6
        "
      >
        {/* POSITION */}

        <SkeletonBlock
          className="
            h-7
            w-24
            rounded-full
          "
        />


        {/* NAME */}

        <SkeletonBlock
          className="
            mt-4
            h-7
            w-[62%]
            rounded-lg
          "
        />


        {/* NIM */}

        <SkeletonBlock
          className="
            mt-3
            h-4
            w-28
            rounded-full
          "
        />


        {/* MOTTO */}

        <div
          className="
            mt-6
            border-l-2
            border-gray-100
            pl-4
          "
        >
          <SkeletonBlock
            className="
              h-4
              w-full
              rounded-full
            "
          />

          <SkeletonBlock
            className="
              mt-2
              h-4
              w-[82%]
              rounded-full
            "
          />
        </div>


        {/* BIO */}

        <div
          className="
            mt-5
            space-y-2
          "
        >
          <SkeletonBlock
            className="
              h-4
              w-full
              rounded-full
            "
          />

          <SkeletonBlock
            className="
              h-4
              w-[92%]
              rounded-full
            "
          />

          <SkeletonBlock
            className="
              h-4
              w-[70%]
              rounded-full
            "
          />
        </div>


        {/* SOCIAL */}

        <div
          className="
            mt-6
            flex
            gap-2.5
          "
        >
          <SkeletonBlock
            className="
              h-10
              w-10
              rounded-xl
            "
          />

          <SkeletonBlock
            className="
              h-10
              w-10
              rounded-xl
            "
          />

          <SkeletonBlock
            className="
              h-10
              w-10
              rounded-xl
            "
          />
        </div>
      </div>
    </div>
  );
}


// =========================================================
// SKELETON BLOCK
// =========================================================

function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`
        bg-gradient-to-r
        from-gray-100
        via-gray-200/70
        to-gray-100
        motion-safe:animate-pulse

        ${className}
      `}
    />
  );
}


// =========================================================
// ERROR SCREEN
// =========================================================

function ErrorScreen({
  error,
}: {
  error: string;
}) {
  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-white
        px-4
      "
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-gray-100
          bg-white
          p-6
          text-center
          shadow-xl
          shadow-gray-200/50

          sm:p-8
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
          <IoPeopleCircleOutline
            className="
              text-2xl
              text-red-500
            "
          />
        </div>


        <h2
          className="
            mb-2
            text-xl
            font-bold
            text-gray-900
          "
        >
          Terjadi Kesalahan
        </h2>


        <p
          className="
            mb-6
            text-sm
            leading-6
            text-gray-500

            sm:text-base
          "
        >
          {error}
        </p>


        <button
          type="button"
          onClick={() =>
            window.location.reload()
          }
          className="
            rounded-xl
            bg-gray-900
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            transition-colors

            hover:bg-gray-800
          "
        >
          Coba Lagi
        </button>
      </motion.div>
    </div>
  );
}


// =========================================================
// HERO
// =========================================================

function HeroSection() {
  return (
    <section
      className="
        px-4
        pb-10
        pt-28

        sm:px-6
        sm:pb-14
        sm:pt-32

        lg:px-8
        lg:pb-16
        lg:pt-36
      "
    >
      <div
        className="
          mx-auto
          max-w-4xl
          text-center
        "
      >
        {/* =========================================
            BADGE
        ========================================== */}

        <motion.div
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
          }}
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-blue-100
            bg-blue-50/80
            px-4
            py-2
            backdrop-blur-sm

            sm:mb-7
          "
        >
          <FaCrow className="text-blue-600" />


          <span
            className="
              text-xs
              font-semibold
              text-blue-700

              sm:text-sm
            "
          >
            Kepemimpinan Organisasi
          </span>
        </motion.div>


        {/* =========================================
            TITLE
        ========================================== */}

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
            mb-5
            text-4xl
            font-bold
            tracking-tight
            text-gray-900

            sm:text-5xl

            lg:text-6xl
          "
        >
          Pemimpin

          <span
            className="
              block
              bg-gradient-to-r
              from-blue-600
              to-indigo-500
              bg-clip-text
              text-transparent
            "
          >
            HMPTI
          </span>
        </motion.h1>


        {/* =========================================
            DESCRIPTION
        ========================================== */}

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
            max-w-2xl
            text-sm
            leading-7
            text-gray-500

            sm:text-base

            md:text-lg
            md:leading-8
          "
        >
          Memimpin dengan integritas, menginspirasi
          melalui tindakan, dan membangun masa depan
          teknologi bersama.
        </motion.p>
      </div>
    </section>
  );
}


// =========================================================
// LEADERS SECTION
// =========================================================

function LeadersSection({
  members,
}: {
  members: Member[];
}) {
  return (
    <section
      className="
        px-4
        py-10

        sm:px-6
        sm:py-14

        lg:px-8
        lg:py-16
      "
    >
      <div
        className="
          mx-auto
          max-w-5xl
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
            duration: 0.6,
          }}
          className="
            mx-auto
            mb-8
            max-w-2xl
            text-center

            sm:mb-10
          "
        >
          <h2
            className="
              mb-3
              text-2xl
              font-bold
              tracking-tight
              text-gray-900

              sm:text-3xl

              lg:text-4xl
            "
          >
            Tim Kepemimpinan
          </h2>


          <p
            className="
              text-sm
              leading-6
              text-gray-500

              sm:text-base
              sm:leading-7
            "
          >
            Para pemimpin yang membimbing HMPTI
            menuju kemajuan dalam teknologi,
            inovasi, dan pengembangan anggota.
          </p>
        </motion.div>


        {/* =========================================
            LEADERS
        ========================================== */}

        {members.length >
          0 && (
          <div
            className="
              mx-auto
              grid
              max-w-4xl
              grid-cols-1
              gap-6

              md:grid-cols-2

              lg:gap-8
            "
          >
            {members.map(
              (
                member,
                index,
              ) => (
                <LeaderCard
                  key={
                    member.id
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
        )}


        {/* =========================================
            EMPTY STATE
        ========================================== */}

        {members.length ===
          0 && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            whileInView={{
              opacity: 1,
            }}
            viewport={{
              once: true,
            }}
            className="
              py-14
              text-center

              sm:py-20
            "
          >
            <div
              className="
                mx-auto
                mb-5
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-3xl
                bg-gray-100
              "
            >
              <IoPeopleCircleOutline
                className="
                  text-3xl
                  text-gray-400
                "
              />
            </div>


            <h3
              className="
                mb-2
                text-lg
                font-bold
                text-gray-700

                sm:text-xl
              "
            >
              Belum Ada Data
            </h3>


            <p
              className="
                text-sm
                text-gray-500

                sm:text-base
              "
            >
              Data kepemimpinan akan segera tersedia.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}


// =========================================================
// LEADER CARD
// =========================================================

function LeaderCard({
  member,
  index,
}: {
  member: Member;

  index: number;
}) {
  const isKetua =
    member.position ===
    "Ketua";


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
        amount: 0.15,
      }}
      transition={{
        duration: 0.55,

        delay:
          index *
          0.08,
      }}
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-gray-100
        bg-white
        shadow-sm
        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-xl
        hover:shadow-gray-200/60
      "
    >
      <LeaderImage
        member={
          member
        }
      />


      <div
        className="
          flex
          flex-1
          flex-col
          p-5

          sm:p-6
        "
      >
        {/* =========================================
            POSITION
        ========================================== */}

        <div
          className={`
            mb-4
            inline-flex
            w-fit
            items-center
            rounded-full
            px-3
            py-1.5
            text-xs
            font-semibold
            ring-1
            ring-inset

            ${
              isKetua
                ? `
                  bg-blue-50
                  text-blue-700
                  ring-blue-100
                `
                : `
                  bg-indigo-50
                  text-indigo-700
                  ring-indigo-100
                `
            }
          `}
        >
          {
            member.position
          }
        </div>


        {/* =========================================
            NAME
        ========================================== */}

        <h3
          className="
            text-xl
            font-bold
            leading-snug
            tracking-tight
            text-gray-900

            sm:text-2xl
          "
        >
          {
            member.name
          }
        </h3>


        <p
          className="
            mt-1.5
            text-sm
            font-medium
            text-gray-500
          "
        >
          NIM:{" "}
          {
            member.nim
          }
        </p>


        {/* =========================================
            MOTTO
        ========================================== */}

        {member.motto && (
          <blockquote
            className={`
              mt-5
              border-l-2
              pl-4
              text-sm
              italic
              leading-6
              text-gray-600

              ${
                isKetua
                  ? "border-blue-400"
                  : "border-indigo-400"
              }
            `}
          >
            &ldquo;
            {
              member.motto
            }
            &rdquo;
          </blockquote>
        )}


        {/* =========================================
            BIO
        ========================================== */}

        {member.bio && (
          <p
            className="
              mt-4
              text-sm
              leading-7
              text-gray-500
            "
          >
            {
              member.bio
            }
          </p>
        )}


        {/* =========================================
            SOCIAL
        ========================================== */}

        <div
          className="
            mt-auto
            pt-5
          "
        >
          <SocialLinks
            member={
              member
            }
          />
        </div>
      </div>
    </motion.article>
  );
}


// =========================================================
// LEADER IMAGE
// =========================================================

function LeaderImage({
  member,
}: {
  member: Member;
}) {
  return (
    <div
      className="
        relative
        aspect-[5/4]
        overflow-hidden
        bg-gray-100
      "
    >
      {member.imageUrl ? (
        <Image
          src={
            member.imageUrl
          }
          alt={`Foto ${member.position} HMPTI - ${member.name}`}
          fill
          sizes="
            (max-width: 767px) 92vw,
            (max-width: 1199px) 44vw,
            400px
          "
          className="
            object-cover
            object-[center_32%]
            transition-transform
            duration-500
            ease-out

            group-hover:scale-[1.025]
          "
        />
      ) : (
        <LeaderPlaceholder
          name={
            member.name
          }
        />
      )}


      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-t
          from-black/10
          via-transparent
          to-transparent
        "
      />
    </div>
  );
}


// =========================================================
// PLACEHOLDER
// =========================================================

function LeaderPlaceholder({
  name,
}: {
  name: string;
}) {
  const initials =
    name
      .split(" ")
      .filter(
        Boolean,
      )
      .slice(
        0,
        2,
      )
      .map(
        (
          word,
        ) =>
          word
            .charAt(0)
            .toUpperCase(),
      )
      .join("");


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
        to-indigo-100
      "
    >
      <span
        className="
          text-4xl
          font-bold
          text-blue-600/70
        "
      >
        {initials ||
          "HM"}
      </span>
    </div>
  );
}


// =========================================================
// SOCIAL LINKS
// =========================================================

function SocialLinks({
  member,
}: {
  member: Member;
}) {
  const hasSocialLinks =
    member.linkInstagram ||
    member.linkGithub ||
    member.email;


  if (!hasSocialLinks) {
    return null;
  }


  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        gap-2.5
      "
    >
      {/* INSTAGRAM */}

      {member.linkInstagram && (
        <a
          href={
            member.linkInstagram
          }
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Instagram ${member.name}`}
          title={`Instagram ${member.name}`}
          className="
            group/social
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-gray-100
            bg-gray-50
            transition-all
            duration-200

            hover:border-pink-100
            hover:bg-pink-50
          "
        >
          <FiInstagram
            className="
              text-lg
              text-gray-600
              transition-colors

              group-hover/social:text-pink-600
            "
          />
        </a>
      )}


      {/* GITHUB */}

      {member.linkGithub && (
        <a
          href={
            member.linkGithub
          }
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`GitHub ${member.name}`}
          title={`GitHub ${member.name}`}
          className="
            group/social
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-gray-100
            bg-gray-50
            transition-all
            duration-200

            hover:border-gray-200
            hover:bg-gray-100
          "
        >
          <FiGithub
            className="
              text-lg
              text-gray-600
              transition-colors

              group-hover/social:text-gray-900
            "
          />
        </a>
      )}


      {/* EMAIL */}

      {member.email && (
        <a
          href={`mailto:${member.email}`}
          aria-label={`Email ${member.name}`}
          title={`Email ${member.name}`}
          className="
            group/social
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-gray-100
            bg-gray-50
            transition-all
            duration-200

            hover:border-red-100
            hover:bg-red-50
          "
        >
          <FiMail
            className="
              text-lg
              text-gray-600
              transition-colors

              group-hover/social:text-red-600
            "
          />
        </a>
      )}
    </div>
  );
}


// =========================================================
// VISION SECTION
// =========================================================

function VisionSection() {
  const missions = [
    "Membangun komunitas teknologi yang inklusif dan kolaboratif",
    "Mendorong inovasi dan kreativitas dalam pengembangan teknologi",
    "Menjalin kemitraan strategis dengan industri dan akademisi",
    "Mengembangkan potensi kepemimpinan setiap anggota",
  ];


  const commitments = [
    "Transparansi dalam setiap keputusan dan kebijakan",
    "Akuntabilitas terhadap seluruh anggota organisasi",
    "Pelayanan terbaik untuk kemajuan bersama",
    "Konsistensi dalam menjalankan visi organisasi",
  ];


  return (
    <section
      className="
        bg-gray-50/80
        px-4
        py-12

        sm:px-6
        sm:py-16

        lg:px-8
        lg:py-20
      "
    >
      <div
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
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.1,
          }}
          transition={{
            duration: 0.6,
          }}
          className="
            overflow-hidden
            rounded-3xl
            border
            border-gray-100
            bg-white
            p-5
            shadow-sm

            sm:p-8

            lg:p-10
          "
        >
          {/* =========================================
              HEADING
          ========================================== */}

          <div
            className="
              mx-auto
              mb-10
              max-w-2xl
              text-center

              sm:mb-12
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
                bg-blue-50
                ring-1
                ring-blue-100
              "
            >
              <FiAward
                className="
                  text-2xl
                  text-blue-600
                "
              />
            </div>


            <h2
              className="
                mb-3
                text-2xl
                font-bold
                tracking-tight
                text-gray-900

                sm:text-3xl

                lg:text-4xl
              "
            >
              Visi Kepemimpinan
            </h2>


            <p
              className="
                text-sm
                leading-7
                text-gray-500

                sm:text-base
              "
            >
              Membangun fondasi yang kuat untuk
              kemajuan organisasi dan pengembangan
              setiap anggota.
            </p>
          </div>


          {/* =========================================
              LISTS
          ========================================== */}

          <div
            className="
              grid
              grid-cols-1
              gap-8

              lg:grid-cols-2
              lg:gap-12
            "
          >
            <VisionList
              icon={
                <IoSparkles className="text-blue-500" />
              }
              title="Misi Kami"
              items={
                missions
              }
              dotClassName="bg-blue-500"
            />


            <VisionList
              icon={
                <FaCrow className="text-indigo-500" />
              }
              title="Komitmen Kami"
              items={
                commitments
              }
              dotClassName="bg-indigo-500"
            />
          </div>


          {/* =========================================
              QUOTE
          ========================================== */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            whileInView={{
              opacity: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.6,
              delay: 0.15,
            }}
            className="
              mt-10
              border-t
              border-gray-100
              pt-8
              text-center

              sm:mt-12
            "
          >
            <p
              className="
                mx-auto
                max-w-2xl
                text-sm
                italic
                leading-7
                text-gray-500

                sm:text-base
              "
            >
              &ldquo;Kepemimpinan bukan tentang
              posisi, tetapi tentang tindakan dan
              pengaruh positif yang kita berikan
              kepada orang lain.&rdquo;
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


// =========================================================
// VISION LIST
// =========================================================

function VisionList({
  icon,
  title,
  items,
  dotClassName,
}: {
  icon: ReactNode;

  title: string;

  items: string[];

  dotClassName: string;
}) {
  return (
    <div>
      <h3
        className="
          mb-5
          flex
          items-center
          gap-3
          text-lg
          font-bold
          text-gray-900

          sm:text-xl
        "
      >
        {icon}

        {title}
      </h3>


      <ul
        className="
          space-y-4
        "
      >
        {items.map(
          (
            item,
            index,
          ) => (
            <li
              key={`${item}-${index}`}
              className="
                flex
                items-start
                gap-3
              "
            >
              <span
                className={`
                  mt-[9px]
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full

                  ${dotClassName}
                `}
              />


              <span
                className="
                  text-sm
                  leading-6
                  text-gray-600

                  sm:text-base
                  sm:leading-7
                "
              >
                {item}
              </span>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
"use client";

import { membersCollection } from "@/lib/firebase";

import { getDocs, query, where } from "firebase/firestore";

import { motion, useReducedMotion } from "framer-motion";

import Image from "next/image";

import { type ReactNode, useEffect, useState } from "react";

import { FiAward, FiGithub, FiHeart, FiInstagram, FiMail, FiUsers } from "react-icons/fi";

import { IoPeopleCircleOutline, IoRibbonOutline, IoSparkles } from "react-icons/io5";

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

  skills?: string[];
  talents?: string[];
}

// =========================================================
// PAGE
// =========================================================

export default function MinatBakatPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        /*
         * Hanya mengambil anggota
         * divisi Minat & Bakat.
         *
         * Nilai "Minat&Bakat" mengikuti
         * data Firestore pada project lama.
         */
        const membersQuery = query(membersCollection, where("division", "==", "Minat&Bakat"));

        const snapshot = await getDocs(membersQuery);

        const minatBakatMembers = snapshot.docs.map(
          (document) =>
            ({
              id: document.id,
              ...document.data(),
            }) as Member,
        );

        /*
         * Koordinator selalu ditampilkan
         * pada urutan pertama.
         *
         * Anggota lainnya diurutkan
         * berdasarkan nama.
         */
        const sortedMembers = minatBakatMembers.sort((a, b) => {
          const aIsCoordinator = a.position === "Koordinator";

          const bIsCoordinator = b.position === "Koordinator";

          if (aIsCoordinator && !bIsCoordinator) {
            return -1;
          }

          if (!aIsCoordinator && bIsCoordinator) {
            return 1;
          }

          return a.name.localeCompare(b.name, "id");
        });

        if (isMounted) {
          setMembers(sortedMembers);
        }
      } catch (err) {
        console.error("Error fetching members:", err);

        if (isMounted) {
          setError("Gagal memuat data divisi minat & bakat");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      <BackgroundElements />

      <div className="relative z-10">
        <HeroSection />

        <TeamSection members={members} />

        <DivisionInfoSection />
      </div>
    </main>
  );
}

// =========================================================
// BACKGROUND
// =========================================================

function BackgroundElements() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="
        pointer-events-none
        fixed
        inset-0
        overflow-hidden
      "
      aria-hidden="true"
    >
      {/* Top Gradient */}
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-[420px]
          bg-gradient-to-br
          from-pink-50/50
          via-white/30
          to-rose-50/30
        "
      />

      {/* Bottom Gradient */}
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

      {/* Grid Pattern */}
      <div
        className="
          absolute
          inset-0
          opacity-[0.14]
          bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2U1ZTVlNSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]
        "
      />

      {/* Floating Shape */}
      <motion.div
        className="
          absolute
          left-[8%]
          top-[24%]
          hidden
          h-72
          w-72
          rounded-full
          bg-pink-200/10
          blur-3xl
          md:block
          lg:h-96
          lg:w-96
        "
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 16, 0],
                y: [0, -16, 0],
              }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : {
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />

      <motion.div
        className="
          absolute
          bottom-[18%]
          right-[8%]
          hidden
          h-64
          w-64
          rounded-full
          bg-rose-200/10
          blur-3xl
          md:block
          lg:h-80
          lg:w-80
        "
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, -12, 0],
                y: [0, 12, 0],
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
// LOADING
// =========================================================

function LoadingScreen() {
  return (
    <main
      aria-busy="true"
      aria-label="Memuat data divisi Minat & Bakat HMPTI"
      className="relative min-h-screen overflow-hidden bg-white"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-br from-pink-50/50 via-white to-rose-50/30" />
        <div className="absolute inset-0 opacity-[0.10] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2U1ZTVlNSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]" />
        <div className="absolute -left-32 top-32 hidden h-80 w-80 rounded-full bg-pink-100/40 blur-3xl md:block" />
        <div className="absolute -right-24 top-[430px] hidden h-80 w-80 rounded-full bg-rose-100/30 blur-3xl md:block" />
      </div>

      <div className="relative z-10">
        <section className="px-4 pb-10 pt-28 sm:px-6 sm:pb-14 sm:pt-32 lg:px-8 lg:pb-16 lg:pt-36">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <SkeletonBlock className="h-9 w-44 rounded-full sm:w-52" />
            <SkeletonBlock className="mt-6 h-10 w-[42%] max-w-[190px] rounded-xl sm:h-12 sm:max-w-[220px] lg:h-14 lg:max-w-[250px]" />
            <SkeletonBlock className="mt-3 h-10 w-[60%] max-w-[300px] rounded-xl sm:h-12 sm:max-w-[360px] lg:h-14 lg:max-w-[410px]" />
            <div className="mt-6 flex w-full max-w-2xl flex-col items-center gap-2.5">
              <SkeletonBlock className="h-4 w-[90%] rounded-full" />
              <SkeletonBlock className="h-4 w-[68%] rounded-full" />
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <LoadingSectionHeading titleWidth="w-56 sm:w-64" />

            <div className="mx-auto max-w-4xl">
              <CoordinatorCardSkeleton />
            </div>

            <div className="mt-16 sm:mt-20">
              <LoadingSectionHeading titleWidth="w-48 sm:w-56" />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                <RegularMemberSkeleton />
                <RegularMemberSkeleton />
                <RegularMemberSkeleton />
                <RegularMemberSkeleton />
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/85 px-4 py-2 shadow-sm backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-pink-500 motion-safe:animate-pulse" />
                <span className="text-xs font-medium text-gray-500 sm:text-sm">Menyiapkan data Minat & Bakat</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function LoadingSectionHeading({ titleWidth }: { titleWidth: string }) {
  return (
    <div className="mx-auto mb-8 flex max-w-2xl flex-col items-center sm:mb-10">
      <SkeletonBlock className={`h-8 rounded-lg sm:h-9 ${titleWidth}`} />
      <SkeletonBlock className="mt-4 h-4 w-[85%] rounded-full" />
      <SkeletonBlock className="mt-2 h-4 w-[60%] rounded-full" />
    </div>
  );
}

function CoordinatorCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[310px_minmax(0,1fr)]">
        <SkeletonBlock className="aspect-[4/5] w-full rounded-none sm:aspect-[5/4] md:aspect-auto md:min-h-[360px]" />
        <div className="flex flex-col justify-center p-5 sm:p-7 md:p-8 lg:p-10">
          <SkeletonBlock className="h-7 w-28 rounded-full" />
          <SkeletonBlock className="mt-5 h-8 w-[60%] rounded-lg sm:h-9" />
          <SkeletonBlock className="mt-3 h-4 w-28 rounded-full" />
          <div className="mt-6 space-y-2">
            <SkeletonBlock className="h-4 w-full rounded-full" />
            <SkeletonBlock className="h-4 w-[92%] rounded-full" />
            <SkeletonBlock className="h-4 w-[70%] rounded-full" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <SkeletonBlock className="h-7 w-20 rounded-full" />
            <SkeletonBlock className="h-7 w-24 rounded-full" />
            <SkeletonBlock className="h-7 w-16 rounded-full" />
          </div>
          <div className="mt-7 flex gap-2.5">
            <SkeletonBlock className="h-10 w-10 rounded-xl" />
            <SkeletonBlock className="h-10 w-10 rounded-xl" />
            <SkeletonBlock className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function RegularMemberSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <SkeletonBlock className="aspect-[4/5] w-full rounded-none" />
      <div className="p-5">
        <SkeletonBlock className="h-6 w-[72%] rounded-lg" />
        <SkeletonBlock className="mt-3 h-4 w-28 rounded-full" />
        <div className="mt-4 flex flex-wrap gap-1.5">
          <SkeletonBlock className="h-6 w-16 rounded-full" />
          <SkeletonBlock className="h-6 w-20 rounded-full" />
          <SkeletonBlock className="h-6 w-14 rounded-full" />
        </div>
        <div className="mt-5 flex gap-2.5">
          <SkeletonBlock className="h-10 w-10 rounded-xl" />
          <SkeletonBlock className="h-10 w-10 rounded-xl" />
          <SkeletonBlock className="h-10 w-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-gradient-to-r from-gray-100 via-gray-200/70 to-gray-100 motion-safe:animate-pulse ${className}`}
    />
  );
}

// =========================================================
// ERROR
// =========================================================

function ErrorScreen({ error }: { error: string }) {
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
          <IoPeopleCircleOutline className="text-2xl text-red-500" />
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
          onClick={() => window.location.reload()}
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
            border-pink-100
            bg-pink-50/80
            px-4
            py-2
            backdrop-blur-sm
            sm:mb-7
          "
        >
          <IoRibbonOutline className="text-pink-600" />

          <span
            className="
              text-xs
              font-semibold
              text-pink-700
              sm:text-sm
            "
          >
            Divisi Minat & Bakat
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
            mb-5
            text-4xl
            font-bold
            tracking-tight
            text-gray-900
            sm:text-5xl
            lg:text-6xl
          "
        >
          Tim
          <span
            className="
              block
              bg-gradient-to-r
              from-pink-600
              to-rose-500
              bg-clip-text
              text-transparent
            "
          >
            Minat & Bakat
          </span>
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
            max-w-2xl
            text-sm
            leading-7
            text-gray-500
            sm:text-base
            md:text-lg
            md:leading-8
          "
        >
          Mengembangkan potensi dan bakat anggota melalui berbagai kegiatan kreatif dan inovatif.
        </motion.p>
      </div>
    </section>
  );
}

// =========================================================
// TEAM
// =========================================================

function TeamSection({ members }: { members: Member[] }) {
  const coordinators = members.filter((member) => member.position === "Koordinator");

  const regularMembers = members.filter((member) => member.position !== "Koordinator");

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
      <div className="mx-auto max-w-6xl">
        {/* Coordinator */}
        {coordinators.length > 0 && (
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
              mb-16
              sm:mb-20
            "
          >
            <SectionHeading title="Koordinator Minat & Bakat" description="Pemimpin yang menginspirasi dan mengembangkan bakat serta minat anggota organisasi." />

            <div
              className="
                mx-auto
                flex
                max-w-4xl
                flex-col
                gap-6
              "
            >
              {coordinators.map((member, index) => (
                <CoordinatorCard key={member.id} member={member} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Members */}
        {regularMembers.length > 0 && (
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
          >
            <SectionHeading title="Anggota Minat & Bakat" description="Tim yang penuh semangat dalam menggali dan mengembangkan potensi setiap individu." />

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
              {regularMembers.map((member, index) => (
                <RegularMemberCard key={member.id} member={member} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty */}
        {members.length === 0 && (
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
              <IoPeopleCircleOutline className="text-3xl text-gray-400" />
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
              Belum Ada Anggota
            </h3>

            <p
              className="
                mx-auto
                max-w-md
                text-sm
                leading-6
                text-gray-500
                sm:text-base
              "
            >
              Data anggota divisi minat & bakat akan segera tersedia.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// =========================================================
// SECTION HEADING
// =========================================================

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div
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
        {title}
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
        {description}
      </p>
    </div>
  );
}

// =========================================================
// COORDINATOR
// =========================================================

function CoordinatorCard({ member, index }: { member: Member; index: number }) {
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
        delay: index * 0.08,
      }}
      className="
        group
        overflow-hidden
        rounded-3xl
        border
        border-gray-100
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-xl
        hover:shadow-gray-200/60
      "
    >
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-[280px_minmax(0,1fr)]
          lg:grid-cols-[310px_minmax(0,1fr)]
        "
      >
        <MemberImage member={member} type="coordinator" />

        <div
          className="
            flex
            min-w-0
            flex-col
            justify-center
            p-5
            sm:p-7
            md:p-8
            lg:p-10
          "
        >
          <div
            className="
              mb-4
              inline-flex
              w-fit
              items-center
              rounded-full
              bg-pink-50
              px-3
              py-1.5
              text-xs
              font-semibold
              text-pink-700
              ring-1
              ring-inset
              ring-pink-100
            "
          >
            Koordinator
          </div>

          <h3
            className="
              break-words
              text-2xl
              font-bold
              tracking-tight
              text-gray-900
              sm:text-3xl
            "
          >
            {member.name}
          </h3>

          <p
            className="
              mt-2
              text-sm
              font-medium
              text-gray-500
              sm:text-base
            "
          >
            NIM: {member.nim}
          </p>

          {member.bio && (
            <p
              className="
                mt-5
                max-w-xl
                text-sm
                leading-7
                text-gray-500
                sm:text-base
              "
            >
              {member.bio}
            </p>
          )}

          {member.talents && member.talents.length > 0 && (
            <div className="mt-5">
              <Talents talents={member.talents} />
            </div>
          )}

          <div className="mt-6">
            <SocialLinks member={member} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// =========================================================
// REGULAR MEMBER
// =========================================================

function RegularMemberCard({ member, index }: { member: Member; index: number }) {
  return (
    <motion.article
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
        delay: Math.min(index * 0.06, 0.3),
      }}
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-gray-100
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        hover:shadow-gray-200/60
      "
    >
      <MemberImage member={member} type="regular" />

      <div className="p-5">
        <h3
          className="
            line-clamp-2
            text-lg
            font-bold
            leading-snug
            text-gray-900
          "
        >
          {member.name}
        </h3>

        <p
          className="
            mt-1.5
            text-sm
            text-gray-500
          "
        >
          NIM: {member.nim}
        </p>

        {member.talents && member.talents.length > 0 && (
          <div className="mt-4">
            <Talents talents={member.talents} />
          </div>
        )}

        <div className="mt-4">
          <SocialLinks member={member} />
        </div>
      </div>
    </motion.article>
  );
}

// =========================================================
// MEMBER IMAGE
// =========================================================

function MemberImage({ member, type }: { member: Member; type: "coordinator" | "regular" }) {
  const isCoordinator = type === "coordinator";

  return (
    <div
      className={
        isCoordinator
          ? `
            relative
            aspect-[4/5]
            overflow-hidden
            bg-gray-100
            sm:aspect-[5/4]
            md:aspect-auto
            md:min-h-[360px]
          `
          : `
            relative
            aspect-[4/5]
            overflow-hidden
            bg-gray-100
          `
      }
    >
      {member.imageUrl ? (
        <Image
          src={member.imageUrl}
          alt={`Foto ${member.name}`}
          fill
          sizes={isCoordinator ? "(max-width: 767px) 92vw, (max-width: 1023px) 280px, 310px" : "(max-width: 639px) 92vw, (max-width: 1023px) 46vw, (max-width: 1279px) 30vw, 260px"}
          className="
            object-cover
            object-center
            transition-transform
            duration-500
            ease-out
            group-hover:scale-[1.025]
          "
        />
      ) : (
        <MemberImagePlaceholder name={member.name} />
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
// IMAGE PLACEHOLDER
// =========================================================

function MemberImagePlaceholder({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
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
        from-pink-50
        to-rose-100
      "
    >
      <span
        className="
          text-4xl
          font-bold
          text-pink-600/70
        "
      >
        {initials || "HM"}
      </span>
    </div>
  );
}

// =========================================================
// TALENTS
// =========================================================

function Talents({ talents }: { talents: string[] }) {
  const visibleTalents = talents.slice(0, 3);

  const remainingTalents = talents.length - visibleTalents.length;

  return (
    <div
      className="
        flex
        flex-wrap
        gap-1.5
      "
    >
      {visibleTalents.map((talent, index) => (
        <span
          key={`${talent}-${index}`}
          className="
              rounded-full
              bg-pink-50
              px-2.5
              py-1
              text-xs
              font-medium
              text-pink-700
              ring-1
              ring-inset
              ring-pink-100
            "
        >
          {talent}
        </span>
      ))}

      {remainingTalents > 0 && (
        <span
          className="
            rounded-full
            bg-gray-100
            px-2.5
            py-1
            text-xs
            font-medium
            text-gray-600
          "
        >
          +{remainingTalents}
        </span>
      )}
    </div>
  );
}

// =========================================================
// SOCIAL LINKS
// =========================================================

function SocialLinks({ member }: { member: Member }) {
  const hasSocialLinks = member.linkInstagram || member.linkGithub || member.email;

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
      {member.linkInstagram && (
        <a
          href={member.linkInstagram}
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

      {member.linkGithub && (
        <a
          href={member.linkGithub}
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
// DIVISION INFO
// =========================================================

function DivisionInfoSection() {
  const responsibilities = [
    "Mengidentifikasi dan mengembangkan bakat anggota",
    "Menyelenggarakan workshop dan pelatihan pengembangan diri",
    "Mengadakan kompetisi dan event untuk menampung bakat",
    "Membina hubungan dengan eksternal untuk pengembangan minat",
  ];

  const skills = [
    "Kemampuan mentoring dan coaching",
    "Kreativitas dalam merancang program pengembangan",
    "Kemampuan komunikasi dan interpersonal yang baik",
    "Penguasaan berbagai bidang minat dan bakat",
  ];

  const fields = [
    {
      name: "Seni",
      className: "bg-pink-50 text-pink-700 ring-pink-100",
    },
    {
      name: "Olahraga",
      className: "bg-blue-50 text-blue-700 ring-blue-100",
    },
    {
      name: "Musik",
      className: "bg-purple-50 text-purple-700 ring-purple-100",
    },
    {
      name: "Menulis",
      className: "bg-green-50 text-green-700 ring-green-100",
    },
    {
      name: "Public Speaking",
      className: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    },
    {
      name: "Leadership",
      className: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    },
    {
      name: "Debat",
      className: "bg-red-50 text-red-700 ring-red-100",
    },
    {
      name: "Robotika",
      className: "bg-gray-100 text-gray-700 ring-gray-200",
    },
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
      <div className="mx-auto max-w-5xl">
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
          {/* Heading */}
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
                bg-pink-50
                ring-1
                ring-pink-100
              "
            >
              <FiHeart className="text-2xl text-pink-600" />
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
              Tugas Divisi Minat & Bakat
            </h2>

            <p
              className="
                text-sm
                leading-7
                text-gray-500
                sm:text-base
              "
            >
              Bertanggung jawab dalam mengembangkan potensi, minat, dan bakat anggota organisasi.
            </p>
          </div>

          {/* Main Info */}
          <div
            className="
              grid
              grid-cols-1
              gap-8
              lg:grid-cols-2
              lg:gap-12
            "
          >
            <DivisionInfoList icon={<IoSparkles className="text-pink-500" />} title="Tanggung Jawab Utama" items={responsibilities} dotClassName="bg-pink-500" />

            <DivisionInfoList icon={<FiAward className="text-rose-500" />} title="Keahlian yang Dibutuhkan" items={skills} dotClassName="bg-rose-500" />
          </div>

          {/* Fields */}
          <div
            className="
              mt-10
              border-t
              border-gray-100
              pt-8
              sm:mt-12
              sm:pt-10
            "
          >
            <h3
              className="
                mb-6
                flex
                items-center
                gap-3
                text-lg
                font-bold
                text-gray-900
                sm:text-xl
              "
            >
              <FiUsers className="text-pink-500" />
              Bidang Minat & Bakat
            </h3>

            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-4
                sm:gap-4
              "
            >
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={`
                      rounded-xl
                      px-3
                      py-3
                      text-center
                      text-xs
                      font-semibold
                      ring-1
                      ring-inset
                      sm:text-sm
                      ${field.className}
                    `}
                >
                  {field.name}
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
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
              &ldquo;Setiap orang memiliki bakat terpendam, tugas kami adalah membantu menemukan dan mengembangkannya.&rdquo;
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// =========================================================
// DIVISION INFO LIST
// =========================================================

function DivisionInfoList({ icon, title, items, dotClassName }: { icon: ReactNode; title: string; items: string[]; dotClassName: string }) {
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

      <ul className="space-y-4">
        {items.map((item, index) => (
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
        ))}
      </ul>
    </div>
  );
}
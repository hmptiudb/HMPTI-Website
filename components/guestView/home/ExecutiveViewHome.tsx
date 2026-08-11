"use client";

import { membersCollection } from "@/lib/firebase";

import { getDocs, query, where } from "firebase/firestore";

import { MotionConfig, motion } from "framer-motion";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

import { FiArrowRight, FiGithub, FiInstagram, FiMail, FiRefreshCw, FiUsers } from "react-icons/fi";

import { IoPeopleCircleOutline } from "react-icons/io5";

// =========================================================
// TYPES
// =========================================================

interface Member {
  id: string;

  nim?: string;

  name: string;

  division?: string;

  position?: string;

  imageUrl?: string;

  status?: string;

  linkInstagram?: string;

  linkGithub?: string;

  email?: string;
}

// =========================================================
// CONSTANTS
// =========================================================

const DIVISION_ORDER = ["Ketua", "Wakil", "Sekretaris", "Bendahara", "Humas", "Kominfo", "Riset&Teknologi", "Minat&Bakat"];

const EXECUTIVE_POSITIONS = [
  "Ketua",
  "Wakil Ketua",
  "Koordinator",

  /**
   * Posisi legacy.
   *
   * Admin Member terbaru menggunakan
   * Koordinator untuk Sekretaris dan
   * Bendahara, tetapi data lama mungkin
   * masih memakai posisi berikut.
   */
  "Sekretaris",
  "Bendahara",
];

// =========================================================
// DIVISION CONFIG
// =========================================================

const DIVISION_CONFIG: Record<
  string,
  {
    label: string;

    accent: string;

    badge: string;
  }
> = {
  Ketua: {
    label: "Ketua",

    accent: "from-blue-600 to-blue-400",

    badge: "border-blue-100 bg-blue-50 text-blue-700",
  },

  Wakil: {
    label: "Wakil Ketua",

    accent: "from-indigo-600 to-indigo-400",

    badge: "border-indigo-100 bg-indigo-50 text-indigo-700",
  },

  Sekretaris: {
    label: "Sekretaris",

    accent: "from-emerald-600 to-emerald-400",

    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },

  Bendahara: {
    label: "Bendahara",

    accent: "from-green-600 to-green-400",

    badge: "border-green-100 bg-green-50 text-green-700",
  },

  Humas: {
    label: "Humas",

    accent: "from-teal-600 to-cyan-400",

    badge: "border-teal-100 bg-teal-50 text-teal-700",
  },

  Kominfo: {
    label: "Kominfo",

    accent: "from-amber-500 to-orange-400",

    badge: "border-amber-100 bg-amber-50 text-amber-700",
  },

  "Riset&Teknologi": {
    label: "Riset & Teknologi",

    accent: "from-purple-600 to-violet-400",

    badge: "border-purple-100 bg-purple-50 text-purple-700",
  },

  "Minat&Bakat": {
    label: "Minat & Bakat",

    accent: "from-pink-600 to-rose-400",

    badge: "border-pink-100 bg-pink-50 text-pink-700",
  },
};

// =========================================================
// HELPERS
// =========================================================

function getDivisionLabel(division?: string) {
  if (!division) {
    return "HMPTI";
  }

  return DIVISION_CONFIG[division]?.label ?? division;
}

function getDivisionAccent(division?: string) {
  if (!division) {
    return "from-gray-500 to-gray-300";
  }

  return DIVISION_CONFIG[division]?.accent ?? "from-gray-500 to-gray-300";
}

function getDivisionBadge(division?: string) {
  if (!division) {
    return "border-gray-200 bg-gray-50 text-gray-600";
  }

  return DIVISION_CONFIG[division]?.badge ?? "border-gray-200 bg-gray-50 text-gray-600";
}

// =========================================================
// EXECUTIVE FILTER
// =========================================================

function isExecutiveMember(member: Member) {
  const division = member.division ?? "";

  const position = member.position ?? "";

  if (!DIVISION_ORDER.includes(division)) {
    return false;
  }

  /**
   * Jangan tampilkan anggota yang
   * secara eksplisit dinonaktifkan.
   *
   * Status kosong tetap diterima agar
   * data legacy tidak hilang.
   */
  if (member.status === "Tidak Aktif") {
    return false;
  }

  // =======================================================
  // KETUA
  // =======================================================

  if (division === "Ketua") {
    return position === "Ketua";
  }

  // =======================================================
  // WAKIL
  // =======================================================

  if (division === "Wakil") {
    return position === "Wakil Ketua";
  }

  // =======================================================
  // DIVISI LAIN
  // =======================================================

  if (position === "Koordinator") {
    return true;
  }

  /**
   * Compatibility dengan data lama.
   */
  if (division === "Sekretaris" && position === "Sekretaris") {
    return true;
  }

  if (division === "Bendahara" && position === "Bendahara") {
    return true;
  }

  return false;
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function ExecutiveViewHome() {
  const [members, setMembers] = useState<Member[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [retryKey, setRetryKey] = useState(0);

  // =======================================================
  // FETCH MEMBERS
  // =======================================================

  useEffect(() => {
    let active = true;

    const fetchMembers = async () => {
      try {
        setLoading(true);

        setError(null);

        /**
         * Kita tidak mengambil seluruh
         * collection members.
         *
         * Hanya posisi yang berpotensi
         * ditampilkan pada Pengurus Inti.
         */
        const executiveQuery = query(
          membersCollection,

          where("position", "in", EXECUTIVE_POSITIONS),
        );

        const snapshot = await getDocs(executiveQuery);

        const result = snapshot.docs
          .map(
            (document) =>
              ({
                id: document.id,

                ...document.data(),
              }) as Member,
          )
          .filter(isExecutiveMember)
          .sort((a, b) => {
            const divisionA = DIVISION_ORDER.indexOf(a.division ?? "");

            const divisionB = DIVISION_ORDER.indexOf(b.division ?? "");

            if (divisionA !== divisionB) {
              return divisionA - divisionB;
            }

            return a.name.localeCompare(b.name, "id");
          });

        if (!active) {
          return;
        }

        setMembers(result);
      } catch (fetchError) {
        console.error("Error fetching executive members:", fetchError);

        if (!active) {
          return;
        }

        setError("Data pengurus belum dapat dimuat. Silakan coba kembali.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchMembers();

    return () => {
      active = false;
    };
  }, [retryKey]);

  // =======================================================
  // SUMMARY
  // =======================================================

  const divisionCount = useMemo(() => {
    return new Set(members.map((member) => member.division).filter(Boolean)).size;
  }, [members]);

  // =======================================================
  // RENDER
  // =======================================================

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
              <IoPeopleCircleOutline
                className="
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
                Tim Pengurus
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
              Pengurus Inti{" "}
              <span
                className="
                  bg-gradient-to-r
                  from-blue-600
                  to-cyan-500
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
                mt-4
                max-w-2xl
                text-sm
                leading-7
                text-gray-600

                sm:text-base

                md:text-lg
              "
            >
              Pengurus yang bekerja bersama untuk menjalankan, mengembangkan, dan membawa HMPTI Universitas Duta Bangsa terus bertumbuh.
            </p>

            {!loading && !error && members.length > 0 && (
              <div
                className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-gray-200
                    bg-white/80
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-gray-500
                    shadow-sm
                  "
              >
                <FiUsers
                  className="
                      text-blue-500
                    "
                />
                {members.length} pengurus dari {divisionCount} bagian
              </div>
            )}
          </motion.div>

          {/* =======================================
              LOADING
          ======================================== */}

          {loading && <ExecutiveSkeleton />}

          {/* =======================================
              ERROR
          ======================================== */}

          {!loading && error && <ExecutiveError message={error} onRetry={() => setRetryKey((current) => current + 1)} />}

          {/* =======================================
              MEMBERS
          ======================================== */}

          {!loading && !error && members.length > 0 && (
            <>
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
                {members.map((member, index) => (
                  <MemberCard key={member.id} member={member} index={index} />
                ))}
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
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.5,
                }}
                className="
                    mt-10
                    flex
                    justify-center

                    sm:mt-12
                  "
              >
                <Link
                  href="/pages/fungsionaris"
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
                  Lihat Semua Fungsionaris
                  <FiArrowRight
                    className="
                        transition-transform

                        group-hover:translate-x-1
                      "
                  />
                </Link>
              </motion.div>
            </>
          )}

          {/* =======================================
              EMPTY
          ======================================== */}

          {!loading && !error && members.length === 0 && <ExecutiveEmpty />}
        </div>
      </section>
    </MotionConfig>
  );
}

// =========================================================
// MEMBER CARD
// =========================================================

function MemberCard({
  member,
  index,
}: {
  member: Member;

  index: number;
}) {
  const divisionLabel = getDivisionLabel(member.division);

  const hasSocialLinks = Boolean(member.linkInstagram || member.linkGithub || member.email);

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

        delay: Math.min(index * 0.05, 0.25),
      }}
      className="
        group
        h-full
      "
    >
      <div
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
            DIVISION ACCENT
        ========================================== */}

        <div
          className={`
            h-1
            w-full
            bg-gradient-to-r

            ${getDivisionAccent(member.division)}
          `}
        />

        {/* =========================================
            PHOTO
        ========================================== */}

        <div
          className="
            relative
            aspect-[4/5]
            overflow-hidden
            bg-gray-100
          "
        >
          {member.imageUrl ? (
            <Image
              src={member.imageUrl}
              alt={`Foto ${member.name}`}
              fill
              sizes="
                (max-width: 639px) 92vw,
                (max-width: 1023px) 46vw,
                (max-width: 1279px) 31vw,
                285px
              "
              className="
                object-cover
                object-center
                transition-transform
                duration-500

                group-hover:scale-[1.025]
              "
            />
          ) : (
            <MemberImageFallback name={member.name} />
          )}

          {/* =======================================
              IMAGE GRADIENT
          ======================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-gray-950/45
              via-transparent
              to-transparent
            "
          />

          {/* =======================================
              DIVISION BADGE
          ======================================== */}

          <div
            className="
              absolute
              left-3
              top-3
            "
          >
            <span
              className={`
                inline-flex
                rounded-full
                border
                px-2.5
                py-1
                text-[11px]
                font-semibold
                shadow-sm
                backdrop-blur-sm

                ${getDivisionBadge(member.division)}
              `}
            >
              {divisionLabel}
            </span>
          </div>

          {/* =======================================
              NAME ON IMAGE
          ======================================== */}

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              p-4
            "
          >
            <h3
              className="
                line-clamp-2
                text-xl
                font-bold
                leading-tight
                text-white
              "
            >
              {member.name}
            </h3>
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
          {/* POSITION */}

          <div>
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-gray-400
              "
            >
              Jabatan
            </p>

            <h4
              className="
                mt-1
                text-base
                font-bold
                text-gray-900
              "
            >
              {member.position ?? divisionLabel}
            </h4>

            {member.nim && (
              <p
                className="
                  mt-2
                  text-xs
                  text-gray-400
                "
              >
                NIM {member.nim}
              </p>
            )}
          </div>

          {/* =======================================
              SOCIAL LINKS
          ======================================== */}

          <div
            className="
              mt-auto
              pt-5
            "
          >
            <div
              className="
                border-t
                border-gray-100
                pt-4
              "
            >
              {hasSocialLinks ? (
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  {member.linkInstagram && (
                    <SocialLink href={member.linkInstagram} label={`Instagram ${member.name}`}>
                      <FiInstagram />
                    </SocialLink>
                  )}

                  {member.linkGithub && (
                    <SocialLink href={member.linkGithub} label={`GitHub ${member.name}`}>
                      <FiGithub />
                    </SocialLink>
                  )}

                  {member.email && (
                    <SocialLink href={`mailto:${member.email}`} label={`Email ${member.name}`} external={false}>
                      <FiMail />
                    </SocialLink>
                  )}
                </div>
              ) : (
                <p
                  className="
                    text-xs
                    text-gray-400
                  "
                >
                  Pengurus HMPTI
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// =========================================================
// SOCIAL LINK
// =========================================================

function SocialLink({
  href,
  label,
  children,
  external = true,
}: {
  href: string;

  label: string;

  children: React.ReactNode;

  external?: boolean;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      {...(external
        ? {
            target: "_blank",

            rel: "noopener noreferrer",
          }
        : {})}
      className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-xl
        border
        border-gray-200
        bg-white
        text-gray-500
        transition-all

        hover:border-blue-200
        hover:bg-blue-50
        hover:text-blue-600
      "
    >
      {children}
    </a>
  );
}

// =========================================================
// MEMBER IMAGE FALLBACK
// =========================================================

function MemberImageFallback({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
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
          text-3xl
          font-bold
          text-blue-300
        "
      >
        {initials || "H"}
      </span>
    </div>
  );
}

// =========================================================
// LOADING SKELETON
// =========================================================

function ExecutiveSkeleton() {
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
        length: 8,
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
                aspect-[4/5]
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
                  h-3
                  w-16
                  animate-pulse
                  rounded
                  bg-gray-100
                "
            />

            <div
              className="
                  h-5
                  w-2/3
                  animate-pulse
                  rounded
                  bg-gray-200
                "
            />

            <div
              className="
                  h-3
                  w-1/3
                  animate-pulse
                  rounded
                  bg-gray-100
                "
            />

            <div
              className="
                  mt-5
                  h-10
                  animate-pulse
                  rounded-xl
                  bg-gray-50
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

function ExecutiveError({
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
        <FiUsers className="text-xl" />
      </div>

      <h3
        className="
          mt-4
          text-lg
          font-bold
          text-gray-900
        "
      >
        Data Pengurus Gagal Dimuat
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

function ExecutiveEmpty() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
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
        <IoPeopleCircleOutline className="text-3xl" />
      </div>

      <h3
        className="
          mt-4
          text-lg
          font-bold
          text-gray-900
        "
      >
        Pengurus Belum Tersedia
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-gray-500
        "
      >
        Data pengurus inti HMPTI akan ditampilkan di bagian ini setelah tersedia.
      </p>
    </motion.div>
  );
}

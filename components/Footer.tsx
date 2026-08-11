"use client";

import Image from "next/image";
import Link from "next/link";

import { usePathname } from "next/navigation";

import { FiArrowUpRight, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

// =========================================================
// NAVIGATION
// =========================================================

const QUICK_LINKS = [
  {
    name: "Beranda",
    path: "/",
  },
  {
    name: "Event",
    path: "/pages/event",
  },
  {
    name: "Fungsionaris",
    path: "/pages/fungsionaris",
  },
  {
    name: "Berita",
    path: "/pages/news",
  },
];

const DIVISION_LINKS = [
  {
    name: "Ketua & Wakil",
    path: "/pages/fungsionaris/ketua-wakil",
  },
  {
    name: "Sekretaris",
    path: "/pages/fungsionaris/sekretaris",
  },
  {
    name: "Bendahara",
    path: "/pages/fungsionaris/bendahara",
  },
  {
    name: "Humas",
    path: "/pages/fungsionaris/humas",
  },
  {
    name: "Kominfo",
    path: "/pages/fungsionaris/kominfo",
  },
  {
    name: "Riset & Teknologi",
    path: "/pages/fungsionaris/riset-dan-teknologi",
  },
  {
    name: "Minat & Bakat",
    path: "/pages/fungsionaris/minat-dan-bakat",
  },
];

// =========================================================
// CONTACT
// =========================================================

const PHONE = "(0271) 2256-8420";

const PHONE_HREF = "tel:+6227122568420";

const EMAIL = "hmpti@udb.ac.id";

const ADDRESS = "Jl. Bromo VII, Gebang RT 02/RW 16, Banjarsari, Surakarta, Jawa Tengah 57136";

const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

// =========================================================
// COMPONENT
// =========================================================

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="
        relative
        overflow-hidden
        bg-[#0f172a]
        text-white
      "
    >
      {/* =========================================
          DECORATION
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
            -left-32
            top-0
            h-80
            w-80
            rounded-full
            bg-blue-600/10
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -right-32
            bottom-0
            h-96
            w-96
            rounded-full
            bg-indigo-600/10
            blur-3xl
          "
        />
      </div>

      {/* =========================================
          MAIN FOOTER
      ========================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-4
          pb-10
          pt-14

          sm:px-6
          sm:pb-12
          sm:pt-16

          lg:px-8
          lg:pb-14
          lg:pt-20
        "
      >
        <div
          className="
            grid
            grid-cols-1
            gap-10

            sm:grid-cols-2

            lg:grid-cols-[1.4fr_0.8fr_1fr_1.2fr]
            lg:gap-12
          "
        >
          {/* =====================================
              BRAND
          ====================================== */}

          <div>
            <Link
              href="/"
              aria-label="HMPTI Universitas Duta Bangsa"
              className="
                inline-flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  relative
                  h-12
                  w-12
                  shrink-0
                  rounded-xl
                  bg-white/10
                  p-1
                "
              >
                <Image
                  src="/assets/image/HMPTIlogo.png"
                  alt="Logo HMPTI"
                  fill
                  sizes="48px"
                  className="
                    object-contain
                    p-1
                  "
                />
              </div>

              <div>
                <p
                  className="
                    text-xl
                    font-extrabold
                    tracking-tight
                    text-white
                  "
                >
                  HMPTI UDB
                </p>

                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-blue-300
                  "
                >
                  Teknik Informatika
                </p>
              </div>
            </Link>

            <p
              className="
                mt-5
                max-w-sm
                text-sm
                leading-7
                text-slate-300
              "
            >
              Himpunan Mahasiswa Program Studi Teknik Informatika Universitas Duta Bangsa Surakarta sebagai wadah pengembangan, kolaborasi, dan inovasi mahasiswa.
            </p>

            <div
              className="
                mt-6
                inline-flex
                items-center
                rounded-full
                border
                border-white/10
                bg-white/5
                px-3
                py-1.5
                text-xs
                font-medium
                text-slate-300
              "
            >
              Informatics Community
            </div>
          </div>

          {/* =====================================
              QUICK LINKS
          ====================================== */}

          <FooterColumn title="Navigasi">
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="
                        group
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        text-slate-300
                        transition-colors

                        hover:text-white
                      "
                  >
                    <span
                      className="
                          h-1
                          w-1
                          rounded-full
                          bg-slate-600
                          transition-colors

                          group-hover:bg-blue-400
                        "
                    />

                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          {/* =====================================
              DIVISIONS
          ====================================== */}

          <FooterColumn title="Fungsionaris">
            <ul className="space-y-3">
              {DIVISION_LINKS.map((division) => (
                <li key={division.path}>
                  <Link
                    href={division.path}
                    className="
                        group
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        text-slate-300
                        transition-colors

                        hover:text-white
                      "
                  >
                    <span
                      className="
                          h-1
                          w-1
                          rounded-full
                          bg-slate-600
                          transition-colors

                          group-hover:bg-blue-400
                        "
                    />

                    {division.name}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          {/* =====================================
              CONTACT
          ====================================== */}

          <FooterColumn title="Hubungi Kami">
            <div className="space-y-4">
              <a
                href={PHONE_HREF}
                className="
                  group
                  flex
                  items-start
                  gap-3
                "
              >
                <ContactIcon>
                  <FiPhone />
                </ContactIcon>

                <div>
                  <p
                    className="
                      text-xs
                      font-medium
                      text-slate-500
                    "
                  >
                    Telepon
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-sm
                      leading-6
                      text-slate-300
                      transition-colors

                      group-hover:text-white
                    "
                  >
                    {PHONE}
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${EMAIL}`}
                className="
                  group
                  flex
                  items-start
                  gap-3
                "
              >
                <ContactIcon>
                  <FiMail />
                </ContactIcon>

                <div className="min-w-0">
                  <p
                    className="
                      text-xs
                      font-medium
                      text-slate-500
                    "
                  >
                    Email
                  </p>

                  <p
                    className="
                      mt-0.5
                      break-all
                      text-sm
                      leading-6
                      text-slate-300
                      transition-colors

                      group-hover:text-white
                    "
                  >
                    {EMAIL}
                  </p>
                </div>
              </a>

              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group
                  flex
                  items-start
                  gap-3
                "
              >
                <ContactIcon>
                  <FiMapPin />
                </ContactIcon>

                <div>
                  <p
                    className="
                      text-xs
                      font-medium
                      text-slate-500
                    "
                  >
                    Alamat
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-sm
                      leading-6
                      text-slate-300
                      transition-colors

                      group-hover:text-white
                    "
                  >
                    {ADDRESS}
                  </p>
                </div>
              </a>
            </div>
          </FooterColumn>
        </div>
      </div>

      {/* =========================================
          BOTTOM FOOTER
      ========================================== */}

      <div
        className="
          relative
          z-10
          border-t
          border-white/10
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            gap-4
            px-4
            py-5

            sm:px-6

            md:flex-row
            md:items-center
            md:justify-between

            lg:px-8
          "
        >
          <p
            className="
              text-center
              text-xs
              leading-5
              text-slate-500

              md:text-left
            "
          >
            © {currentYear} <span className="text-slate-300">HMPTI Universitas Duta Bangsa</span>. Seluruh hak cipta dilindungi.
          </p>

          <a
            href="https://nextylabs.id"
            target="_blank"
            rel="noopener noreferrer"
            className="
              group
              inline-flex
              items-center
              justify-center
              gap-1.5
              text-xs
              font-medium
              text-slate-500
              transition-colors

              hover:text-slate-300
            "
          >
            Developed by
            <span
              className="
                font-semibold
                text-blue-400

                group-hover:text-blue-300
              "
            >
              NEXTY LABS
            </span>
            <FiArrowUpRight
              className="
                text-[11px]
                transition-transform

                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
              "
            />
          </a>
        </div>
      </div>
    </footer>
  );
}

// =========================================================
// FOOTER COLUMN
// =========================================================

function FooterColumn({
  title,
  children,
}: {
  title: string;

  children: React.ReactNode;
}) {
  return (
    <div>
      <h2
        className="
          mb-5
          text-sm
          font-bold
          uppercase
          tracking-[0.12em]
          text-white
        "
      >
        {title}
      </h2>

      {children}
    </div>
  );
}

// =========================================================
// CONTACT ICON
// =========================================================

function ContactIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="
        mt-0.5
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-white/10
        bg-white/5
        text-blue-300
      "
    >
      {children}
    </span>
  );
}

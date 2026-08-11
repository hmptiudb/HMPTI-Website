"use client";

import { auth, eventsCollection, membersCollection, newsCollection, productsCollection } from "@/lib/firebase";

import { onAuthStateChanged, type User } from "firebase/auth";

import { getDocs, type Timestamp } from "firebase/firestore";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { FaArrowRight, FaBox, FaCalendarAlt, FaClock, FaExclamationTriangle, FaImage, FaMapMarkerAlt, FaNewspaper, FaSyncAlt, FaUsers, FaWhatsapp } from "react-icons/fa";

import AdminLayout from "../AdminLayout";

// =========================================================
// TYPES
// =========================================================

type DateValue = Timestamp | Date | string | number | null | undefined;

interface EventItem {
  id: string;

  eventName: string;

  dateEvent: string;

  dateEventAt?: Timestamp;

  imageUrl: string;

  descriptionEvent: string;

  statusEvent?: string;

  timeEvent?: string;

  location?: string;

  organizer?: string;

  categoryEvent?: string;

  categoryAudiens?: string;

  createdAt?: DateValue;

  updatedAt?: DateValue;
}

interface MemberItem {
  id: string;

  nim: string;

  name: string;

  division?: string;

  position?: string;

  imageUrl: string;

  status?: string;

  email?: string;

  linkInstagram?: string;

  linkGithub?: string;

  createdAt?: DateValue;

  updatedAt?: DateValue;

  /**
   * Data lama masih mungkin
   * memiliki field ini.
   */
  dateCreated?: string;
}

interface NewsItem {
  id: string;

  titleNews: string;

  descriptionNews: string;

  writterNews: string;

  categoryNews?: string;

  imageUrl: string;

  dateCreated: string;

  dateCreatedAt?: Timestamp;

  createdAt?: DateValue;

  updatedAt?: DateValue;
}

interface ProductItem {
  id: string;

  imageUrl: string;

  productName: string;

  priceProduct: string;

  descriptionProduct: string;

  whatsappNumber: string;

  dateCreated?: string;

  createdAt?: DateValue;

  updatedAt?: DateValue;
}

interface DashboardData {
  members: MemberItem[];

  events: EventItem[];

  news: NewsItem[];

  products: ProductItem[];
}

// =========================================================
// DEFAULT DATA
// =========================================================

const EMPTY_DASHBOARD_DATA: DashboardData = {
  members: [],
  events: [],
  news: [],
  products: [],
};

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

function parseDateString(value: string): Date | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  // =======================================================
  // YYYY-MM-DD
  // =======================================================

  const isoDateMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;

    return createValidatedDate(Number(year), Number(month), Number(day));
  }

  // =======================================================
  // DD/MM/YYYY
  // DD-MM-YYYY
  // =======================================================

  const legacyMatch = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (legacyMatch) {
    const [, day, month, year] = legacyMatch;

    return createValidatedDate(Number(year), Number(month), Number(day));
  }

  // =======================================================
  // ISO DATETIME / FALLBACK
  // =======================================================

  const fallback = new Date(normalized);

  if (Number.isNaN(fallback.getTime())) {
    return null;
  }

  return fallback;
}

function toDate(value: DateValue): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  // =======================================================
  // JAVASCRIPT DATE
  // =======================================================

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return value;
  }

  // =======================================================
  // FIRESTORE TIMESTAMP
  // =======================================================

  if (typeof value === "object" && "toDate" in value) {
    const toDateFunction = (
      value as {
        toDate?: () => Date;
      }
    ).toDate;

    if (typeof toDateFunction === "function") {
      const date = toDateFunction.call(value);

      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // =======================================================
  // STRING
  // =======================================================

  if (typeof value === "string") {
    return parseDateString(value);
  }

  // =======================================================
  // NUMBER
  // =======================================================

  if (typeof value === "number") {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  return null;
}

function formatDate(value: DateValue) {
  const date = toDate(value);

  if (!date) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// =========================================================
// EVENT HELPERS
// =========================================================

function getEventTimestamp(event: EventItem) {
  const eventDate = toDate(event.dateEventAt) ?? toDate(event.dateEvent) ?? toDate(event.createdAt);

  return eventDate?.getTime() ?? 0;
}

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

function getEventStatusClass(status?: string) {
  const normalized = normalizeEventStatus(status);

  switch (normalized) {
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
// MEMBER HELPERS
// =========================================================

function getMemberTimestamp(member: MemberItem) {
  const date = toDate(member.createdAt) ?? toDate(member.dateCreated);

  return date?.getTime() ?? 0;
}

function getDivisionLabel(division?: string) {
  switch (division) {
    case "Riset&Teknologi":
      return "Riset & Teknologi";

    case "Minat&Bakat":
      return "Minat & Bakat";

    case "Wakil":
      return "Wakil Ketua";

    default:
      return division ?? "-";
  }
}

function getMemberStatusClass(status?: string) {
  if (status === "Aktif") {
    return `
      border-green-100
      bg-green-50
      text-green-700
    `;
  }

  return `
    border-gray-200
    bg-gray-100
    text-gray-600
  `;
}

// =========================================================
// NEWS HELPERS
// =========================================================

function getNewsTimestamp(news: NewsItem) {
  const date = toDate(news.dateCreatedAt) ?? toDate(news.dateCreated) ?? toDate(news.createdAt);

  return date?.getTime() ?? 0;
}

function getNewsCategoryClass(category?: string) {
  const classes: Record<string, string> = {
    Teknologi: "border-blue-100 bg-blue-50 text-blue-700",

    Lifestyle: "border-pink-100 bg-pink-50 text-pink-700",

    Art: "border-purple-100 bg-purple-50 text-purple-700",

    Ekonomi: "border-green-100 bg-green-50 text-green-700",

    Sejarah: "border-amber-100 bg-amber-50 text-amber-700",

    Pendidikan: "border-indigo-100 bg-indigo-50 text-indigo-700",

    Olahraga: "border-red-100 bg-red-50 text-red-700",

    Hiburan: "border-orange-100 bg-orange-50 text-orange-700",

    Hukum: "border-gray-200 bg-gray-100 text-gray-700",

    Politik: "border-teal-100 bg-teal-50 text-teal-700",
  };

  return classes[category ?? ""] ?? "border-gray-200 bg-gray-100 text-gray-600";
}

// =========================================================
// PRODUCT HELPERS
// =========================================================

function getProductTimestamp(product: ProductItem) {
  const date = toDate(product.createdAt) ?? toDate(product.dateCreated);

  return date?.getTime() ?? 0;
}

function parsePriceValue(value?: string) {
  if (!value) {
    return 0;
  }

  const digits = String(value).replace(/\D/g, "");

  if (!digits) {
    return 0;
  }

  const number = Number(digits);

  return Number.isFinite(number) ? number : 0;
}

function formatPrice(value: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parsePriceValue(value));
}

function normalizeWhatsappNumber(value: string) {
  let number = value.replace(/\D/g, "");

  if (!number) {
    return "";
  }

  if (number.startsWith("0")) {
    number = `62${number.slice(1)}`;
  } else if (number.startsWith("8")) {
    number = `62${number}`;
  }

  return number;
}

function getWhatsappUrl(product: ProductItem) {
  const number = normalizeWhatsappNumber(product.whatsappNumber);

  if (number.length < 9) {
    return null;
  }

  const message = `Halo, saya tertarik dengan produk ${product.productName}. Bisa minta informasi lebih lanjut?`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// =========================================================
// PAGE
// =========================================================

export default function Page() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [authLoading, setAuthLoading] = useState(true);

  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<DashboardData>(EMPTY_DASHBOARD_DATA);

  // =======================================================
  // AUTH
  // =======================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);

        setAuthLoading(false);

        router.replace("/auth/login");

        return;
      }

      setUser(currentUser);

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // =======================================================
  // LOAD DASHBOARD
  // =======================================================

  const loadDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true);

      setDashboardError(null);

      // =========================================
      // HANYA SATU KALI FETCH PER COLLECTION
      // =========================================

      const [membersSnapshot, eventsSnapshot, newsSnapshot, productsSnapshot] = await Promise.all([
        getDocs(membersCollection),

        getDocs(eventsCollection),

        getDocs(newsCollection),

        getDocs(productsCollection),
      ]);

      // =========================================
      // MAP MEMBERS
      // =========================================

      const members = membersSnapshot.docs.map(
        (document) =>
          ({
            ...document.data(),

            id: document.id,
          }) as MemberItem,
      );

      // =========================================
      // MAP EVENTS
      // =========================================

      const events = eventsSnapshot.docs.map(
        (document) =>
          ({
            ...document.data(),

            id: document.id,
          }) as EventItem,
      );

      // =========================================
      // MAP NEWS
      // =========================================

      const news = newsSnapshot.docs.map(
        (document) =>
          ({
            ...document.data(),

            id: document.id,
          }) as NewsItem,
      );

      // =========================================
      // MAP PRODUCTS
      // =========================================

      const products = productsSnapshot.docs.map(
        (document) =>
          ({
            ...document.data(),

            id: document.id,
          }) as ProductItem,
      );

      setDashboardData({
        members,
        events,
        news,
        products,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);

      setDashboardError("Dashboard tidak dapat memuat data. Silakan coba kembali.");
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // =======================================================
  // FETCH AFTER AUTH
  // =======================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    void loadDashboard();
  }, [user, loadDashboard]);

  // =======================================================
  // AUTH LOADING
  // =======================================================

  if (authLoading) {
    return <AdminPageLoading />;
  }

  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <div
        className="
          min-h-screen
          bg-gray-50
          p-3

          sm:p-5

          lg:p-6
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
          "
        >
          {/* =========================================
              WELCOME HEADER
          ========================================== */}

          <DashboardHeader user={user} />

          {/* =========================================
              DATA LOADING
          ========================================== */}

          {dashboardLoading ? (
            <DashboardSkeleton />
          ) : dashboardError ? (
            <DashboardError message={dashboardError} onRetry={loadDashboard} />
          ) : (
            <DashboardContent data={dashboardData} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// =========================================================
// DASHBOARD HEADER
// =========================================================

function DashboardHeader({ user }: { user: User }) {
  const initial = user.email?.charAt(0).toUpperCase() ?? "A";

  return (
    <section
      className="
        mb-5
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm

        sm:mb-6
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          p-5

          sm:p-6

          md:flex-row
          md:items-center
          md:justify-between
        "
      >
        <div>
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.15em]
              text-blue-600
            "
          >
            Admin HMPTI
          </p>

          <h1
            className="
              mt-1
              text-2xl
              font-bold
              tracking-tight
              text-gray-900

              sm:text-3xl
            "
          >
            Selamat Datang Kembali
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-gray-500
            "
          >
            Pantau dan kelola data website HMPTI melalui dashboard admin.
          </p>
        </div>

        {/* USER */}

        <div
          className="
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-gray-100
            bg-gray-50
            px-4
            py-3
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-600
              text-sm
              font-bold
              text-white
            "
          >
            {initial}
          </div>

          <div className="min-w-0">
            <p
              className="
                text-xs
                font-medium
                text-gray-400
              "
            >
              Login sebagai
            </p>

            <p
              className="
                max-w-[220px]
                truncate
                text-sm
                font-semibold
                text-gray-800
              "
            >
              {user.email ?? "Admin"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// =========================================================
// DASHBOARD CONTENT
// =========================================================

function DashboardContent({ data }: { data: DashboardData }) {
  const latestMembers = useMemo(() => {
    return [...data.members]
      .sort((a, b) => {
        const difference = getMemberTimestamp(b) - getMemberTimestamp(a);

        if (difference !== 0) {
          return difference;
        }

        return a.name.localeCompare(b.name, "id");
      })
      .slice(0, 5);
  }, [data.members]);

  const latestEvents = useMemo(() => {
    return [...data.events].sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a)).slice(0, 4);
  }, [data.events]);

  const latestNews = useMemo(() => {
    return [...data.news].sort((a, b) => getNewsTimestamp(b) - getNewsTimestamp(a)).slice(0, 4);
  }, [data.news]);

  const latestProducts = useMemo(() => {
    return [...data.products].sort((a, b) => getProductTimestamp(b) - getProductTimestamp(a)).slice(0, 3);
  }, [data.products]);

  return (
    <>
      {/* =========================================
          STATISTICS
      ========================================== */}

      <DashboardStats members={data.members.length} events={data.events.length} news={data.news.length} products={data.products.length} />

      {/* =========================================
          ROW 1
      ========================================== */}

      <div
        className="
          mt-5
          grid
          grid-cols-1
          gap-5

          sm:mt-6
          sm:gap-6

          xl:grid-cols-2
        "
      >
        <MembersSection members={latestMembers} />

        <EventsSection events={latestEvents} />
      </div>

      {/* =========================================
          ROW 2
      ========================================== */}

      <div
        className="
          mt-5
          grid
          grid-cols-1
          gap-5

          sm:mt-6
          sm:gap-6

          xl:grid-cols-2
        "
      >
        <NewsSection news={latestNews} />

        <ProductsSection products={latestProducts} />
      </div>
    </>
  );
}

// =========================================================
// DASHBOARD STATS
// =========================================================

function DashboardStats({
  members,
  events,
  news,
  products,
}: {
  members: number;

  events: number;

  news: number;

  products: number;
}) {
  const stats = [
    {
      label: "Total Anggota",

      value: members,

      icon: <FaUsers />,

      href: "/admin/member",

      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Event",

      value: events,

      icon: <FaCalendarAlt />,

      href: "/admin/event",

      iconClass: "bg-purple-50 text-purple-600",
    },
    {
      label: "Total Berita",

      value: news,

      icon: <FaNewspaper />,

      href: "/admin/news",

      iconClass: "bg-green-50 text-green-600",
    },
    {
      label: "Total Produk",

      value: products,

      icon: <FaBox />,

      href: "/admin/product",

      iconClass: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <section
      className="
        grid
        grid-cols-1
        gap-3

        sm:grid-cols-2

        xl:grid-cols-4
      "
    >
      {stats.map((stat) => (
        <Link
          key={stat.href}
          href={stat.href}
          className="
              group
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-4
              shadow-sm
              transition-all

              hover:-translate-y-0.5
              hover:shadow-md

              sm:p-5
            "
        >
          <div
            className="
                flex
                items-start
                justify-between
                gap-4
              "
          >
            <div>
              <p
                className="
                    text-sm
                    font-medium
                    text-gray-500
                  "
              >
                {stat.label}
              </p>

              <p
                className="
                    mt-2
                    text-3xl
                    font-bold
                    tracking-tight
                    text-gray-900
                  "
              >
                {stat.value}
              </p>
            </div>

            <div
              className={`
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  text-lg

                  ${stat.iconClass}
                `}
            >
              {stat.icon}
            </div>
          </div>

          <div
            className="
                mt-4
                inline-flex
                items-center
                gap-1.5
                text-xs
                font-semibold
                text-blue-600
              "
          >
            Kelola data
            <FaArrowRight
              className="
                  text-[10px]
                  transition-transform

                  group-hover:translate-x-1
                "
            />
          </div>
        </Link>
      ))}
    </section>
  );
}

// =========================================================
// MEMBERS SECTION
// =========================================================

function MembersSection({ members }: { members: MemberItem[] }) {
  return (
    <DashboardSection title="Anggota Terbaru" description="Data kepengurusan yang terakhir ditambahkan." icon={<FaUsers />} href="/admin/member">
      {members.length === 0 ? (
        <SectionEmpty icon={<FaUsers />} text="Belum ada data anggota." />
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-gray-100
                  p-3
                  transition-colors

                  hover:bg-gray-50
                "
            >
              <AdminImage
                src={member.imageUrl}
                alt={member.name}
                className="
                    h-11
                    w-11
                    shrink-0
                    rounded-xl
                  "
              />

              <div
                className="
                    min-w-0
                    flex-1
                  "
              >
                <p
                  className="
                      truncate
                      text-sm
                      font-semibold
                      text-gray-900
                    "
                >
                  {member.name}
                </p>

                <p
                  className="
                      mt-0.5
                      truncate
                      text-xs
                      text-gray-500
                    "
                >
                  {getDivisionLabel(member.division)}

                  {member.position ? ` • ${member.position}` : ""}
                </p>
              </div>

              <span
                className={`
                    shrink-0
                    rounded-full
                    border
                    px-2.5
                    py-1
                    text-[11px]
                    font-semibold

                    ${getMemberStatusClass(member.status)}
                  `}
              >
                {member.status ?? "Tidak Aktif"}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

// =========================================================
// EVENT SECTION
// =========================================================

function EventsSection({ events }: { events: EventItem[] }) {
  return (
    <DashboardSection title="Event Terbaru" description="Event berdasarkan tanggal pelaksanaan terbaru." icon={<FaCalendarAlt />} href="/admin/event">
      {events.length === 0 ? (
        <SectionEmpty icon={<FaCalendarAlt />} text="Belum ada event." />
      ) : (
        <div
          className="
            grid
            grid-cols-1
            gap-3

            sm:grid-cols-2
          "
        >
          {events.map((event) => (
            <div
              key={event.id}
              className="
                  rounded-xl
                  border
                  border-gray-100
                  p-3
                  transition-all

                  hover:bg-gray-50
                "
            >
              <div
                className="
                    flex
                    items-start
                    gap-3
                  "
              >
                <AdminImage
                  src={event.imageUrl}
                  alt={event.eventName}
                  className="
                      h-16
                      w-16
                      shrink-0
                      rounded-xl
                    "
                />

                <div
                  className="
                      min-w-0
                      flex-1
                    "
                >
                  <h3
                    className="
                        line-clamp-2
                        text-sm
                        font-semibold
                        leading-5
                        text-gray-900
                      "
                  >
                    {event.eventName}
                  </h3>

                  <div
                    className="
                        mt-1.5
                        flex
                        items-center
                        gap-1.5
                        text-xs
                        text-gray-500
                      "
                  >
                    <FaCalendarAlt
                      className="
                          shrink-0
                          text-blue-500
                        "
                    />

                    <span className="truncate">{formatDate(event.dateEventAt ?? event.dateEvent)}</span>
                  </div>
                </div>
              </div>

              {(event.timeEvent || event.location) && (
                <div
                  className="
                      mt-3
                      flex
                      flex-wrap
                      gap-x-3
                      gap-y-1.5
                      text-xs
                      text-gray-500
                    "
                >
                  {event.timeEvent && (
                    <span
                      className="
                          inline-flex
                          items-center
                          gap-1.5
                        "
                    >
                      <FaClock />

                      {event.timeEvent}
                    </span>
                  )}

                  {event.location && (
                    <span
                      className="
                          inline-flex
                          min-w-0
                          items-center
                          gap-1.5
                        "
                    >
                      <FaMapMarkerAlt />

                      <span className="line-clamp-1">{event.location}</span>
                    </span>
                  )}
                </div>
              )}

              <div className="mt-3">
                <span
                  className={`
                      inline-flex
                      rounded-full
                      border
                      px-2.5
                      py-1
                      text-[11px]
                      font-semibold

                      ${getEventStatusClass(event.statusEvent)}
                    `}
                >
                  {normalizeEventStatus(event.statusEvent)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

// =========================================================
// NEWS SECTION
// =========================================================

function NewsSection({ news }: { news: NewsItem[] }) {
  return (
    <DashboardSection title="Berita Terbaru" description="Artikel dan berita terbaru yang dipublikasikan." icon={<FaNewspaper />} href="/admin/news">
      {news.length === 0 ? (
        <SectionEmpty icon={<FaNewspaper />} text="Belum ada berita." />
      ) : (
        <div className="space-y-3">
          {news.map((item) => (
            <article
              key={item.id}
              className="
                  flex
                  gap-3
                  rounded-xl
                  border
                  border-gray-100
                  p-3
                  transition-colors

                  hover:bg-gray-50
                "
            >
              <AdminImage
                src={item.imageUrl}
                alt={item.titleNews}
                className="
                    h-20
                    w-24
                    shrink-0
                    rounded-xl
                  "
              />

              <div
                className="
                    min-w-0
                    flex-1
                  "
              >
                <div
                  className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                >
                  <span
                    className={`
                        rounded-full
                        border
                        px-2
                        py-0.5
                        text-[10px]
                        font-semibold

                        ${getNewsCategoryClass(item.categoryNews)}
                      `}
                  >
                    {item.categoryNews ?? "Tanpa Kategori"}
                  </span>

                  <span
                    className="
                        text-[11px]
                        text-gray-400
                      "
                  >
                    {formatDate(item.dateCreatedAt ?? item.dateCreated)}
                  </span>
                </div>

                <h3
                  className="
                      mt-2
                      line-clamp-1
                      text-sm
                      font-semibold
                      text-gray-900
                    "
                >
                  {item.titleNews}
                </h3>

                <p
                  className="
                      mt-1
                      line-clamp-1
                      text-xs
                      text-gray-500
                    "
                >
                  Oleh {item.writterNews}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

// =========================================================
// PRODUCTS SECTION
// =========================================================

function ProductsSection({ products }: { products: ProductItem[] }) {
  return (
    <DashboardSection title="Produk Terbaru" description="Produk terbaru yang tersedia pada website." icon={<FaBox />} href="/admin/product">
      {products.length === 0 ? (
        <SectionEmpty icon={<FaBox />} text="Belum ada produk." />
      ) : (
        <div
          className="
            grid
            grid-cols-1
            gap-3

            sm:grid-cols-3

            xl:grid-cols-3
          "
        >
          {products.map((product) => {
            const whatsappUrl = getWhatsappUrl(product);

            return (
              <article
                key={product.id}
                className="
                    flex
                    flex-col
                    overflow-hidden
                    rounded-xl
                    border
                    border-gray-100
                    bg-white
                  "
              >
                <AdminImage
                  src={product.imageUrl}
                  alt={product.productName}
                  className="
                      aspect-[4/3]
                      w-full
                    "
                />

                <div
                  className="
                      flex
                      flex-1
                      flex-col
                      p-3
                    "
                >
                  <h3
                    className="
                        line-clamp-2
                        text-sm
                        font-semibold
                        leading-5
                        text-gray-900
                      "
                  >
                    {product.productName}
                  </h3>

                  <p
                    className="
                        mt-1.5
                        text-sm
                        font-bold
                        text-blue-600
                      "
                  >
                    {formatPrice(product.priceProduct)}
                  </p>

                  <p
                    className="
                        mt-2
                        line-clamp-2
                        text-xs
                        leading-5
                        text-gray-500
                      "
                  >
                    {product.descriptionProduct}
                  </p>

                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                          mt-auto
                          inline-flex
                          items-center
                          justify-center
                          gap-1.5
                          pt-3
                          text-xs
                          font-semibold
                          text-green-600

                          hover:text-green-700
                        "
                    >
                      <FaWhatsapp />
                      WhatsApp
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}

// =========================================================
// DASHBOARD SECTION
// =========================================================

function DashboardSection({
  title,
  description,
  icon,
  href,
  children,
}: {
  title: string;

  description: string;

  icon: ReactNode;

  href: string;

  children: ReactNode;
}) {
  return (
    <section
      className="
        min-w-0
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-4
        shadow-sm

        sm:p-5
      "
    >
      <div
        className="
          mb-5
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div
          className="
            flex
            min-w-0
            items-start
            gap-3
          "
        >
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
              text-blue-600
            "
          >
            {icon}
          </div>

          <div className="min-w-0">
            <h2
              className="
                text-base
                font-bold
                text-gray-900

                sm:text-lg
              "
            >
              {title}
            </h2>

            <p
              className="
                mt-0.5
                text-xs
                leading-5
                text-gray-400
              "
            >
              {description}
            </p>
          </div>
        </div>

        <Link
          href={href}
          className="
            hidden
            shrink-0
            items-center
            gap-1.5
            text-xs
            font-semibold
            text-blue-600

            hover:text-blue-700

            sm:inline-flex
          "
        >
          Lihat semua
          <FaArrowRight className="text-[10px]" />
        </Link>
      </div>

      {children}

      {/* MOBILE LINK */}

      <Link
        href={href}
        className="
          mt-4
          inline-flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-gray-50
          py-2.5
          text-xs
          font-semibold
          text-blue-600

          hover:bg-blue-50

          sm:hidden
        "
      >
        Lihat semua
        <FaArrowRight />
      </Link>
    </section>
  );
}

// =========================================================
// ADMIN IMAGE
// =========================================================

function AdminImage({
  src,
  alt,
  className,
}: {
  src?: string;

  alt: string;

  className: string;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <div
      className={`
        relative
        overflow-hidden
        bg-gray-100

        ${className}
      `}
    >
      {src && !hasError ? (
        /*
         * Admin memakai <img> langsung.
         *
         * Jangan diubah ke next/image karena
         * Cloudinary sebelumnya timeout
         * melalui /_next/image.
         */

        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className="
            h-full
            w-full
            object-cover
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
            from-gray-50
            to-gray-100
            text-gray-300
          "
        >
          <FaImage />
        </div>
      )}
    </div>
  );
}

// =========================================================
// EMPTY SECTION
// =========================================================

function SectionEmpty({
  icon,
  text,
}: {
  icon: ReactNode;

  text: string;
}) {
  return (
    <div
      className="
        flex
        min-h-[180px]
        flex-col
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        border-gray-200
        bg-gray-50
        px-4
        text-center
      "
    >
      <div
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          bg-white
          text-gray-300
          shadow-sm
        "
      >
        {icon}
      </div>

      <p
        className="
          mt-3
          text-sm
          text-gray-500
        "
      >
        {text}
      </p>
    </div>
  );
}

// =========================================================
// DASHBOARD ERROR
// =========================================================

function DashboardError({
  message,
  onRetry,
}: {
  message: string;

  onRetry: () => Promise<void>;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-red-100
        bg-white
        p-8
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
          text-xl
          text-red-500
        "
      >
        <FaExclamationTriangle />
      </div>

      <h2
        className="
          mt-4
          text-lg
          font-bold
          text-gray-900
        "
      >
        Data Dashboard Gagal Dimuat
      </h2>

      <p
        className="
          mx-auto
          mt-2
          max-w-md
          text-sm
          leading-6
          text-gray-500
        "
      >
        {message}
      </p>

      <button
        type="button"
        onClick={() => {
          void onRetry();
        }}
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-blue-600
          px-5
          py-2.5
          text-sm
          font-semibold
          text-white
          transition-colors

          hover:bg-blue-500
        "
      >
        <FaSyncAlt />
        Coba Lagi
      </button>
    </div>
  );
}

// =========================================================
// AUTH PAGE LOADING
// =========================================================

function AdminPageLoading() {
  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-gray-50
      "
    >
      <div className="text-center">
        <span
          className="
            mx-auto
            block
            h-10
            w-10
            animate-spin
            rounded-full
            border-2
            border-gray-200
            border-t-blue-600
          "
        />

        <p
          className="
            mt-4
            text-sm
            font-medium
            text-gray-500
          "
        >
          Memeriksa akses admin...
        </p>
      </div>
    </div>
  );
}

// =========================================================
// DASHBOARD SKELETON
// =========================================================

function DashboardSkeleton() {
  return (
    <>
      {/* =========================================
          STATS
      ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-3

          sm:grid-cols-2

          xl:grid-cols-4
        "
      >
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="
                animate-pulse
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-5
              "
          >
            <div
              className="
                  flex
                  items-start
                  justify-between
                "
            >
              <div className="space-y-3">
                <div
                  className="
                      h-4
                      w-24
                      rounded
                      bg-gray-100
                    "
                />

                <div
                  className="
                      h-8
                      w-14
                      rounded
                      bg-gray-200
                    "
                />
              </div>

              <div
                className="
                    h-11
                    w-11
                    rounded-xl
                    bg-gray-100
                  "
              />
            </div>
          </div>
        ))}
      </div>

      {/* =========================================
          SECTIONS
      ========================================== */}

      <div
        className="
          mt-6
          grid
          grid-cols-1
          gap-6

          xl:grid-cols-2
        "
      >
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="
                animate-pulse
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-5
              "
          >
            <div
              className="
                  mb-5
                  flex
                  items-center
                  gap-3
                "
            >
              <div
                className="
                    h-10
                    w-10
                    rounded-xl
                    bg-gray-100
                  "
              />

              <div
                className="
                    flex-1
                    space-y-2
                  "
              >
                <div
                  className="
                      h-5
                      w-36
                      rounded
                      bg-gray-200
                    "
                />

                <div
                  className="
                      h-3
                      w-56
                      max-w-full
                      rounded
                      bg-gray-100
                    "
                />
              </div>
            </div>

            <div className="space-y-3">
              {Array.from({
                length: 4,
              }).map((__, rowIndex) => (
                <div
                  key={rowIndex}
                  className="
                        h-20
                        rounded-xl
                        bg-gray-100
                      "
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

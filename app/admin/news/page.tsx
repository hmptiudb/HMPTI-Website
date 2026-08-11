"use client";

import { newsCollection } from "@/lib/firebase";

import { Timestamp, addDoc, deleteDoc, doc, getDocs, serverTimestamp, updateDoc, type Timestamp as FirestoreTimestamp } from "firebase/firestore";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";

import { FaCalendarAlt, FaEdit, FaImage, FaNewspaper, FaPlus, FaSearch, FaTags, FaTimes, FaTrash, FaUser } from "react-icons/fa";

import { toast } from "react-toastify";

import { uploadToCloudinary } from "../../../app/api/upload";

import AdminLayout from "../AdminLayout";

// =========================================================
// TYPES
// =========================================================

interface NewsItem {
  id: string;

  imageUrl: string;

  categoryNews?: string;

  titleNews: string;

  /**
   * Nama field lama memang "writterNews".
   *
   * Jangan diganti menjadi writerNews dulu
   * agar halaman publik yang sudah ada
   * tidak terputus.
   */
  writterNews: string;

  descriptionNews: string;

  /**
   * Dipertahankan agar kompatibel
   * dengan data lama.
   */
  dateCreated: string;

  /**
   * Timestamp baru untuk sorting
   * tanggal yang lebih konsisten.
   */
  dateCreatedAt?: FirestoreTimestamp;

  createdAt?: FirestoreTimestamp;

  updatedAt?: FirestoreTimestamp;
}

// =========================================================
// CONSTANTS
// =========================================================

const NEWS_CATEGORY_OPTIONS = ["Teknologi", "Lifestyle", "Art", "Ekonomi", "Sejarah", "Pendidikan", "Olahraga", "Hiburan", "Hukum", "Politik"];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

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

function parseNewsDate(value?: string): Date | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  // =======================================================
  // YYYY-MM-DD
  // =======================================================

  const inputDateMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (inputDateMatch) {
    const [, year, month, day] = inputDateMatch;

    return createValidatedDate(Number(year), Number(month), Number(day));
  }

  // =======================================================
  // ISO STRING DATA LAMA
  // =======================================================

  const fallback = new Date(normalized);

  if (Number.isNaN(fallback.getTime())) {
    return null;
  }

  return fallback;
}

function normalizeDateInput(value?: string) {
  const date = parseNewsDate(value);

  if (!date) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayInputValue() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatNewsDate(value: string) {
  const date = parseNewsDate(value);

  if (!date) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getNewsTimestamp(item: NewsItem) {
  if (item.dateCreatedAt && typeof item.dateCreatedAt.toMillis === "function") {
    return item.dateCreatedAt.toMillis();
  }

  return parseNewsDate(item.dateCreated)?.getTime() ?? 0;
}

// =========================================================
// CATEGORY
// =========================================================

function getCategoryClass(category?: string) {
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

  return classes[category ?? ""] ?? "border-gray-200 bg-gray-100 text-gray-700";
}

// =========================================================
// NEWS FORM
// =========================================================

function NewsForm({
  existingData,
  onClose,
  onSaved,
}: {
  existingData?: NewsItem;

  onClose: () => void;

  onSaved: () => Promise<void>;
}) {
  const [titleNews, setTitleNews] = useState(existingData?.titleNews ?? "");

  const [writterNews, setWritterNews] = useState(existingData?.writterNews ?? "");

  const [categoryNews, setCategoryNews] = useState(existingData?.categoryNews ?? "Teknologi");

  const [descriptionNews, setDescriptionNews] = useState(existingData?.descriptionNews ?? "");

  const [dateCreated, setDateCreated] = useState(existingData ? normalizeDateInput(existingData.dateCreated) : getTodayInputValue());

  const [image, setImage] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(existingData?.imageUrl ?? null);

  const [loading, setLoading] = useState(false);

  // =======================================================
  // LOCK BACKGROUND
  // =======================================================

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // =======================================================
  // ESC
  // =======================================================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, onClose]);

  // =======================================================
  // PREVIEW
  // =======================================================

  useEffect(() => {
    if (!image) {
      return;
    }

    const objectUrl = URL.createObjectURL(image);

    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [image]);

  // =======================================================
  // IMAGE CHANGE
  // =======================================================

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setImage(null);

      setPreviewUrl(existingData?.imageUrl ?? null);

      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format gambar harus JPG, PNG, atau WEBP.");

      event.target.value = "";

      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Ukuran gambar maksimal 5 MB.");

      event.target.value = "";

      return;
    }

    setImage(file);
  };

  // =======================================================
  // SUBMIT
  // =======================================================

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    // =====================================================
    // CLEAN VALUE
    // =====================================================

    const trimmedTitle = titleNews.trim();

    const trimmedWriter = writterNews.trim();

    const trimmedDescription = descriptionNews.trim();

    // =====================================================
    // REQUIRED
    // =====================================================

    if (!trimmedTitle || !trimmedWriter || !trimmedDescription || !dateCreated || !categoryNews) {
      toast.error("Judul, tanggal, penulis, kategori, dan isi berita wajib diisi.");

      return;
    }

    // =====================================================
    // DATE
    // =====================================================

    const parsedDate = parseNewsDate(dateCreated);

    if (!parsedDate) {
      toast.error("Tanggal berita tidak valid.");

      return;
    }

    // =====================================================
    // IMAGE
    // =====================================================

    if (!existingData?.imageUrl && !image) {
      toast.error("Silakan upload gambar berita.");

      return;
    }

    setLoading(true);

    try {
      // ===================================================
      // IMAGE UPLOAD
      // ===================================================

      let imageUrl = existingData?.imageUrl ?? "";

      if (image) {
        const uploadedImageUrl = await uploadToCloudinary(image);

        if (!uploadedImageUrl) {
          throw new Error("Gagal mengunggah gambar berita.");
        }

        imageUrl = uploadedImageUrl;
      }

      // ===================================================
      // DATA
      // ===================================================

      const newsData = {
        titleNews: trimmedTitle,

        writterNews: trimmedWriter,

        categoryNews,

        descriptionNews: trimmedDescription,

        imageUrl,

        /**
         * String tanggal dipertahankan
         * untuk kompatibilitas public page.
         */
        dateCreated,

        /**
         * Timestamp baru untuk sorting.
         */
        dateCreatedAt: Timestamp.fromDate(parsedDate),

        updatedAt: serverTimestamp(),
      };

      // ===================================================
      // UPDATE
      // ===================================================

      if (existingData) {
        await updateDoc(doc(newsCollection, existingData.id), newsData);

        toast.success("Berita berhasil diperbarui.");
      }

      // ===================================================
      // CREATE
      // ===================================================
      else {
        await addDoc(newsCollection, {
          ...newsData,

          createdAt: serverTimestamp(),
        });

        toast.success("Berita berhasil ditambahkan.");
      }

      await onSaved();

      onClose();
    } catch (error) {
      console.error("Error saving news:", error);

      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan berita.");
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-form-title"
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/60
        p-3
        backdrop-blur-sm

        sm:p-5
      "
    >
      <div
        className="
          flex
          max-h-[calc(100dvh-24px)]
          w-full
          max-w-3xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl

          sm:max-h-[90dvh]
        "
      >
        {/* =========================================
            HEADER
        ========================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-gray-100
            px-5
            py-4

            sm:px-6
            sm:py-5
          "
        >
          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.14em]
                text-blue-600
              "
            >
              Manajemen Berita
            </p>

            <h2
              id="news-form-title"
              className="
                mt-1
                text-xl
                font-bold
                text-gray-900

                sm:text-2xl
              "
            >
              {existingData ? "Edit Berita" : "Tambah Berita"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup form"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-gray-400
              transition-colors

              hover:bg-gray-100
              hover:text-gray-700

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <FaTimes />
          </button>
        </div>

        {/* =========================================
            FORM
        ========================================== */}

        <form
          onSubmit={handleSubmit}
          className="
            flex
            min-h-0
            flex-1
            flex-col
          "
        >
          <div
            className="
              flex-1
              overflow-y-auto
              px-5
              py-5

              sm:px-6
            "
          >
            <div className="space-y-6">
              {/* ===================================
                  INFORMASI UTAMA
              ==================================== */}

              <FormSection title="Informasi Berita" description="Informasi utama artikel yang akan ditampilkan pada website.">
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4

                    md:grid-cols-2
                  "
                >
                  <FormField label="Judul Berita" required>
                    <input
                      type="text"
                      value={titleNews}
                      onChange={(event) => setTitleNews(event.target.value)}
                      placeholder="Masukkan judul berita"
                      className={inputClass}
                      required
                    />
                  </FormField>

                  <FormField label="Tanggal Publikasi" required>
                    <input type="date" value={dateCreated} onChange={(event) => setDateCreated(event.target.value)} className={inputClass} required />
                  </FormField>

                  <FormField label="Penulis" required>
                    <input type="text" value={writterNews} onChange={(event) => setWritterNews(event.target.value)} placeholder="Nama penulis" className={inputClass} required />
                  </FormField>

                  <FormField label="Kategori Berita" required>
                    <select value={categoryNews} onChange={(event) => setCategoryNews(event.target.value)} className={inputClass} required>
                      {NEWS_CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </FormSection>

              {/* ===================================
                  CONTENT
              ==================================== */}

              <FormSection title="Isi Berita" description="Tuliskan isi atau deskripsi berita secara jelas dan informatif.">
                <FormField label="Deskripsi Berita" required>
                  <textarea
                    value={descriptionNews}
                    onChange={(event) => setDescriptionNews(event.target.value)}
                    placeholder="Tuliskan isi berita..."
                    rows={8}
                    className={`
                      ${inputClass}
                      resize-y
                    `}
                    required
                  />

                  <div
                    className="
                      mt-1.5
                      flex
                      justify-end
                    "
                  >
                    <span
                      className="
                        text-xs
                        text-gray-400
                      "
                    >
                      {descriptionNews.length} karakter
                    </span>
                  </div>
                </FormField>
              </FormSection>

              {/* ===================================
                  IMAGE
              ==================================== */}

              <FormSection title="Gambar Berita" description="Gunakan gambar landscape yang relevan dengan isi berita.">
                <FormField label={existingData ? "Ganti Gambar" : "Upload Gambar"} required={!existingData}>
                  <label
                    className="
                      flex
                      cursor-pointer
                      flex-col
                      items-center
                      justify-center
                      rounded-2xl
                      border-2
                      border-dashed
                      border-gray-200
                      bg-gray-50
                      px-5
                      py-8
                      text-center
                      transition-colors

                      hover:border-blue-300
                      hover:bg-blue-50/50
                    "
                  >
                    <FaImage
                      className="
                        mb-3
                        text-2xl
                        text-gray-400
                      "
                    />

                    <span
                      className="
                        max-w-full
                        truncate
                        text-sm
                        font-semibold
                        text-gray-700
                      "
                    >
                      {image ? image.name : existingData ? "Pilih gambar baru" : "Pilih gambar berita"}
                    </span>

                    <span
                      className="
                        mt-1
                        text-xs
                        text-gray-400
                      "
                    >
                      JPG, PNG atau WEBP • Maksimal 5 MB
                    </span>

                    <span
                      className="
                        mt-1
                        text-xs
                        text-gray-400
                      "
                    >
                      Rekomendasi rasio 16:9
                    </span>

                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
                  </label>
                </FormField>

                {/* =================================
                    PREVIEW
                ================================== */}

                {previewUrl && (
                  <div
                    className="
                      relative
                      aspect-video
                      overflow-hidden
                      rounded-2xl
                      border
                      border-gray-200
                      bg-gray-100
                    "
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview gambar berita"
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                      decoding="async"
                    />

                    <div
                      className="
                        absolute
                        bottom-3
                        left-3
                        rounded-lg
                        bg-black/60
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-white
                        backdrop-blur-sm
                      "
                    >
                      Preview
                    </div>
                  </div>
                )}
              </FormSection>
            </div>
          </div>

          {/* =========================================
              FOOTER
          ========================================== */}

          <div
            className="
              flex
              shrink-0
              flex-col-reverse
              gap-2
              border-t
              border-gray-100
              bg-gray-50
              px-5
              py-4

              sm:flex-row
              sm:justify-end
              sm:px-6
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                rounded-xl
                px-5
                py-2.5
                text-sm
                font-semibold
                text-gray-600
                transition-colors

                hover:bg-gray-200

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-600
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-colors

                hover:bg-blue-500

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading ? (
                <>
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />
                  Menyimpan...
                </>
              ) : existingData ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Berita"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================
// FORM COMPONENTS
// =========================================================

const inputClass = `
  w-full
  rounded-xl
  border
  border-gray-200
  bg-white
  px-3.5
  py-3
  text-sm
  text-gray-800
  outline-none
  transition

  placeholder:text-gray-400

  focus:border-blue-400
  focus:ring-4
  focus:ring-blue-100
`;

function FormSection({
  title,
  description,
  children,
}: {
  title: string;

  description: string;

  children: ReactNode;
}) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-gray-100
        bg-gray-50/60
        p-4

        sm:p-5
      "
    >
      <div className="mb-4">
        <h3
          className="
            text-sm
            font-bold
            text-gray-900
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-gray-400
          "
        >
          {description}
        </p>
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;

  required?: boolean;

  children: ReactNode;
}) {
  return (
    <div>
      <label
        className="
          mb-1.5
          block
          text-sm
          font-medium
          text-gray-700
        "
      >
        {label}

        {required && (
          <span
            className="
              ml-1
              text-red-500
            "
          >
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

// =========================================================
// PAGE
// =========================================================

export default function NewsManagement() {
  const [news, setNews] = useState<NewsItem[]>([]);

  const [selectedNews, setSelectedNews] = useState<NewsItem | undefined>(undefined);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("Semua");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =======================================================
  // LOAD NEWS
  // =======================================================

  const loadNews = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const snapshot = await getDocs(newsCollection);

      const newsData = snapshot.docs.map(
        (document) =>
          ({
            ...document.data(),

            id: document.id,
          }) as NewsItem,
      );

      /**
       * Sorting lokal agar data lama
       * yang belum memiliki
       * dateCreatedAt tetap terbaca.
       */
      newsData.sort((a, b) => getNewsTimestamp(b) - getNewsTimestamp(a));

      setNews(newsData);
    } catch (error) {
      console.error("Error fetching news:", error);

      toast.error("Gagal memuat data berita.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // =======================================================
  // FILTER
  // =======================================================

  const filteredNews = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return news.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.titleNews.toLowerCase().includes(keyword) ||
        item.descriptionNews.toLowerCase().includes(keyword) ||
        item.writterNews.toLowerCase().includes(keyword) ||
        item.categoryNews?.toLowerCase().includes(keyword);

      const matchesCategory = categoryFilter === "Semua" || item.categoryNews === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [news, searchTerm, categoryFilter]);

  // =======================================================
  // STATISTICS
  // =======================================================

  const totalCategories = useMemo(() => new Set(news.map((item) => item.categoryNews).filter(Boolean)).size, [news]);

  const totalAuthors = useMemo(() => new Set(news.map((item) => item.writterNews.trim().toLowerCase()).filter(Boolean)).size, [news]);

  // =======================================================
  // DELETE
  // =======================================================

  const handleDelete = async (item: NewsItem) => {
    const confirmed = window.confirm(`Hapus berita "${item.titleNews}"?\n\nBerita akan dihapus permanen dari Firestore.`);

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);

    try {
      await deleteDoc(doc(newsCollection, item.id));

      setNews((currentNews) => currentNews.filter((newsItem) => newsItem.id !== item.id));

      toast.success("Berita berhasil dihapus.");
    } catch (error) {
      console.error("Error deleting news:", error);

      toast.error("Gagal menghapus berita.");
    } finally {
      setDeletingId(null);
    }
  };

  // =======================================================
  // MODAL
  // =======================================================

  const openCreateForm = () => {
    setSelectedNews(undefined);

    setIsFormOpen(true);
  };

  const openEditForm = (item: NewsItem) => {
    setSelectedNews(item);

    setIsFormOpen(true);
  };

  const closeForm = useCallback(() => {
    setIsFormOpen(false);

    setSelectedNews(undefined);
  }, []);

  // =======================================================
  // RENDER
  // =======================================================

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
          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-sm
            "
          >
            {/* =====================================
                HEADER
            ====================================== */}

            <div
              className="
                flex
                flex-col
                gap-5
                border-b
                border-gray-100
                p-5

                sm:p-6

                lg:flex-row
                lg:items-center
                lg:justify-between
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
                  Konten Website
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
                  Manajemen Berita
                </h1>

                <p
                  className="
                    mt-1
                    max-w-2xl
                    text-sm
                    leading-6
                    text-gray-500
                  "
                >
                  Kelola berita dan artikel yang ditampilkan pada website HMPTI.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateForm}
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-colors

                  hover:bg-blue-500

                  sm:w-auto
                "
              >
                <FaPlus className="text-xs" />
                Tambah Berita
              </button>
            </div>

            {/* =====================================
                SUMMARY
            ====================================== */}

            <div
              className="
                grid
                grid-cols-1
                gap-3
                border-b
                border-gray-100
                bg-gray-50/60
                p-4

                sm:grid-cols-3
                sm:p-5
              "
            >
              <SummaryCard icon={<FaNewspaper />} label="Total Berita" value={news.length} />

              <SummaryCard icon={<FaTags />} label="Kategori Aktif" value={totalCategories} />

              <SummaryCard icon={<FaUser />} label="Penulis" value={totalAuthors} />
            </div>

            {/* =====================================
                FILTER
            ====================================== */}

            <div
              className="
                grid
                grid-cols-1
                gap-3
                border-b
                border-gray-100
                p-4

                sm:p-5

                md:grid-cols-[minmax(0,1fr)_220px]
              "
            >
              <div className="relative">
                <FaSearch
                  className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    text-gray-400
                  "
                />

                <input
                  type="search"
                  placeholder="Cari judul, isi, penulis, atau kategori..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    py-2.5
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    transition

                    focus:border-blue-400
                    focus:ring-4
                    focus:ring-blue-100
                  "
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-3.5
                  py-2.5
                  text-sm
                  text-gray-700
                  outline-none
                  transition

                  focus:border-blue-400
                  focus:ring-4
                  focus:ring-blue-100
                "
              >
                <option value="Semua">Semua Kategori</option>

                {NEWS_CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* =====================================
                CONTENT
            ====================================== */}

            <div
              className="
                p-4

                sm:p-5

                lg:p-6
              "
            >
              {loading ? (
                <NewsSkeleton />
              ) : filteredNews.length === 0 ? (
                <EmptyState filtered={Boolean(searchTerm) || categoryFilter !== "Semua"} onCreate={openCreateForm} />
              ) : (
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-5

                    sm:grid-cols-2

                    xl:grid-cols-3
                  "
                >
                  {filteredNews.map((item) => (
                    <NewsAdminCard key={item.id} item={item} deleting={deletingId === item.id} onEdit={() => openEditForm(item)} onDelete={() => handleDelete(item)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================
            FORM
        ========================================== */}

        {isFormOpen && <NewsForm existingData={selectedNews} onClose={closeForm} onSaved={() => loadNews(false)} />}
      </div>
    </AdminLayout>
  );
}

// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;

  label: string;

  value: number;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-xl
        border
        border-gray-100
        bg-white
        p-4
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

      <div>
        <p
          className="
            text-xs
            font-medium
            text-gray-400
          "
        >
          {label}
        </p>

        <p
          className="
            mt-0.5
            text-xl
            font-bold
            text-gray-900
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// =========================================================
// NEWS ADMIN CARD
// =========================================================

function NewsAdminCard({
  item,
  deleting,
  onEdit,
  onDelete,
}: {
  item: NewsItem;

  deleting: boolean;

  onEdit: () => void;

  onDelete: () => void;
}) {
  return (
    <article
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        transition-all
        duration-300

        hover:-translate-y-0.5
        hover:shadow-lg
      "
    >
      {/* =========================================
          IMAGE
      ========================================== */}

      <NewsImage src={item.imageUrl} alt={item.titleNews} />

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
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-2
          "
        >
          <span
            className={`
              inline-flex
              rounded-full
              border
              px-2.5
              py-1
              text-xs
              font-semibold

              ${getCategoryClass(item.categoryNews)}
            `}
          >
            {item.categoryNews ?? "Tanpa Kategori"}
          </span>

          <span
            className="
              inline-flex
              items-center
              gap-1.5
              text-xs
              text-gray-400
            "
          >
            <FaCalendarAlt />

            {formatNewsDate(item.dateCreated)}
          </span>
        </div>

        <h2
          className="
            mt-4
            line-clamp-2
            text-lg
            font-bold
            leading-snug
            text-gray-900
          "
        >
          {item.titleNews}
        </h2>

        <p
          className="
            mt-2
            line-clamp-3
            text-sm
            leading-6
            text-gray-600
          "
        >
          {item.descriptionNews}
        </p>

        {/* =======================================
            FOOTER
        ======================================== */}

        <div
          className="
            mt-auto
            flex
            items-center
            justify-between
            gap-3
            border-t
            border-gray-100
            pt-4
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
            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-gray-100
                text-xs
                text-gray-500
              "
            >
              <FaUser />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-wide
                  text-gray-400
                "
              >
                Penulis
              </p>

              <p
                className="
                  max-w-[160px]
                  truncate
                  text-xs
                  font-semibold
                  text-gray-700
                "
              >
                {item.writterNews}
              </p>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-1
            "
          >
            <button
              type="button"
              onClick={onEdit}
              disabled={deleting}
              title="Edit berita"
              aria-label={`Edit ${item.titleNews}`}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-blue-600
                transition-colors

                hover:bg-blue-50

                disabled:opacity-50
              "
            >
              <FaEdit />
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              title="Hapus berita"
              aria-label={`Hapus ${item.titleNews}`}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-red-600
                transition-colors

                hover:bg-red-50

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {deleting ? (
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-red-200
                    border-t-red-600
                  "
                />
              ) : (
                <FaTrash />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// =========================================================
// NEWS IMAGE
// =========================================================

function NewsImage({
  src,
  alt,
}: {
  src?: string;

  alt: string;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className="
        relative
        aspect-video
        overflow-hidden
        bg-gray-100
      "
    >
      {src && !hasError ? (
        /*
         * Sengaja tidak menggunakan
         * next/image di panel admin.
         *
         * Cloudinary akan dipanggil
         * langsung oleh browser agar
         * tidak melalui /_next/image.
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
            transition-transform
            duration-500

            group-hover:scale-[1.025]
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
            from-blue-50
            to-gray-100
          "
        >
          <FaImage
            className="
              text-3xl
              text-gray-300
            "
          />
        </div>
      )}
    </div>
  );
}

// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
  filtered,
  onCreate,
}: {
  filtered: boolean;

  onCreate: () => void;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-dashed
        border-gray-200
        bg-gray-50
        px-5
        py-14
        text-center
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
          bg-white
          text-gray-400
          shadow-sm
        "
      >
        <FaSearch />
      </div>

      <h3
        className="
          mt-4
          text-lg
          font-bold
          text-gray-800
        "
      >
        {filtered ? "Berita Tidak Ditemukan" : "Belum Ada Berita"}
      </h3>

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
        {filtered ? "Tidak ada berita yang sesuai dengan pencarian atau kategori yang dipilih." : "Tambahkan berita pertama untuk mulai menampilkan artikel pada website HMPTI."}
      </p>

      {!filtered && (
        <button
          type="button"
          onClick={onCreate}
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
          <FaPlus className="text-xs" />
          Tambah Berita
        </button>
      )}
    </div>
  );
}

// =========================================================
// SKELETON
// =========================================================

function NewsSkeleton() {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-5

        sm:grid-cols-2

        xl:grid-cols-3
      "
    >
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
            "
        >
          <div
            className="
                aspect-video
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
                  flex
                  justify-between
                  gap-3
                "
            >
              <div
                className="
                    h-6
                    w-24
                    animate-pulse
                    rounded-full
                    bg-gray-100
                  "
              />

              <div
                className="
                    h-4
                    w-24
                    animate-pulse
                    rounded
                    bg-gray-100
                  "
              />
            </div>

            <div
              className="
                  h-5
                  w-4/5
                  animate-pulse
                  rounded
                  bg-gray-200
                "
            />

            <div
              className="
                  h-4
                  animate-pulse
                  rounded
                  bg-gray-100
                "
            />

            <div
              className="
                  h-4
                  w-5/6
                  animate-pulse
                  rounded
                  bg-gray-100
                "
            />

            <div
              className="
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

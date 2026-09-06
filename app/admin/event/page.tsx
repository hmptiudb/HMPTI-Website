"use client";

import { eventsCollection } from "@/lib/firebase";

import { Timestamp, addDoc, deleteDoc, deleteField, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";

import { type ChangeEvent, type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import Image from "next/image";

import { FaCalendarAlt, FaClock, FaEdit, FaExternalLinkAlt, FaImage, FaMapMarkerAlt, FaPlus, FaSearch, FaTimes, FaTrash, FaUsers } from "react-icons/fa";

import { toast } from "react-toastify";

import { uploadToCloudinary } from "../../../app/api/upload";

import AdminLayout from "../AdminLayout";

// =========================================================
// TYPES
// =========================================================

interface Event {
  id: string;

  eventName: string;

  /**
   * Dipertahankan untuk kompatibilitas
   * dengan data event lama.
   */
  dateEvent: string;

  /**
   * Field tanggal baru.
   *
   * Digunakan untuk sorting tanggal
   * dengan benar.
   */
  dateEventAt?: Timestamp;

  timeEvent?: string;

  imageUrl: string;

  descriptionEvent: string;

  statusEvent?: string;

  linkForm?: string;

  categoryAudiens?: string;

  categoryEvent?: string;

  organizer?: string;

  location?: string;

  capacity?: number | null;

  createdAt?: Timestamp;

  updatedAt?: Timestamp;
}

// =========================================================
// CONSTANTS
// =========================================================

const EVENT_STATUS_OPTIONS = ["Coming Soon", "Sedang Berlangsung", "Selesai", "Pending", "Batal"];

const EVENT_CATEGORY_OPTIONS = [
  "Web Development",
  "UI/UX",
  "Web Design",
  "Graphic Design",
  "Mobile Development",
  "Data Science",
  "Internet of Things",
  "Big Data",
  "Cyber Security",
  "Workshop",
  "Seminar",
  "Competition",
  "Pendaftaran HMPTI",
];

const AUDIENCE_OPTIONS = ["Mahasiswa", "SMA/SMK", "Umum", "Mahasiswa UDB"];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// =========================================================
// DATE HELPERS
// =========================================================

function createValidatedDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day, 12, 0, 0);

  /**
   * Mencegah tanggal tidak valid
   * seperti 31 Februari.
   */
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

function parseDateValue(value?: string): Date | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  // =======================================================
  // FORMAT BARU
  // YYYY-MM-DD
  // =======================================================

  const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;

    return createValidatedDate(Number(year), Number(month), Number(day));
  }

  // =======================================================
  // FORMAT LAMA
  // DD/MM/YYYY
  // DD-MM-YYYY
  // =======================================================

  const legacyMatch = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (legacyMatch) {
    const [, day, month, year] = legacyMatch;

    return createValidatedDate(Number(year), Number(month), Number(day));
  }

  // =======================================================
  // FALLBACK
  // =======================================================

  const fallback = new Date(normalized);

  if (Number.isNaN(fallback.getTime())) {
    return null;
  }

  return fallback;
}

function normalizeDateInput(value?: string) {
  if (!value) {
    return "";
  }

  /**
   * Sudah sesuai format
   * input type="date".
   */
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = parseDateValue(value);

  if (!date) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  const date = parseDateValue(value);

  if (!date) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getEventTimestamp(event: Event) {
  /**
   * Prioritaskan Timestamp baru.
   */
  if (event.dateEventAt && typeof event.dateEventAt.toMillis === "function") {
    return event.dateEventAt.toMillis();
  }

  /**
   * Fallback event lama.
   */
  return parseDateValue(event.dateEvent)?.getTime() ?? 0;
}

// =========================================================
// STATUS HELPERS
// =========================================================

function normalizeStatus(status?: string) {
  const normalized = status?.trim().toLowerCase();

  /**
   * Mendukung typo/status lama.
   */
  if (normalized === "cooming soon" || normalized === "coming soon") {
    return "Coming Soon";
  }

  if (normalized === "berlangsung" || normalized === "sedang berlangsung") {
    return "Sedang Berlangsung";
  }

  if (normalized === "selesai") {
    return "Selesai";
  }

  if (normalized === "batal") {
    return "Batal";
  }

  if (normalized === "pending") {
    return "Pending";
  }

  return "Coming Soon";
}

function getStatusClass(status?: string) {
  const normalizedStatus = normalizeStatus(status);

  switch (normalizedStatus) {
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
// URL HELPER
// =========================================================

function isValidHttpUrl(value: string) {
  try {
    const parsedUrl = new URL(value);

    return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
  } catch {
    return false;
  }
}

// =========================================================
// EVENT FORM
// =========================================================

function EventForm({
  existingData,
  onClose,
  onSaved,
}: {
  existingData?: Event;

  onClose: () => void;

  onSaved: () => Promise<void>;
}) {
  const [eventName, setEventName] = useState(existingData?.eventName ?? "");

  const [dateEvent, setDateEvent] = useState(normalizeDateInput(existingData?.dateEvent));

  const [timeEvent, setTimeEvent] = useState(existingData?.timeEvent ?? "");

  const [descriptionEvent, setDescriptionEvent] = useState(existingData?.descriptionEvent ?? "");

  const [statusEvent, setStatusEvent] = useState(normalizeStatus(existingData?.statusEvent));

  const [categoryAudiens, setCategoryAudiens] = useState(existingData?.categoryAudiens ?? "Mahasiswa");

  const [categoryEvent, setCategoryEvent] = useState(existingData?.categoryEvent ?? "Web Development");

  const [linkForm, setLinkForm] = useState(existingData?.linkForm ?? "");

  const [organizer, setOrganizer] = useState(existingData?.organizer ?? "HMPTI Universitas Duta Bangsa");

  const [location, setLocation] = useState(existingData?.location ?? "");

  const [capacity, setCapacity] = useState(typeof existingData?.capacity === "number" ? String(existingData.capacity) : "");

  const [image, setImage] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(existingData?.imageUrl ?? null);

  const [loading, setLoading] = useState(false);

  // =======================================================
  // LOCK BODY SCROLL
  // =======================================================

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // =======================================================
  // IMAGE PREVIEW
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
  // ESC CLOSE
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
  // IMAGE CHANGE
  // =======================================================

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setImage(null);

      setPreviewUrl(existingData?.imageUrl ?? null);

      return;
    }

    // =====================================================
    // TYPE
    // =====================================================

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format gambar harus JPG, PNG, atau WEBP.");

      event.target.value = "";

      return;
    }

    // =====================================================
    // SIZE
    // =====================================================

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Ukuran gambar maksimal 5 MB.");

      event.target.value = "";

      return;
    }

    setImage(file);
  };

  // =======================================================
  // CAPACITY CHANGE
  // =======================================================

  const handleCapacityChange = (event: ChangeEvent<HTMLInputElement>) => {
    /**
     * Hanya mengizinkan angka.
     *
     * Kita tidak menggunakan
     * type="number" agar browser
     * tidak menampilkan spinner.
     */
    const value = event.target.value.replace(/\D/g, "");

    setCapacity(value);
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

    const trimmedName = eventName.trim();

    const trimmedDescription = descriptionEvent.trim();

    const trimmedLink = linkForm.trim();

    const trimmedOrganizer = organizer.trim();

    const trimmedLocation = location.trim();

    const trimmedTime = timeEvent.trim();

    // =====================================================
    // REQUIRED
    // =====================================================

    if (!trimmedName || !dateEvent || !trimmedDescription) {
      toast.error("Nama, tanggal, dan deskripsi event wajib diisi.");

      return;
    }

    // =====================================================
    // IMAGE REQUIRED ON CREATE
    // =====================================================

    if (!existingData?.imageUrl && !image) {
      toast.error("Silakan upload gambar event.");

      return;
    }

    // =====================================================
    // LINK
    // =====================================================

    if (trimmedLink && !isValidHttpUrl(trimmedLink)) {
      toast.error("Link pendaftaran tidak valid. Gunakan URL http atau https.");

      return;
    }

    // =====================================================
    // CAPACITY
    // =====================================================

    const capacityValue = capacity.trim() ? Number(capacity) : null;

    if (capacityValue !== null && (!Number.isInteger(capacityValue) || capacityValue < 1)) {
      toast.error("Kapasitas peserta tidak valid.");

      return;
    }

    // =====================================================
    // DATE
    // =====================================================

    const parsedDate = parseDateValue(dateEvent);

    if (!parsedDate) {
      toast.error("Tanggal event tidak valid.");

      return;
    }

    setLoading(true);

    try {
      let imageUrl = existingData?.imageUrl ?? "";

      // ===================================================
      // CLOUDINARY
      // ===================================================

      if (image) {
        const uploadedImageUrl = await uploadToCloudinary(image);

        if (!uploadedImageUrl) {
          throw new Error("Gagal mengunggah gambar.");
        }

        imageUrl = uploadedImageUrl;
      }

      // ===================================================
      // DATA
      // ===================================================

      const eventData = {
        eventName: trimmedName,

        /**
         * Dipertahankan untuk
         * kompatibilitas kode/data lama.
         */
        dateEvent,

        /**
         * Timestamp yang digunakan
         * untuk sistem baru.
         */
        dateEventAt: Timestamp.fromDate(parsedDate),

        timeEvent: trimmedTime,

        descriptionEvent: trimmedDescription,

        statusEvent,

        linkForm: trimmedLink,

        categoryAudiens,

        categoryEvent,

        organizer: trimmedOrganizer,

        location: trimmedLocation,

        capacity: capacityValue,

        imageUrl,

        updatedAt: serverTimestamp(),
      };

      // ===================================================
      // UPDATE
      // ===================================================

      if (existingData) {
        await updateDoc(doc(eventsCollection, existingData.id), {
          ...eventData,

          /**
           * Hapus field lama Highlights
           * jika event sebelumnya pernah
           * menyimpannya.
           */
          highlights: deleteField(),
        });

        toast.success("Event berhasil diperbarui.");
      }

      // ===================================================
      // CREATE
      // ===================================================
      else {
        await addDoc(eventsCollection, {
          ...eventData,

          createdAt: serverTimestamp(),

          /**
           * Dipertahankan sementara
           * untuk kompatibilitas
           * kode lama.
           */
          dateCreated: new Date().toISOString(),
        });

        toast.success("Event berhasil ditambahkan.");
      }

      await onSaved();

      onClose();
    } catch (error) {
      console.error("Error saving event:", error);

      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan event.");
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
      aria-labelledby="event-form-title"
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
              Manajemen Event
            </p>

            <h2
              id="event-form-title"
              className="
                mt-1
                text-xl
                font-bold
                text-gray-900

                sm:text-2xl
              "
            >
              {existingData ? "Edit Event" : "Tambah Event"}
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

              <FormSection title="Informasi Utama" description="Informasi dasar yang akan ditampilkan pada halaman event.">
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4

                    md:grid-cols-2
                  "
                >
                  <FormField label="Nama Event" required>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(event) => setEventName(event.target.value)}
                      placeholder="Contoh: Workshop UI/UX 2026"
                      className={inputClass}
                      required
                    />
                  </FormField>

                  <FormField label="Tanggal Pelaksanaan" required>
                    <input type="date" value={dateEvent} onChange={(event) => setDateEvent(event.target.value)} className={inputClass} required />
                  </FormField>

                  <FormField label="Waktu">
                    <input type="time" value={timeEvent} onChange={(event) => setTimeEvent(event.target.value)} className={inputClass} />

                    <p
                      className="
                        mt-1.5
                        text-xs
                        leading-5
                        text-gray-400
                      "
                    >
                      Opsional. Isi jika event memiliki waktu pelaksanaan yang sudah ditentukan.
                    </p>
                  </FormField>

                  <FormField label="Kapasitas Peserta">
                    <input type="text" inputMode="numeric" pattern="[0-9]*" value={capacity} onChange={handleCapacityChange} placeholder="Contoh: 100" className={inputClass} />

                    <p
                      className="
                        mt-1.5
                        text-xs
                        leading-5
                        text-gray-400
                      "
                    >
                      Opsional. Kosongkan jika jumlah peserta tidak dibatasi.
                    </p>
                  </FormField>
                </div>

                <FormField label="Deskripsi Event" required>
                  <textarea
                    value={descriptionEvent}
                    onChange={(event) => setDescriptionEvent(event.target.value)}
                    placeholder="Jelaskan event, tujuan, dan informasi penting lainnya..."
                    rows={6}
                    className={`
                      ${inputClass}
                      resize-y
                    `}
                    required
                  />
                </FormField>
              </FormSection>

              {/* ===================================
                  DETAIL EVENT
              ==================================== */}

              <FormSection title="Detail Event" description="Atur status, kategori, target audiens, lokasi, dan penyelenggara event.">
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4

                    md:grid-cols-2
                  "
                >
                  <FormField label="Status Event" required>
                    <select value={statusEvent} onChange={(event) => setStatusEvent(event.target.value)} className={inputClass} required>
                      {EVENT_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Kategori Event" required>
                    <select value={categoryEvent} onChange={(event) => setCategoryEvent(event.target.value)} className={inputClass} required>
                      {EVENT_CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Kategori Audiens" required>
                    <select value={categoryAudiens} onChange={(event) => setCategoryAudiens(event.target.value)} className={inputClass} required>
                      {AUDIENCE_OPTIONS.map((audience) => (
                        <option key={audience} value={audience}>
                          {audience}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Penyelenggara">
                    <input
                      type="text"
                      value={organizer}
                      onChange={(event) => setOrganizer(event.target.value)}
                      placeholder="Contoh: HMPTI Universitas Duta Bangsa"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Lokasi">
                    <input
                      type="text"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="Contoh: Aula Fikom Universitas Duta Bangsa"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Link Pendaftaran">
                    <input type="url" value={linkForm} onChange={(event) => setLinkForm(event.target.value)} placeholder="https://forms.gle/..." className={inputClass} />

                    <p
                      className="
                        mt-1.5
                        text-xs
                        leading-5
                        text-gray-400
                      "
                    >
                      Boleh dikosongkan jika event tidak memiliki formulir pendaftaran.
                    </p>
                  </FormField>
                </div>
              </FormSection>

              {/* ===================================
                  IMAGE
              ==================================== */}

              <FormSection title="Gambar Event" description="Gunakan gambar landscape agar tampil optimal pada halaman daftar dan detail event.">
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
                        text-sm
                        font-semibold
                        text-gray-700
                      "
                    >
                      {image ? image.name : existingData ? "Pilih gambar baru" : "Pilih gambar event"}
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
                      w-full
                      overflow-hidden
                      rounded-2xl
                      border
                      border-gray-200
                      bg-gray-100
                    "
                  >
                    {previewUrl.startsWith("blob:") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Preview gambar event"
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />
                    ) : (
                      <Image src={previewUrl} alt="Preview gambar event" fill sizes="700px" className="object-cover" />
                    )}

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
                      Preview Gambar
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
                transition-all

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
                "Tambah Event"
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

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
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

function FormField({ label, required = false, children }: { label: string; required?: boolean; children: ReactNode }) {
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

export default function EventTable() {
  const [events, setEvents] = useState<Event[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("Semua");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =======================================================
  // LOAD DATA
  // =======================================================

  const loadEvents = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const snapshot = await getDocs(eventsCollection);

      const eventsData = snapshot.docs.map(
        (document) =>
          ({
            ...document.data(),

            id: document.id,
          }) as Event,
      );

      /**
       * Tetap mendukung event lama
       * yang belum memiliki
       * dateEventAt.
       */
      const sortedEvents = [...eventsData].sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a));

      setEvents(sortedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);

      toast.error("Gagal memuat data event.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // =======================================================
  // FILTER
  // =======================================================

  const filteredEvents = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !keyword ||
        event.eventName.toLowerCase().includes(keyword) ||
        event.descriptionEvent.toLowerCase().includes(keyword) ||
        event.categoryEvent?.toLowerCase().includes(keyword) ||
        event.categoryAudiens?.toLowerCase().includes(keyword) ||
        event.location?.toLowerCase().includes(keyword) ||
        event.organizer?.toLowerCase().includes(keyword);

      const matchesStatus = statusFilter === "Semua" || normalizeStatus(event.statusEvent) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchTerm, statusFilter]);

  // =======================================================
  // DELETE
  // =======================================================

  const handleDelete = async (eventItem: Event) => {
    const confirmed = window.confirm(`Hapus event "${eventItem.eventName}"?\n\nTindakan ini tidak dapat dibatalkan.`);

    if (!confirmed) {
      return;
    }

    setDeletingId(eventItem.id);

    try {
      await deleteDoc(doc(eventsCollection, eventItem.id));

      setEvents((currentEvents) => currentEvents.filter((item) => item.id !== eventItem.id));

      toast.success("Event berhasil dihapus.");
    } catch (error) {
      console.error("Error deleting event:", error);

      toast.error("Gagal menghapus event.");
    } finally {
      setDeletingId(null);
    }
  };

  // =======================================================
  // MODAL
  // =======================================================

  const openCreateForm = () => {
    setSelectedEvent(undefined);

    setIsFormOpen(true);
  };

  const openEditForm = (event: Event) => {
    setSelectedEvent(event);

    setIsFormOpen(true);
  };

  const closeForm = useCallback(() => {
    setIsFormOpen(false);

    setSelectedEvent(undefined);
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
                gap-4
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
                  Manajemen Event
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
                  Kelola kegiatan yang ditampilkan pada website HMPTI.
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
                Tambah Event
              </button>
            </div>

            {/* =====================================
                TOOLBAR
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
                  placeholder="Cari nama, kategori, audiens, lokasi, atau penyelenggara..."
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
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
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
                <option value="Semua">Semua Status</option>

                {EVENT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
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
                <EventAdminSkeleton />
              ) : filteredEvents.length === 0 ? (
                <EmptyState filtered={Boolean(searchTerm) || statusFilter !== "Semua"} onCreate={openCreateForm} />
              ) : (
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-5

                    md:grid-cols-2

                    xl:grid-cols-3
                  "
                >
                  {filteredEvents.map((event) => (
                    <AdminEventCard key={event.id} event={event} deleting={deletingId === event.id} onEdit={() => openEditForm(event)} onDelete={() => handleDelete(event)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================
            MODAL
        ========================================== */}

        {isFormOpen && <EventForm existingData={selectedEvent} onClose={closeForm} onSaved={() => loadEvents(false)} />}
      </div>
    </AdminLayout>
  );
}

// =========================================================
// ADMIN EVENT CARD
// =========================================================

function AdminEventCard({
  event,
  deleting,
  onEdit,
  onDelete,
}: {
  event: Event;

  deleting: boolean;

  onEdit: () => void;

  onDelete: () => void;
}) {
  const normalizedStatus = normalizeStatus(event.statusEvent);

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

      <div
        className="
          relative
          aspect-video
          overflow-hidden
          bg-gray-100
        "
      >
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.eventName}
            fill
            sizes="
              (max-width: 767px) 100vw,
              (max-width: 1279px) 50vw,
              33vw
            "
            className="
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
              items-center
              justify-center
              bg-gray-100
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

        <div
          className="
            absolute
            right-3
            top-3
          "
        >
          <span
            className={`
              rounded-full
              border
              px-2.5
              py-1
              text-[11px]
              font-semibold

              ${getStatusClass(normalizedStatus)}
            `}
          >
            {normalizedStatus}
          </span>
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
        <h3
          className="
            line-clamp-2
            text-lg
            font-bold
            leading-snug
            text-gray-900
          "
        >
          {event.eventName}
        </h3>

        {/* =======================================
            DATE / TIME
        ======================================== */}

        <div
          className="
            mt-3
            flex
            flex-wrap
            gap-x-4
            gap-y-2
            text-xs
            text-gray-500
          "
        >
          <span
            className="
              inline-flex
              items-center
              gap-1.5
            "
          >
            <FaCalendarAlt className="text-blue-500" />

            {formatDate(event.dateEvent)}
          </span>

          {event.timeEvent && (
            <span
              className="
                inline-flex
                items-center
                gap-1.5
              "
            >
              <FaClock className="text-blue-500" />

              {event.timeEvent}
            </span>
          )}
        </div>

        {/* =======================================
            LOCATION
        ======================================== */}

        {event.location && (
          <div
            className="
              mt-2
              flex
              items-start
              gap-1.5
              text-xs
              leading-5
              text-gray-500
            "
          >
            <FaMapMarkerAlt
              className="
                mt-0.5
                shrink-0
                text-red-400
              "
            />

            <span
              className="
                line-clamp-2
              "
            >
              {event.location}
            </span>
          </div>
        )}

        {/* =======================================
            DESCRIPTION
        ======================================== */}

        <p
          className="
            mt-3
            line-clamp-3
            text-sm
            leading-6
            text-gray-600
          "
        >
          {event.descriptionEvent}
        </p>

        {/* =======================================
            TAGS
        ======================================== */}

        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          {event.categoryEvent && (
            <span
              className="
                rounded-full
                bg-blue-50
                px-2.5
                py-1
                text-xs
                font-medium
                text-blue-700
              "
            >
              {event.categoryEvent}
            </span>
          )}

          {event.categoryAudiens && (
            <span
              className="
                rounded-full
                bg-purple-50
                px-2.5
                py-1
                text-xs
                font-medium
                text-purple-700
              "
            >
              {event.categoryAudiens}
            </span>
          )}

          {typeof event.capacity === "number" && (
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-gray-100
                px-2.5
                py-1
                text-xs
                font-medium
                text-gray-600
              "
            >
              <FaUsers />
              {event.capacity} peserta
            </span>
          )}
        </div>

        {/* =========================================
            ACTIONS
        ========================================== */}

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
          {event.linkForm ? (
            <a
              href={event.linkForm}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex
                items-center
                gap-1.5
                text-xs
                font-semibold
                text-blue-600

                hover:text-blue-700
              "
            >
              Link Pendaftaran
              <FaExternalLinkAlt className="text-[10px]" />
            </a>
          ) : (
            <span
              className="
                text-xs
                text-gray-400
              "
            >
              Tanpa link pendaftaran
            </span>
          )}

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
              aria-label={`Edit ${event.eventName}`}
              title="Edit"
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
              aria-label={`Hapus ${event.eventName}`}
              title="Hapus"
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
        {filtered ? "Event Tidak Ditemukan" : "Belum Ada Event"}
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
        {filtered ? "Tidak ada event yang sesuai dengan pencarian atau filter yang dipilih." : "Tambahkan event pertama untuk mulai menampilkan kegiatan pada website HMPTI."}
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

            hover:bg-blue-500
          "
        >
          <FaPlus className="text-xs" />
          Tambah Event
        </button>
      )}
    </div>
  );
}

// =========================================================
// SKELETON
// =========================================================

function EventAdminSkeleton() {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-5

        md:grid-cols-2

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
                  h-5
                  w-3/4
                  animate-pulse
                  rounded
                  bg-gray-200
                "
            />

            <div
              className="
                  h-4
                  w-1/2
                  animate-pulse
                  rounded
                  bg-gray-100
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
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { membersCollection } from "@/lib/firebase";

import { addDoc, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where, type Timestamp } from "firebase/firestore";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";

import { FaEdit, FaEnvelope, FaGithub, FaImage, FaInstagram, FaPlus, FaSearch, FaTimes, FaTrash, FaUser, FaUsers } from "react-icons/fa";

import { toast } from "react-toastify";

import { uploadToCloudinary } from "../../../app/api/upload";

import AdminLayout from "../AdminLayout";

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

  bio?: string;
  motto?: string;

  skills?: string[];
  talents?: string[];

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// =========================================================
// CONSTANTS
// =========================================================

const DIVISION_OPTIONS = [
  {
    value: "Ketua",
    label: "Ketua",
  },
  {
    value: "Wakil",
    label: "Wakil Ketua",
  },
  {
    value: "Sekretaris",
    label: "Sekretaris",
  },
  {
    value: "Bendahara",
    label: "Bendahara",
  },
  {
    value: "Riset&Teknologi",
    label: "Riset & Teknologi",
  },
  {
    value: "Kominfo",
    label: "Kominfo",
  },
  {
    value: "Minat&Bakat",
    label: "Minat & Bakat",
  },
  {
    value: "Humas",
    label: "Humas",
  },
];

const STATUS_OPTIONS = ["Aktif", "Tidak Aktif"];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// =========================================================
// HELPERS
// =========================================================

function getDivisionLabel(division?: string) {
  return DIVISION_OPTIONS.find((item) => item.value === division)?.label ?? division ?? "-";
}

function getPositionOptions(division: string) {
  if (division === "Ketua") {
    return ["Ketua"];
  }

  if (division === "Wakil") {
    return ["Wakil Ketua"];
  }

  return ["Koordinator", "Anggota"];
}

function getDefaultPosition(division: string) {
  if (division === "Ketua") {
    return "Ketua";
  }

  if (division === "Wakil") {
    return "Wakil Ketua";
  }

  return "Anggota";
}

function normalizePosition(division: string, position?: string) {
  const allowedPositions = getPositionOptions(division);

  if (position && allowedPositions.includes(position)) {
    return position;
  }

  return getDefaultPosition(division);
}

function getStatusClass(status?: string) {
  if (status === "Aktif") {
    return `
      border-green-100
      bg-green-50
      text-green-700
    `;
  }

  return `
    border-red-100
    bg-red-50
    text-red-700
  `;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseListInput(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

// =========================================================
// MEMBER FORM
// =========================================================

function MemberForm({
  existingData,
  onClose,
  onSaved,
}: {
  existingData?: Member;

  onClose: () => void;

  onSaved: () => Promise<void>;
}) {
  const initialDivision = existingData?.division ?? "Sekretaris";

  const [nim, setNim] = useState(existingData?.nim ?? "");

  const [name, setName] = useState(existingData?.name ?? "");

  const [division, setDivision] = useState(initialDivision);

  const [position, setPosition] = useState(normalizePosition(initialDivision, existingData?.position));

  const [status, setStatus] = useState(existingData?.status ?? "Aktif");

  const [linkInstagram, setLinkInstagram] = useState(existingData?.linkInstagram ?? "");

  const [linkGithub, setLinkGithub] = useState(existingData?.linkGithub ?? "");

  const [email, setEmail] = useState(existingData?.email ?? "");

  const [bio, setBio] = useState(existingData?.bio ?? "");

  const [motto, setMotto] = useState(existingData?.motto ?? "");

  const [skillsText, setSkillsText] = useState(existingData?.skills?.join("\n") ?? "");

  const [talentsText, setTalentsText] = useState(existingData?.talents?.join("\n") ?? "");

  const [image, setImage] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(existingData?.imageUrl ?? null);

  const [loading, setLoading] = useState(false);

  const positionOptions = useMemo(() => getPositionOptions(division), [division]);

  const isLeadership = division === "Ketua" || division === "Wakil";

  const isMinatBakat = division === "Minat&Bakat";

  // =======================================================
  // LOCK BACKGROUND SCROLL
  // =======================================================

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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
  // DIVISION CHANGE
  // =======================================================

  const handleDivisionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newDivision = event.target.value;

    setDivision(newDivision);

    setPosition(getDefaultPosition(newDivision));
  };

  // =======================================================
  // NIM
  // =======================================================

  const handleNimChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "");

    setNim(value);
  };

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
  // DUPLICATE NIM
  // =======================================================

  const checkDuplicateNim = async (targetNim: string) => {
    const nimQuery = query(membersCollection, where("nim", "==", targetNim));

    const snapshot = await getDocs(nimQuery);

    return snapshot.docs.some((document) => document.id !== existingData?.id);
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
    // CLEAN VALUES
    // =====================================================

    const trimmedNim = nim.trim();

    const trimmedName = name.trim();

    const trimmedInstagram = linkInstagram.trim();

    const trimmedGithub = linkGithub.trim();

    const trimmedEmail = email.trim();

    const trimmedBio = bio.trim();

    const trimmedMotto = motto.trim();

    // =====================================================
    // REQUIRED
    // =====================================================

    if (!trimmedNim || !trimmedName || !division || !position) {
      toast.error("NIM, nama, divisi, dan jabatan wajib diisi.");

      return;
    }

    // =====================================================
    // NIM VALIDATION
    // =====================================================

    if (!/^\d+$/.test(trimmedNim)) {
      toast.error("NIM hanya boleh berisi angka.");

      return;
    }

    // =====================================================
    // IMAGE REQUIRED
    // =====================================================

    if (!existingData?.imageUrl && !image) {
      toast.error("Silakan upload foto anggota.");

      return;
    }

    // =====================================================
    // INSTAGRAM
    // =====================================================

    if (trimmedInstagram && !isValidHttpUrl(trimmedInstagram)) {
      toast.error("Link Instagram tidak valid.");

      return;
    }

    // =====================================================
    // GITHUB
    // =====================================================

    if (trimmedGithub && !isValidHttpUrl(trimmedGithub)) {
      toast.error("Link GitHub tidak valid.");

      return;
    }

    // =====================================================
    // EMAIL
    // =====================================================

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      toast.error("Format email tidak valid.");

      return;
    }

    setLoading(true);

    try {
      // ===================================================
      // DUPLICATE NIM
      // ===================================================

      const nimAlreadyExists = await checkDuplicateNim(trimmedNim);

      if (nimAlreadyExists) {
        toast.error("NIM sudah digunakan oleh anggota lain.");

        return;
      }

      // ===================================================
      // IMAGE UPLOAD
      // ===================================================

      let imageUrl = existingData?.imageUrl ?? "";

      if (image) {
        const uploadedImageUrl = await uploadToCloudinary(image);

        if (!uploadedImageUrl) {
          throw new Error("Gagal mengunggah foto anggota.");
        }

        imageUrl = uploadedImageUrl;
      }

      // ===================================================
      // LISTS
      // ===================================================

      const skills = parseListInput(skillsText);

      const talents = isMinatBakat ? parseListInput(talentsText) : [];

      // ===================================================
      // DATA
      // ===================================================

      const memberData = {
        nim: trimmedNim,

        name: trimmedName,

        division,

        position,

        status,

        linkInstagram: trimmedInstagram,

        linkGithub: trimmedGithub,

        email: trimmedEmail,

        bio: trimmedBio,

        motto: isLeadership ? trimmedMotto : "",

        skills,

        talents,

        imageUrl,

        updatedAt: serverTimestamp(),
      };

      // ===================================================
      // UPDATE
      // ===================================================

      if (existingData) {
        await updateDoc(doc(membersCollection, existingData.id), memberData);

        toast.success("Data anggota berhasil diperbarui.");
      }

      // ===================================================
      // CREATE
      // ===================================================
      else {
        await addDoc(membersCollection, {
          ...memberData,

          createdAt: serverTimestamp(),

          dateCreated: new Date().toISOString(),
        });

        toast.success("Anggota berhasil ditambahkan.");
      }

      await onSaved();

      onClose();
    } catch (error) {
      console.error("Error saving member:", error);

      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan anggota.");
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
      aria-labelledby="member-form-title"
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
              Manajemen Anggota
            </p>

            <h2
              id="member-form-title"
              className="
                mt-1
                text-xl
                font-bold
                text-gray-900

                sm:text-2xl
              "
            >
              {existingData ? "Edit Anggota" : "Tambah Anggota"}
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
                  DATA UTAMA
              ==================================== */}

              <FormSection title="Data Utama" description="Identitas utama anggota yang digunakan pada halaman kepengurusan.">
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4

                    md:grid-cols-2
                  "
                >
                  <FormField label="NIM" required>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={nim}
                      onChange={handleNimChange}
                      placeholder="Contoh: 230103197"
                      className={inputClass}
                      required
                    />

                    {existingData && (
                      <p
                        className="
                          mt-1.5
                          text-xs
                          leading-5
                          text-gray-400
                        "
                      >
                        NIM dapat diperbaiki jika sebelumnya terdapat kesalahan data.
                      </p>
                    )}
                  </FormField>

                  <FormField label="Nama Lengkap" required>
                    <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama lengkap anggota" className={inputClass} required />
                  </FormField>

                  <FormField label="Divisi" required>
                    <select value={division} onChange={handleDivisionChange} className={inputClass} required>
                      {DIVISION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Jabatan" required>
                    <select value={position} onChange={(event) => setPosition(event.target.value)} className={inputClass} required disabled={positionOptions.length === 1}>
                      {positionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    {isLeadership && (
                      <p
                        className="
                          mt-1.5
                          text-xs
                          leading-5
                          text-gray-400
                        "
                      >
                        Jabatan otomatis mengikuti posisi kepemimpinan.
                      </p>
                    )}
                  </FormField>

                  <FormField label="Status Kepengurusan" required>
                    <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass} required>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Email">
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" className={inputClass} />
                  </FormField>
                </div>
              </FormSection>

              {/* ===================================
                  PROFIL ANGGOTA
              ==================================== */}

              <FormSection title="Profil Anggota" description="Informasi tambahan yang dapat ditampilkan pada halaman publik.">
                <FormField label="Bio">
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    placeholder="Tuliskan deskripsi singkat mengenai anggota..."
                    rows={4}
                    className={`
                      ${inputClass}
                      resize-y
                    `}
                  />
                </FormField>

                {isLeadership && (
                  <FormField label="Motto">
                    <textarea
                      value={motto}
                      onChange={(event) => setMotto(event.target.value)}
                      placeholder="Motto Ketua atau Wakil Ketua..."
                      rows={3}
                      className={`
                        ${inputClass}
                        resize-y
                      `}
                    />
                  </FormField>
                )}

                {!isMinatBakat && (
                  <FormField label="Keahlian / Skills">
                    <textarea
                      value={skillsText}
                      onChange={(event) => setSkillsText(event.target.value)}
                      placeholder={`Leadership
Public Speaking
Web Development`}
                      rows={4}
                      className={`
                        ${inputClass}
                        resize-y
                      `}
                    />

                    <p
                      className="
                        mt-1.5
                        text-xs
                        leading-5
                        text-gray-400
                      "
                    >
                      Tulis satu keahlian pada setiap baris.
                    </p>
                  </FormField>
                )}

                {isMinatBakat && (
                  <FormField label="Minat / Bakat">
                    <textarea
                      value={talentsText}
                      onChange={(event) => setTalentsText(event.target.value)}
                      placeholder={`Musik
Public Speaking
Olahraga`}
                      rows={4}
                      className={`
                        ${inputClass}
                        resize-y
                      `}
                    />

                    <p
                      className="
                        mt-1.5
                        text-xs
                        leading-5
                        text-gray-400
                      "
                    >
                      Khusus anggota Divisi Minat & Bakat. Tulis satu item pada setiap baris.
                    </p>
                  </FormField>
                )}
              </FormSection>

              {/* ===================================
                  SOCIAL MEDIA
              ==================================== */}

              <FormSection title="Kontak & Media Sosial" description="Semua field pada bagian ini bersifat opsional.">
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4

                    md:grid-cols-2
                  "
                >
                  <FormField label="Instagram">
                    <input
                      type="url"
                      value={linkInstagram}
                      onChange={(event) => setLinkInstagram(event.target.value)}
                      placeholder="https://instagram.com/username"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="GitHub">
                    <input type="url" value={linkGithub} onChange={(event) => setLinkGithub(event.target.value)} placeholder="https://github.com/username" className={inputClass} />
                  </FormField>
                </div>
              </FormSection>

              {/* ===================================
                  FOTO
              ==================================== */}

              <FormSection title="Foto Anggota" description="Gunakan foto portrait yang jelas agar hasil pada halaman fungsionaris lebih optimal.">
                <FormField label={existingData ? "Ganti Foto" : "Upload Foto"} required={!existingData}>
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
                      {image ? image.name : existingData ? "Pilih foto baru" : "Pilih foto anggota"}
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
                      Rekomendasi foto portrait rasio 4:5
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
                      mx-auto
                      w-full
                      max-w-[240px]
                    "
                  >
                    <div
                      className="
                        relative
                        aspect-[4/5]
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
                        alt="Preview foto anggota"
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                        decoding="async"
                      />
                    </div>

                    <p
                      className="
                        mt-2
                        text-center
                        text-xs
                        text-gray-400
                      "
                    >
                      Preview foto
                    </p>
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
                "Tambah Anggota"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================
// SHARED FORM COMPONENTS
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

  disabled:cursor-not-allowed
  disabled:bg-gray-100
  disabled:text-gray-500
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

export default function MembersTable() {
  const [members, setMembers] = useState<Member[]>([]);

  const [selectedMember, setSelectedMember] = useState<Member | undefined>(undefined);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [divisionFilter, setDivisionFilter] = useState("Semua");

  const [statusFilter, setStatusFilter] = useState("Semua");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =======================================================
  // LOAD DATA
  // =======================================================

  const loadMembers = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const snapshot = await getDocs(membersCollection);

      const membersData = snapshot.docs.map(
        (document) =>
          ({
            ...document.data(),

            id: document.id,
          }) as Member,
      );

      membersData.sort((a, b) => a.name.localeCompare(b.name, "id"));

      setMembers(membersData);
    } catch (error) {
      console.error("Error fetching members:", error);

      toast.error("Gagal memuat data anggota.");
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // =======================================================
  // FILTER
  // =======================================================

  const filteredMembers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !keyword ||
        member.name.toLowerCase().includes(keyword) ||
        member.nim.toLowerCase().includes(keyword) ||
        member.division?.toLowerCase().includes(keyword) ||
        member.position?.toLowerCase().includes(keyword);

      const matchesDivision = divisionFilter === "Semua" || member.division === divisionFilter;

      const matchesStatus = statusFilter === "Semua" || member.status === statusFilter;

      return matchesSearch && matchesDivision && matchesStatus;
    });
  }, [members, searchTerm, divisionFilter, statusFilter]);

  // =======================================================
  // STATISTICS
  // =======================================================

  const activeMembers = useMemo(() => members.filter((member) => member.status === "Aktif").length, [members]);

  const coordinators = useMemo(() => members.filter((member) => member.position === "Koordinator").length, [members]);

  // =======================================================
  // DELETE
  // =======================================================

  const handleDelete = async (member: Member) => {
    const confirmed = window.confirm(`Hapus anggota "${member.name}"?\n\nData anggota akan dihapus permanen dari Firestore.`);

    if (!confirmed) {
      return;
    }

    setDeletingId(member.id);

    try {
      await deleteDoc(doc(membersCollection, member.id));

      setMembers((currentMembers) => currentMembers.filter((item) => item.id !== member.id));

      toast.success("Anggota berhasil dihapus.");
    } catch (error) {
      console.error("Error deleting member:", error);

      toast.error("Gagal menghapus anggota.");
    } finally {
      setDeletingId(null);
    }
  };

  // =======================================================
  // MODAL
  // =======================================================

  const openAddForm = () => {
    setSelectedMember(undefined);

    setIsFormOpen(true);
  };

  const openEditForm = (member: Member) => {
    setSelectedMember(member);

    setIsFormOpen(true);
  };

  const closeForm = useCallback(() => {
    setIsFormOpen(false);

    setSelectedMember(undefined);
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
                  Kepengurusan
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
                  Manajemen Anggota
                </h1>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-gray-500
                  "
                >
                  Kelola data pengurus dan anggota yang ditampilkan pada halaman fungsionaris.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddForm}
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
                Tambah Anggota
              </button>
            </div>

            {/* =====================================
                STATS
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
              <SummaryCard icon={<FaUsers />} label="Total Anggota" value={members.length} />

              <SummaryCard icon={<FaUser />} label="Anggota Aktif" value={activeMembers} />

              <SummaryCard icon={<FaUsers />} label="Koordinator" value={coordinators} />
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

                lg:grid-cols-[minmax(0,1fr)_220px_180px]
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
                  placeholder="Cari nama, NIM, divisi, atau jabatan..."
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
                value={divisionFilter}
                onChange={(event) => setDivisionFilter(event.target.value)}
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
                <option value="Semua">Semua Divisi</option>

                {DIVISION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

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

                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
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
              {isLoading ? (
                <MembersSkeleton />
              ) : filteredMembers.length === 0 ? (
                <EmptyState filtered={Boolean(searchTerm) || divisionFilter !== "Semua" || statusFilter !== "Semua"} onAdd={openAddForm} />
              ) : (
                <>
                  {/* ===============================
                      MOBILE / TABLET
                  ================================ */}

                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-4

                      sm:grid-cols-2

                      lg:hidden
                    "
                  >
                    {filteredMembers.map((member) => (
                      <MobileMemberCard
                        key={member.id}
                        member={member}
                        deleting={deletingId === member.id}
                        onEdit={() => openEditForm(member)}
                        onDelete={() => handleDelete(member)}
                      />
                    ))}
                  </div>

                  {/* ===============================
                      DESKTOP
                  ================================ */}

                  <div
                    className="
                      hidden
                      overflow-hidden
                      rounded-xl
                      border
                      border-gray-200

                      lg:block
                    "
                  >
                    <table
                      className="
                        min-w-full
                        divide-y
                        divide-gray-200
                      "
                    >
                      <thead className="bg-gray-50">
                        <tr>
                          <TableHeading>Anggota</TableHeading>

                          <TableHeading>Divisi</TableHeading>

                          <TableHeading>Jabatan</TableHeading>

                          <TableHeading>Status</TableHeading>

                          <TableHeading>Kontak</TableHeading>

                          <TableHeading align="right">Aksi</TableHeading>
                        </tr>
                      </thead>

                      <tbody
                        className="
                          divide-y
                          divide-gray-100
                          bg-white
                        "
                      >
                        {filteredMembers.map((member) => (
                          <MemberTableRow
                            key={member.id}
                            member={member}
                            deleting={deletingId === member.id}
                            onEdit={() => openEditForm(member)}
                            onDelete={() => handleDelete(member)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* =========================================
            MODAL
        ========================================== */}

        {isFormOpen && <MemberForm existingData={selectedMember} onClose={closeForm} onSaved={() => loadMembers(false)} />}
      </div>
    </AdminLayout>
  );
}

// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
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
// TABLE HEADING
// =========================================================

function TableHeading({
  children,
  align = "left",
}: {
  children: ReactNode;

  align?: "left" | "right";
}) {
  return (
    <th
      className={`
        px-5
        py-3.5
        text-xs
        font-semibold
        uppercase
        tracking-[0.08em]
        text-gray-500

        ${align === "right" ? "text-right" : "text-left"}
      `}
    >
      {children}
    </th>
  );
}

// =========================================================
// MEMBER TABLE ROW
// =========================================================

function MemberTableRow({
  member,
  deleting,
  onEdit,
  onDelete,
}: {
  member: Member;

  deleting: boolean;

  onEdit: () => void;

  onDelete: () => void;
}) {
  return (
    <tr
      className="
        align-middle
        transition-colors

        hover:bg-gray-50
      "
    >
      {/* MEMBER */}

      <td className="px-5 py-4">
        <div
          className="
            flex
            min-w-[220px]
            items-center
            gap-3
          "
        >
          <MemberAvatar member={member} size="small" />

          <div className="min-w-0">
            <p
              className="
                max-w-[220px]
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
                text-xs
                text-gray-500
              "
            >
              {member.nim}
            </p>
          </div>
        </div>
      </td>

      {/* DIVISION */}

      <td
        className="
          px-5
          py-4
          text-sm
          text-gray-600
        "
      >
        {getDivisionLabel(member.division)}
      </td>

      {/* POSITION */}

      <td
        className="
          px-5
          py-4
        "
      >
        <span
          className="
            inline-flex
            rounded-full
            bg-blue-50
            px-2.5
            py-1
            text-xs
            font-medium
            text-blue-700
          "
        >
          {member.position ?? "-"}
        </span>
      </td>

      {/* STATUS */}

      <td
        className="
          px-5
          py-4
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

            ${getStatusClass(member.status)}
          `}
        >
          {member.status ?? "Tidak Aktif"}
        </span>
      </td>

      {/* CONTACT */}

      <td
        className="
          px-5
          py-4
        "
      >
        <MemberSocialLinks member={member} />
      </td>

      {/* ACTION */}

      <td
        className="
          px-5
          py-4
          text-right
        "
      >
        <div
          className="
            flex
            items-center
            justify-end
            gap-1
          "
        >
          <button
            type="button"
            onClick={onEdit}
            disabled={deleting}
            title="Edit anggota"
            aria-label={`Edit ${member.name}`}
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
            title="Hapus anggota"
            aria-label={`Hapus ${member.name}`}
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
      </td>
    </tr>
  );
}

// =========================================================
// MOBILE MEMBER CARD
// =========================================================

function MobileMemberCard({
  member,
  deleting,
  onEdit,
  onDelete,
}: {
  member: Member;

  deleting: boolean;

  onEdit: () => void;

  onDelete: () => void;
}) {
  return (
    <article
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-4
      "
    >
      <div
        className="
          flex
          items-start
          gap-3
        "
      >
        <MemberAvatar member={member} size="large" />

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <p
            className="
              truncate
              font-semibold
              text-gray-900
            "
          >
            {member.name}
          </p>

          <p
            className="
              mt-0.5
              text-xs
              text-gray-500
            "
          >
            NIM: {member.nim}
          </p>

          <div
            className="
              mt-2
              flex
              flex-wrap
              gap-1.5
            "
          >
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
              {getDivisionLabel(member.division)}
            </span>

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
              {member.position ?? "-"}
            </span>
          </div>
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

            ${getStatusClass(member.status)}
          `}
        >
          {member.status ?? "Tidak Aktif"}
        </span>
      </div>

      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          gap-3
          border-t
          border-gray-100
          pt-4
        "
      >
        <MemberSocialLinks member={member} />

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
            aria-label={`Edit ${member.name}`}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-blue-50
              text-blue-600

              disabled:opacity-50
            "
          >
            <FaEdit />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            aria-label={`Hapus ${member.name}`}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-red-50
              text-red-600

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
    </article>
  );
}

// =========================================================
// AVATAR
// =========================================================

function MemberAvatar({
  member,
  size,
}: {
  member: Member;

  size: "small" | "large";
}) {
  const dimensions = size === "large" ? "h-14 w-14" : "h-11 w-11";

  return (
    <div
      className={`
        relative
        shrink-0
        overflow-hidden
        rounded-xl
        bg-gray-100

        ${dimensions}
      `}
    >
      {member.imageUrl ? (
        /*
         * Sengaja menggunakan IMG biasa di Admin.
         *
         * Jangan gunakan next/image di sini.
         * Tujuannya agar foto Cloudinary langsung
         * diambil browser dan tidak melewati:
         *
         * /_next/image
         *
         * yang sebelumnya menyebabkan TimeoutError.
         */

        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.imageUrl}
          alt={member.name}
          loading="lazy"
          decoding="async"
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
            bg-blue-50
            font-bold
            text-blue-600
          "
        >
          {member.name?.charAt(0).toUpperCase() || "?"}
        </div>
      )}
    </div>
  );
}

// =========================================================
// SOCIAL LINKS
// =========================================================

function MemberSocialLinks({ member }: { member: Member }) {
  const hasLinks = member.linkInstagram || member.linkGithub || member.email;

  if (!hasLinks) {
    return (
      <span
        className="
          text-xs
          text-gray-400
        "
      >
        Belum ada kontak
      </span>
    );
  }

  return (
    <div
      className="
        flex
        items-center
        gap-1.5
      "
    >
      {member.linkInstagram && (
        <a
          href={member.linkInstagram}
          target="_blank"
          rel="noopener noreferrer"
          title="Instagram"
          aria-label={`Instagram ${member.name}`}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            bg-pink-50
            text-pink-600
            transition-colors

            hover:bg-pink-100
          "
        >
          <FaInstagram />
        </a>
      )}

      {member.linkGithub && (
        <a
          href={member.linkGithub}
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
          aria-label={`GitHub ${member.name}`}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            bg-gray-100
            text-gray-700
            transition-colors

            hover:bg-gray-200
          "
        >
          <FaGithub />
        </a>
      )}

      {member.email && (
        <a
          href={`mailto:${member.email}`}
          title="Email"
          aria-label={`Email ${member.name}`}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            bg-blue-50
            text-blue-600
            transition-colors

            hover:bg-blue-100
          "
        >
          <FaEnvelope />
        </a>
      )}
    </div>
  );
}

// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
  filtered,
  onAdd,
}: {
  filtered: boolean;

  onAdd: () => void;
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
        {filtered ? "Anggota Tidak Ditemukan" : "Belum Ada Anggota"}
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
        {filtered ? "Tidak ada anggota yang sesuai dengan pencarian atau filter yang dipilih." : "Tambahkan anggota untuk mulai mengelola data kepengurusan HMPTI."}
      </p>

      {!filtered && (
        <button
          type="button"
          onClick={onAdd}
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
          Tambah Anggota
        </button>
      )}
    </div>
  );
}

// =========================================================
// SKELETON
// =========================================================

function MembersSkeleton() {
  return (
    <>
      {/* MOBILE */}

      <div
        className="
          grid
          grid-cols-1
          gap-4

          sm:grid-cols-2

          lg:hidden
        "
      >
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="
                animate-pulse
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-4
              "
          >
            <div
              className="
                  flex
                  items-center
                  gap-3
                "
            >
              <div
                className="
                    h-14
                    w-14
                    rounded-xl
                    bg-gray-200
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
                      h-4
                      w-2/3
                      rounded
                      bg-gray-200
                    "
                />

                <div
                  className="
                      h-3
                      w-1/3
                      rounded
                      bg-gray-100
                    "
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP */}

      <div
        className="
          hidden
          overflow-hidden
          rounded-xl
          border
          border-gray-200

          lg:block
        "
      >
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="
                flex
                animate-pulse
                items-center
                gap-5
                border-b
                border-gray-100
                px-5
                py-4

                last:border-b-0
              "
          >
            <div
              className="
                  h-11
                  w-11
                  rounded-xl
                  bg-gray-200
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
                    h-4
                    w-40
                    rounded
                    bg-gray-200
                  "
              />

              <div
                className="
                    h-3
                    w-24
                    rounded
                    bg-gray-100
                  "
              />
            </div>

            <div
              className="
                  h-7
                  w-24
                  rounded-full
                  bg-gray-100
                "
            />

            <div
              className="
                  h-7
                  w-20
                  rounded-full
                  bg-gray-100
                "
            />
          </div>
        ))}
      </div>
    </>
  );
}

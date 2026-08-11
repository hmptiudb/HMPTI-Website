"use client";

import { uploadToCloudinary } from "@/app/api/upload";
import { productsCollection } from "@/lib/firebase";

import { addDoc, deleteDoc, doc, getDocs, serverTimestamp, updateDoc, type Timestamp } from "firebase/firestore";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";

import { FaBox, FaEdit, FaImage, FaMoneyBillWave, FaPlus, FaSearch, FaTimes, FaTrash, FaWhatsapp } from "react-icons/fa";

import { toast } from "react-toastify";

import AdminLayout from "../AdminLayout";

// =========================================================
// TYPES
// =========================================================

interface Product {
  id: string;

  imageUrl: string;

  productName: string;

  /**
   * Tetap string agar kompatibel
   * dengan halaman publik lama.
   *
   * Isi yang disimpan berupa angka:
   * "50000"
   */
  priceProduct: string;

  descriptionProduct: string;

  whatsappNumber: string;

  /**
   * Field lama.
   */
  dateCreated?: string;

  /**
   * Field timestamp baru.
   */
  createdAt?: Timestamp;

  updatedAt?: Timestamp;
}

// =========================================================
// CONSTANTS
// =========================================================

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Terbaru",
  },
  {
    value: "oldest",
    label: "Terlama",
  },
  {
    value: "name-asc",
    label: "Nama A - Z",
  },
  {
    value: "name-desc",
    label: "Nama Z - A",
  },
  {
    value: "price-asc",
    label: "Harga Terendah",
  },
  {
    value: "price-desc",
    label: "Harga Tertinggi",
  },
];

// =========================================================
// PRICE HELPERS
// =========================================================

function parsePriceValue(value?: string) {
  if (!value) {
    return 0;
  }

  /**
   * Mendukung data lama seperti:
   *
   * 50000
   * Rp50.000
   * 50.000
   */
  const digits = String(value).replace(/\D/g, "");

  if (!digits) {
    return 0;
  }

  const number = Number(digits);

  return Number.isFinite(number) ? number : 0;
}

function normalizePriceInput(value?: string) {
  if (!value) {
    return "";
  }

  return String(value).replace(/\D/g, "");
}

function formatPrice(value: string) {
  const price = parsePriceValue(value);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatPriceInput(value: string) {
  if (!value) {
    return "";
  }

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Number(value));
}

// =========================================================
// WHATSAPP HELPERS
// =========================================================

function sanitizeWhatsappInput(value: string) {
  /**
   * Form boleh menampilkan +,
   * tetapi data yang disimpan nanti
   * dinormalisasi menjadi angka.
   */
  return value.replace(/[^0-9+]/g, "");
}

function normalizeWhatsappNumber(value: string) {
  let digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  /**
   * Format Indonesia:
   *
   * 0812...
   * menjadi
   * 62812...
   */
  if (digits.startsWith("0")) {
    digits = `62${digits.slice(1)}`;
  } else if (digits.startsWith("8")) {

  /**
   * Jika admin menulis:
   * 812...
   *
   * otomatis:
   * 62812...
   */
    digits = `62${digits}`;
  }

  return digits;
}

function getWhatsappUrl(number: string, productName?: string) {
  const normalizedNumber = normalizeWhatsappNumber(number);

  if (normalizedNumber.length < 9) {
    return null;
  }

  const message = productName ? `Halo, saya tertarik dengan produk ${productName}. Bisa minta informasi lebih lanjut?` : "Halo, saya ingin meminta informasi lebih lanjut.";

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}

// =========================================================
// DATE HELPER
// =========================================================

function getProductTimestamp(product: Product) {
  if (product.createdAt && typeof product.createdAt.toMillis === "function") {
    return product.createdAt.toMillis();
  }

  if (product.dateCreated) {
    const date = new Date(product.dateCreated);

    if (!Number.isNaN(date.getTime())) {
      return date.getTime();
    }
  }

  return 0;
}

// =========================================================
// PRODUCT FORM
// =========================================================

function ProductForm({
  existingData,
  onClose,
  onSaved,
}: {
  existingData?: Product;

  onClose: () => void;

  onSaved: () => Promise<void>;
}) {
  const [productName, setProductName] = useState(existingData?.productName ?? "");

  const [priceProduct, setPriceProduct] = useState(normalizePriceInput(existingData?.priceProduct));

  const [descriptionProduct, setDescriptionProduct] = useState(existingData?.descriptionProduct ?? "");

  const [whatsappNumber, setWhatsappNumber] = useState(existingData?.whatsappNumber ?? "");

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
  // PRICE CHANGE
  // =======================================================

  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "");

    setPriceProduct(value);
  };

  // =======================================================
  // WHATSAPP CHANGE
  // =======================================================

  const handleWhatsappChange = (event: ChangeEvent<HTMLInputElement>) => {
    setWhatsappNumber(sanitizeWhatsappInput(event.target.value));
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

    const trimmedName = productName.trim();

    const trimmedDescription = descriptionProduct.trim();

    const normalizedPrice = normalizePriceInput(priceProduct);

    const normalizedWhatsapp = normalizeWhatsappNumber(whatsappNumber);

    // =====================================================
    // REQUIRED
    // =====================================================

    if (!trimmedName || !normalizedPrice || !trimmedDescription || !normalizedWhatsapp) {
      toast.error("Nama, harga, deskripsi, dan nomor WhatsApp wajib diisi.");

      return;
    }

    // =====================================================
    // PRICE
    // =====================================================

    const priceValue = Number(normalizedPrice);

    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      toast.error("Harga produk tidak valid.");

      return;
    }

    // =====================================================
    // WHATSAPP
    // =====================================================

    if (normalizedWhatsapp.length < 9) {
      toast.error("Nomor WhatsApp tidak valid.");

      return;
    }

    // =====================================================
    // IMAGE REQUIRED
    // =====================================================

    if (!existingData?.imageUrl && !image) {
      toast.error("Silakan upload gambar produk.");

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
          throw new Error("Gagal mengunggah gambar produk.");
        }

        imageUrl = uploadedImageUrl;
      }

      // ===================================================
      // COMMON DATA
      // ===================================================

      const productData = {
        productName: trimmedName,

        /**
         * Tetap string untuk kompatibilitas
         * public page.
         */
        priceProduct: normalizedPrice,

        descriptionProduct: trimmedDescription,

        /**
         * Disimpan dalam format
         * internasional.
         */
        whatsappNumber: normalizedWhatsapp,

        imageUrl,

        updatedAt: serverTimestamp(),
      };

      // ===================================================
      // UPDATE
      // ===================================================

      if (existingData) {
        await updateDoc(doc(productsCollection, existingData.id), productData);

        toast.success("Produk berhasil diperbarui.");
      }

      // ===================================================
      // CREATE
      // ===================================================
      else {
        await addDoc(productsCollection, {
          ...productData,

          /**
           * Timestamp baru.
           */
          createdAt: serverTimestamp(),

          /**
           * Field lama tetap disimpan
           * agar kode publik lama
           * tetap kompatibel.
           */
          dateCreated: new Date().toISOString(),
        });

        toast.success("Produk berhasil ditambahkan.");
      }

      await onSaved();

      onClose();
    } catch (error) {
      console.error("Error saving product:", error);

      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan produk.");
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
      aria-labelledby="product-form-title"
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
              Manajemen Produk
            </p>

            <h2
              id="product-form-title"
              className="
                mt-1
                text-xl
                font-bold
                text-gray-900

                sm:text-2xl
              "
            >
              {existingData ? "Edit Produk" : "Tambah Produk"}
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
                  INFORMASI PRODUK
              ==================================== */}

              <FormSection title="Informasi Produk" description="Informasi utama produk yang akan ditampilkan pada website.">
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4

                    md:grid-cols-2
                  "
                >
                  <FormField label="Nama Produk" required>
                    <input
                      type="text"
                      value={productName}
                      onChange={(event) => setProductName(event.target.value)}
                      placeholder="Contoh: Kaos HMPTI"
                      className={inputClass}
                      required
                    />
                  </FormField>

                  <FormField label="Harga Produk" required>
                    <div className="relative">
                      <span
                        className="
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          -translate-y-1/2
                          text-sm
                          font-medium
                          text-gray-500
                        "
                      >
                        Rp
                      </span>

                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={priceProduct ? formatPriceInput(priceProduct) : ""}
                        onChange={handlePriceChange}
                        placeholder="50.000"
                        className={`
                          ${inputClass}
                          pl-10
                        `}
                        required
                      />
                    </div>

                    <p
                      className="
                        mt-1.5
                        text-xs
                        text-gray-400
                      "
                    >
                      Masukkan angka saja. Format rupiah dibuat otomatis.
                    </p>
                  </FormField>
                </div>

                <FormField label="Nomor WhatsApp" required>
                  <div className="relative">
                    <FaWhatsapp
                      className="
                        pointer-events-none
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        text-green-600
                      "
                    />

                    <input
                      type="tel"
                      inputMode="tel"
                      value={whatsappNumber}
                      onChange={handleWhatsappChange}
                      placeholder="081234567890"
                      className={`
                        ${inputClass}
                        pl-10
                      `}
                      required
                    />
                  </div>

                  <p
                    className="
                      mt-1.5
                      text-xs
                      leading-5
                      text-gray-400
                    "
                  >
                    Bisa menggunakan format 0812..., 62812..., atau +62812....
                  </p>
                </FormField>

                <FormField label="Deskripsi Produk" required>
                  <textarea
                    value={descriptionProduct}
                    onChange={(event) => setDescriptionProduct(event.target.value)}
                    placeholder="Jelaskan produk secara singkat dan jelas..."
                    rows={6}
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
                      {descriptionProduct.length} karakter
                    </span>
                  </div>
                </FormField>
              </FormSection>

              {/* ===================================
                  IMAGE
              ==================================== */}

              <FormSection title="Gambar Produk" description="Gunakan foto produk yang jelas dan memiliki pencahayaan yang baik.">
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
                      {image ? image.name : existingData ? "Pilih gambar baru" : "Pilih gambar produk"}
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
                      Rekomendasi rasio 4:3 atau 1:1
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
                      mx-auto
                      aspect-[4/3]
                      w-full
                      max-w-xl
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
                      alt="Preview gambar produk"
                      decoding="async"
                      className="
                        h-full
                        w-full
                        object-cover
                      "
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
                "Tambah Produk"
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

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
}

// =========================================================
// PAGE
// =========================================================

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [sortBy, setSortBy] = useState("newest");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =======================================================
  // LOAD PRODUCTS
  // =======================================================

  const loadProducts = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const snapshot = await getDocs(productsCollection);

      const productsData = snapshot.docs.map(
        (document) =>
          ({
            ...document.data(),

            id: document.id,
          }) as Product,
      );

      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);

      toast.error("Gagal memuat data produk.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // =======================================================
  // FILTER + SORT
  // =======================================================

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    const result = products.filter((product) => {
      return (
        !keyword ||
        product.productName.toLowerCase().includes(keyword) ||
        product.descriptionProduct.toLowerCase().includes(keyword) ||
        product.whatsappNumber?.toLowerCase().includes(keyword)
      );
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return getProductTimestamp(a) - getProductTimestamp(b);

        case "name-asc":
          return a.productName.localeCompare(b.productName, "id");

        case "name-desc":
          return b.productName.localeCompare(a.productName, "id");

        case "price-asc":
          return parsePriceValue(a.priceProduct) - parsePriceValue(b.priceProduct);

        case "price-desc":
          return parsePriceValue(b.priceProduct) - parsePriceValue(a.priceProduct);

        case "newest":
        default:
          return getProductTimestamp(b) - getProductTimestamp(a);
      }
    });

    return result;
  }, [products, searchTerm, sortBy]);

  // =======================================================
  // STATS
  // =======================================================

  const productsWithWhatsapp = useMemo(() => products.filter((product) => normalizeWhatsappNumber(product.whatsappNumber).length >= 9).length, [products]);

  const highestPrice = useMemo(() => {
    if (products.length === 0) {
      return 0;
    }

    return Math.max(...products.map((product) => parsePriceValue(product.priceProduct)));
  }, [products]);

  // =======================================================
  // WHATSAPP
  // =======================================================

  const openWhatsapp = (product: Product) => {
    const url = getWhatsappUrl(product.whatsappNumber, product.productName);

    if (!url) {
      toast.error("Nomor WhatsApp produk tidak valid.");

      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // =======================================================
  // DELETE
  // =======================================================

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Hapus produk "${product.productName}"?\n\nProduk akan dihapus permanen dari Firestore.`);

    if (!confirmed) {
      return;
    }

    setDeletingId(product.id);

    try {
      await deleteDoc(doc(productsCollection, product.id));

      setProducts((currentProducts) => currentProducts.filter((item) => item.id !== product.id));

      if (detailProduct?.id === product.id) {
        setDetailProduct(null);
      }

      toast.success("Produk berhasil dihapus.");
    } catch (error) {
      console.error("Error deleting product:", error);

      toast.error("Gagal menghapus produk.");
    } finally {
      setDeletingId(null);
    }
  };

  // =======================================================
  // MODAL
  // =======================================================

  const openCreateForm = () => {
    setSelectedProduct(undefined);

    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setDetailProduct(null);

    setSelectedProduct(product);

    setIsFormOpen(true);
  };

  const closeForm = useCallback(() => {
    setIsFormOpen(false);

    setSelectedProduct(undefined);
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
                  Manajemen Produk
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
                  Kelola produk yang ditampilkan pada website HMPTI dan terhubung dengan WhatsApp.
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
                Tambah Produk
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
              <SummaryCard icon={<FaBox />} label="Total Produk" value={products.length.toString()} />

              <SummaryCard icon={<FaWhatsapp />} label="WhatsApp Aktif" value={productsWithWhatsapp.toString()} />

              <SummaryCard icon={<FaMoneyBillWave />} label="Harga Tertinggi" value={formatPrice(String(highestPrice))} compact />
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
                  placeholder="Cari nama atau deskripsi produk..."
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
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
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
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                <ProductsSkeleton />
              ) : filteredProducts.length === 0 ? (
                <EmptyState filtered={Boolean(searchTerm)} onCreate={openCreateForm} />
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
                  {filteredProducts.map((product) => (
                    <ProductAdminCard
                      key={product.id}
                      product={product}
                      deleting={deletingId === product.id}
                      onView={() => setDetailProduct(product)}
                      onEdit={() => openEditForm(product)}
                      onDelete={() => handleDelete(product)}
                      onWhatsapp={() => openWhatsapp(product)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================
            PRODUCT FORM
        ========================================== */}

        {isFormOpen && <ProductForm existingData={selectedProduct} onClose={closeForm} onSaved={() => loadProducts(false)} />}

        {/* =========================================
            DETAIL
        ========================================== */}

        {detailProduct && (
          <ProductDetailModal
            product={detailProduct}
            onClose={() => setDetailProduct(null)}
            onEdit={() => openEditForm(detailProduct)}
            onWhatsapp={() => openWhatsapp(detailProduct)}
          />
        )}
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
  compact = false,
}: {
  icon: ReactNode;

  label: string;

  value: string;

  compact?: boolean;
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

      <div className="min-w-0">
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
          className={`
            mt-0.5
            truncate
            font-bold
            text-gray-900

            ${compact ? "text-base sm:text-lg" : "text-xl"}
          `}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// =========================================================
// PRODUCT CARD
// =========================================================

function ProductAdminCard({
  product,
  deleting,
  onView,
  onEdit,
  onDelete,
  onWhatsapp,
}: {
  product: Product;

  deleting: boolean;

  onView: () => void;

  onEdit: () => void;

  onDelete: () => void;

  onWhatsapp: () => void;
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

      <button
        type="button"
        onClick={onView}
        aria-label={`Lihat detail ${product.productName}`}
        className="
          relative
          aspect-[4/3]
          w-full
          overflow-hidden
          bg-gray-100
          text-left
        "
      >
        <ProductImage src={product.imageUrl} alt={product.productName} />

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
      </button>

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
        <h2
          className="
            line-clamp-2
            text-lg
            font-bold
            leading-snug
            text-gray-900
          "
        >
          {product.productName}
        </h2>

        <p
          className="
            mt-2
            text-xl
            font-bold
            text-blue-600
          "
        >
          {formatPrice(product.priceProduct)}
        </p>

        <p
          className="
            mt-3
            line-clamp-3
            text-sm
            leading-6
            text-gray-600
          "
        >
          {product.descriptionProduct}
        </p>

        {/* =======================================
            ACTIONS
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
          <button
            type="button"
            onClick={onWhatsapp}
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              bg-green-50
              px-3
              py-2
              text-xs
              font-semibold
              text-green-700
              transition-colors

              hover:bg-green-100
            "
          >
            <FaWhatsapp />
            Hubungi
          </button>

          <div
            className="
              flex
              items-center
              gap-1
            "
          >
            <button
              type="button"
              onClick={onView}
              className="
                rounded-lg
                px-3
                py-2
                text-xs
                font-semibold
                text-gray-500
                transition-colors

                hover:bg-gray-100
                hover:text-gray-700
              "
            >
              Detail
            </button>

            <button
              type="button"
              onClick={onEdit}
              disabled={deleting}
              aria-label={`Edit ${product.productName}`}
              title="Edit produk"
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
              aria-label={`Hapus ${product.productName}`}
              title="Hapus produk"
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
// PRODUCT IMAGE
// =========================================================

function ProductImage({
  src,
  alt,
}: {
  src?: string;

  alt: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
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
    );
  }

  return (
    /*
     * Panel admin sengaja menggunakan
     * img biasa agar Cloudinary tidak
     * melewati Next Image Optimizer.
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
  );
}

// =========================================================
// PRODUCT DETAIL
// =========================================================

function ProductDetailModal({
  product,
  onClose,
  onEdit,
  onWhatsapp,
}: {
  product: Product;

  onClose: () => void;

  onEdit: () => void;

  onWhatsapp: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
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
          max-w-2xl
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
              Produk
            </p>

            <h2
              id="product-detail-title"
              className="
                mt-1
                text-xl
                font-bold
                text-gray-900
              "
            >
              Detail Produk
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail produk"
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
            "
          >
            <FaTimes />
          </button>
        </div>

        {/* =========================================
            CONTENT
        ========================================== */}

        <div
          className="
            flex-1
            overflow-y-auto
            p-5

            sm:p-6
          "
        >
          <div
            className="
              relative
              aspect-[4/3]
              overflow-hidden
              rounded-2xl
              bg-gray-100
            "
          >
            <ProductImage src={product.imageUrl} alt={product.productName} />
          </div>

          <div className="mt-6">
            <h3
              className="
                text-2xl
                font-bold
                leading-tight
                text-gray-900

                sm:text-3xl
              "
            >
              {product.productName}
            </h3>

            <p
              className="
                mt-2
                text-2xl
                font-bold
                text-blue-600
              "
            >
              {formatPrice(product.priceProduct)}
            </p>

            <div
              className="
                mt-5
                border-t
                border-gray-100
                pt-5
              "
            >
              <p
                className="
                  whitespace-pre-line
                  text-sm
                  leading-7
                  text-gray-600

                  sm:text-base
                "
              >
                {product.descriptionProduct}
              </p>
            </div>
          </div>
        </div>

        {/* =========================================
            ACTION
        ========================================== */}

        <div
          className="
            flex
            shrink-0
            flex-col
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
            onClick={onEdit}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-gray-200
              bg-white
              px-5
              py-2.5
              text-sm
              font-semibold
              text-gray-700
              transition-colors

              hover:bg-gray-100
            "
          >
            <FaEdit />
            Edit Produk
          </button>

          <button
            type="button"
            onClick={onWhatsapp}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-green-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition-colors

              hover:bg-green-500
            "
          >
            <FaWhatsapp />
            Hubungi via WhatsApp
          </button>
        </div>
      </div>
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
        {filtered ? "Produk Tidak Ditemukan" : "Belum Ada Produk"}
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
        {filtered ? "Tidak ada produk yang sesuai dengan pencarian." : "Tambahkan produk pertama untuk mulai menampilkan produk pada website HMPTI."}
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
          Tambah Produk
        </button>
      )}
    </div>
  );
}

// =========================================================
// SKELETON
// =========================================================

function ProductsSkeleton() {
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
                aspect-[4/3]
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
                  h-6
                  w-32
                  animate-pulse
                  rounded
                  bg-blue-50
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

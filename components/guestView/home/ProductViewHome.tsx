"use client";

import { productsCollection } from "@/lib/firebase";

import {
  getDocs,
  type Timestamp,
} from "firebase/firestore";

import {
  MotionConfig,
  motion,
} from "framer-motion";

import Image from "next/image";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiMessageSquare,
  FiRefreshCw,
  FiShoppingBag,
} from "react-icons/fi";

import { IoCartOutline } from "react-icons/io5";


// =========================================================
// TYPES
// =========================================================

interface ProductItem {
  id: string;
  imageUrl: string;
  productName: string;
  priceProduct: string;
  descriptionProduct: string;
  whatsappNumber: string;
  dateCreated?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}


// =========================================================
// CONSTANTS
// =========================================================

const HOME_PRODUCT_LIMIT = 6;

const AUTO_PLAY_DELAY = 6000;

const PRODUCT_BENEFITS = [
  "Mendorong kreativitas dan keterampilan mahasiswa",
  "Mengembangkan kemandirian serta jiwa kewirausahaan",
  "Menghasilkan produk yang memiliki nilai dan manfaat",
];


// =========================================================
// DATE HELPERS
// =========================================================

function parseLegacyDate(
  value?: string,
): Date | null {
  if (!value) {
    return null;
  }

  const normalized =
    value.trim();

  if (!normalized) {
    return null;
  }

  const date =
    new Date(normalized);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date;
}


function getProductTimestamp(
  product: ProductItem,
) {
  if (
    product.createdAt &&
    typeof product.createdAt.toMillis ===
      "function"
  ) {
    return product.createdAt.toMillis();
  }

  const legacyDate =
    parseLegacyDate(
      product.dateCreated,
    );

  return (
    legacyDate?.getTime() ??
    0
  );
}


// =========================================================
// PRICE HELPERS
// =========================================================

function parsePriceValue(
  value?: string,
) {
  if (!value) {
    return 0;
  }

  const digits =
    String(value).replace(
      /\D/g,
      "",
    );

  if (!digits) {
    return 0;
  }

  const numericValue =
    Number(digits);

  return Number.isFinite(
    numericValue,
  )
    ? numericValue
    : 0;
}


function formatPrice(
  value?: string,
) {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  ).format(
    parsePriceValue(
      value,
    ),
  );
}


// =========================================================
// WHATSAPP HELPERS
// =========================================================

function normalizeWhatsappNumber(
  value?: string,
) {
  if (!value) {
    return "";
  }

  let number =
    value.replace(
      /\D/g,
      "",
    );

  if (!number) {
    return "";
  }

  // 08... -> 628...
  if (
    number.startsWith("0")
  ) {
    number =
      `62${number.slice(1)}`;
  }

  // 8... -> 628...
  else if (
    number.startsWith("8")
  ) {
    number =
      `62${number}`;
  }

  return number;
}


function getWhatsappUrl(
  product: ProductItem,
) {
  const number =
    normalizeWhatsappNumber(
      product.whatsappNumber,
    );

  if (
    number.length < 9
  ) {
    return null;
  }

  const message =
    `Halo, saya tertarik dengan produk ${product.productName}. Bisa minta informasi lebih lanjut?`;

  return (
    `https://wa.me/${number}` +
    `?text=${encodeURIComponent(
      message,
    )}`
  );
}


// =========================================================
// MAIN COMPONENT
// =========================================================

export default function ProductViewHome() {
  const sectionRef =
    useRef<HTMLElement | null>(
      null,
    );

  const [
    products,
    setProducts,
  ] = useState<ProductItem[]>(
    [],
  );

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    isHovered,
    setIsHovered,
  ] = useState(false);

  const [
    isVisible,
    setIsVisible,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    retryKey,
    setRetryKey,
  ] = useState(0);


  // =======================================================
  // SECTION VISIBILITY
  // =======================================================

  useEffect(() => {
    const element =
      sectionRef.current;

    if (!element) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (
          entries,
        ) => {
          setIsVisible(
            entries[0]
              ?.isIntersecting ??
              false,
          );
        },
        {
          threshold: 0.2,
        },
      );

    observer.observe(
      element,
    );

    return () => {
      observer.disconnect();
    };
  }, []);


  // =======================================================
  // FETCH PRODUCTS
  // =======================================================

  useEffect(() => {
    let active =
      true;

    const fetchProducts =
      async () => {
        try {
          setLoading(
            true,
          );

          setError(
            null,
          );

          const snapshot =
            await getDocs(
              productsCollection,
            );

          const productList =
            snapshot.docs
              .map(
                (
                  document,
                ) =>
                  ({
                    id:
                      document.id,

                    ...document.data(),
                  }) as ProductItem,
              )
              .sort(
                (
                  a,
                  b,
                ) =>
                  getProductTimestamp(
                    b,
                  ) -
                  getProductTimestamp(
                    a,
                  ),
              )
              .slice(
                0,
                HOME_PRODUCT_LIMIT,
              );

          if (!active) {
            return;
          }

          setProducts(
            productList,
          );

          setCurrentIndex(
            0,
          );
        } catch (fetchError) {
          console.error(
            "Error fetching products:",
            fetchError,
          );

          if (!active) {
            return;
          }

          setError(
            "Produk belum dapat dimuat. Silakan coba kembali.",
          );
        } finally {
          if (active) {
            setLoading(
              false,
            );
          }
        }
      };

    void fetchProducts();

    return () => {
      active = false;
    };
  }, [retryKey]);


  // =======================================================
  // AUTOPLAY
  // =======================================================

  useEffect(() => {
    if (
      products.length <= 1 ||
      isHovered ||
      !isVisible
    ) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          setCurrentIndex(
            (
              previous,
            ) =>
              (
                previous +
                1
              ) %
              products.length,
          );
        },
        AUTO_PLAY_DELAY,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [
    products.length,
    isHovered,
    isVisible,
  ]);


  // =======================================================
  // CURRENT PRODUCT
  // =======================================================

  const currentProduct =
    products[
      currentIndex
    ];


  // =======================================================
  // OTHER PRODUCTS
  // =======================================================

  const otherProducts =
    useMemo(
      () =>
        products
          .map(
            (
              product,
              index,
            ) => ({
              product,
              index,
            }),
          )
          .filter(
            (
              item,
            ) =>
              item.index !==
              currentIndex,
          )
          .slice(
            0,
            3,
          ),
      [
        products,
        currentIndex,
      ],
    );


  // =======================================================
  // NAVIGATION
  // =======================================================

  const previousProduct =
    () => {
      if (
        products.length <= 1
      ) {
        return;
      }

      setCurrentIndex(
        (
          previous,
        ) =>
          (
            previous -
            1 +
            products.length
          ) %
          products.length,
      );
    };


  const nextProduct =
    () => {
      if (
        products.length <= 1
      ) {
        return;
      }

      setCurrentIndex(
        (
          previous,
        ) =>
          (
            previous +
            1
          ) %
          products.length,
      );
    };


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={
          sectionRef
        }
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
              -left-32
              top-10
              hidden
              h-80
              w-80
              rounded-full
              bg-blue-200/15
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
              <IoCartOutline className="text-blue-500" />

              <span
                className="
                  text-xs
                  font-semibold
                  text-blue-700

                  sm:text-sm
                "
              >
                Produk HMPTI
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
              <span
                className="
                  bg-gradient-to-r
                  from-blue-600
                  to-cyan-500
                  bg-clip-text
                  text-transparent
                "
              >
                Produk Kreatif
              </span>

              {" HMPTI"}
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
              Karya dan produk yang lahir dari
              kreativitas, semangat
              kewirausahaan, dan kolaborasi
              mahasiswa Teknik Informatika.
            </p>
          </motion.div>


          {/* =======================================
              LOADING
          ======================================== */}

          {loading && (
            <ProductSkeleton />
          )}


          {/* =======================================
              ERROR
          ======================================== */}

          {!loading &&
            error && (
              <ProductError
                message={
                  error
                }
                onRetry={() =>
                  setRetryKey(
                    (
                      previous,
                    ) =>
                      previous +
                      1,
                  )
                }
              />
            )}


          {/* =======================================
              PRODUCT CONTENT
          ======================================== */}

          {!loading &&
            !error &&
            currentProduct && (
              <>
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-8

                    lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]
                    lg:items-start
                    lg:gap-12

                    xl:gap-16
                  "
                >
                  {/* =================================
                      LEFT PRODUCT
                  ================================== */}

                  <motion.div
                    key={`image-${currentProduct.id}`}
                    initial={{
                      opacity: 0,
                      x: -18,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    className="
                      min-w-0
                    "
                    onMouseEnter={() =>
                      setIsHovered(
                        true,
                      )
                    }
                    onMouseLeave={() =>
                      setIsHovered(
                        false,
                      )
                    }
                  >
                    <div
                      className="
                        overflow-hidden
                        rounded-[24px]
                        border
                        border-gray-200
                        bg-white
                        shadow-[0_20px_60px_rgba(15,23,42,0.07)]

                        sm:rounded-[28px]
                      "
                    >
                      {/* =============================
                          IMAGE AREA
                      ============================== */}

                      <div className="relative">
                        <ProductImage
                          product={
                            currentProduct
                          }
                        />


                        {/* =============================
                            DESKTOP NAVIGATION
                        ============================== */}

                        {products.length >
                          1 && (
                          <>
                            <button
                              type="button"
                              onClick={
                                previousProduct
                              }
                              aria-label="Produk sebelumnya"
                              className="
                                absolute
                                left-3
                                top-1/2
                                z-20
                                hidden
                                h-10
                                w-10
                                -translate-y-1/2
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-gray-200
                                bg-white/90
                                text-gray-700
                                shadow-lg
                                backdrop-blur-md
                                transition-all

                                hover:scale-105
                                hover:bg-white
                                hover:text-blue-600

                                lg:flex

                                xl:left-4
                                xl:h-11
                                xl:w-11
                              "
                            >
                              <FiChevronLeft className="text-xl" />
                            </button>


                            <button
                              type="button"
                              onClick={
                                nextProduct
                              }
                              aria-label="Produk berikutnya"
                              className="
                                absolute
                                right-3
                                top-1/2
                                z-20
                                hidden
                                h-10
                                w-10
                                -translate-y-1/2
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-gray-200
                                bg-white/90
                                text-gray-700
                                shadow-lg
                                backdrop-blur-md
                                transition-all

                                hover:scale-105
                                hover:bg-white
                                hover:text-blue-600

                                lg:flex

                                xl:right-4
                                xl:h-11
                                xl:w-11
                              "
                            >
                              <FiChevronRight className="text-xl" />
                            </button>
                          </>
                        )}
                      </div>


                      {/* =============================
                          PRODUCT IDENTITY
                      ============================== */}

                      <div
                        className="
                          border-t
                          border-gray-100
                          bg-white
                          px-5
                          py-5

                          sm:px-6
                          sm:py-6
                        "
                      >
                        <div
                          className="
                            flex
                            flex-col
                            gap-4

                            sm:flex-row
                            sm:items-end
                            sm:justify-between
                          "
                        >
                          {/* =========================
                              PRODUCT NAME
                          ========================== */}

                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >
                            <div
                              className="
                                mb-2
                                inline-flex
                                items-center
                                gap-2
                                text-xs
                                font-semibold
                                text-blue-600
                              "
                            >
                              <FiShoppingBag />

                              Produk Pilihan
                            </div>


                            <h3
                              className="
                                break-words
                                text-2xl
                                font-bold
                                leading-tight
                                tracking-tight
                                text-gray-950

                                sm:text-3xl
                              "
                            >
                              {
                                currentProduct.productName
                              }
                            </h3>
                          </div>


                          {/* =========================
                              PRICE
                          ========================== */}

                          <div
                            className="
                              shrink-0

                              sm:text-right
                            "
                          >
                            <p
                              className="
                                text-xs
                                font-medium
                                text-gray-400
                              "
                            >
                              Harga
                            </p>

                            <p
                              className="
                                mt-1
                                text-2xl
                                font-bold
                                tracking-tight
                                text-blue-600

                                sm:text-3xl
                              "
                            >
                              {formatPrice(
                                currentProduct.priceProduct,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>


                    {/* =============================
                        NAVIGATION / DOTS
                    ============================== */}

                    {products.length >
                      1 && (
                      <div
                        className="
                          mt-5
                          flex
                          items-center
                          justify-center
                          gap-4
                        "
                      >
                        {/* MOBILE PREVIOUS */}

                        <button
                          type="button"
                          onClick={
                            previousProduct
                          }
                          aria-label="Produk sebelumnya"
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            text-gray-600
                            shadow-sm
                            transition-colors

                            hover:bg-blue-50
                            hover:text-blue-600

                            lg:hidden
                          "
                        >
                          <FiChevronLeft />
                        </button>


                        <ProductIndicators
                          products={
                            products
                          }
                          currentIndex={
                            currentIndex
                          }
                          onChange={
                            setCurrentIndex
                          }
                        />


                        {/* MOBILE NEXT */}

                        <button
                          type="button"
                          onClick={
                            nextProduct
                          }
                          aria-label="Produk berikutnya"
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            text-gray-600
                            shadow-sm
                            transition-colors

                            hover:bg-blue-50
                            hover:text-blue-600

                            lg:hidden
                          "
                        >
                          <FiChevronRight />
                        </button>
                      </div>
                    )}
                  </motion.div>


                  {/* =================================
                      RIGHT PRODUCT INFORMATION
                  ================================== */}

                  <motion.div
                    key={`content-${currentProduct.id}`}
                    initial={{
                      opacity: 0,
                      x: 18,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    className="
                      min-w-0
                    "
                  >
                    {/* =============================
                        SECTION LABEL
                    ============================== */}

                    <div
                      className="
                        mb-4
                        flex
                        items-center
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
                        <FiShoppingBag />
                      </div>


                      <div>
                        <p
                          className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.12em]
                            text-blue-600
                          "
                        >
                          Informasi Produk
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-sm
                            text-gray-500
                          "
                        >
                          Detail dan spesifikasi produk
                        </p>
                      </div>
                    </div>


                    {/* =================================
                        DESCRIPTION
                    ================================== */}

                    <div
                      className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white/80
                        shadow-sm
                      "
                    >
                      {/* =============================
                          DESCRIPTION HEADER
                      ============================== */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                          border-b
                          border-gray-100
                          bg-white/90
                          px-4
                          py-3.5

                          sm:px-5
                          sm:py-4

                          lg:px-6
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <span
                            className="
                              h-1.5
                              w-1.5
                              shrink-0
                              rounded-full
                              bg-blue-600
                            "
                          />

                          <h4
                            className="
                              text-sm
                              font-bold
                              text-gray-900
                            "
                          >
                            Tentang Produk
                          </h4>
                        </div>


                        <span
                          className="
                            hidden
                            shrink-0
                            text-[10px]
                            font-medium
                            uppercase
                            tracking-[0.1em]
                            text-gray-400

                            sm:block
                          "
                        >
                          Scroll untuk membaca
                        </span>
                      </div>


                      {/* =============================
                          SCROLLABLE DESCRIPTION
                      ============================== */}

                      <div
                        tabIndex={0}
                        aria-label="Deskripsi produk"
                        className="
                          max-h-[230px]
                          overflow-y-auto
                          overscroll-contain
                          touch-pan-y
                          px-4
                          py-4
                          outline-none

                          [scrollbar-color:rgb(203_213_225)_transparent]
                          [scrollbar-width:thin]

                          [&::-webkit-scrollbar]:w-1.5
                          [&::-webkit-scrollbar-thumb]:rounded-full
                          [&::-webkit-scrollbar-thumb]:bg-gray-300
                          [&::-webkit-scrollbar-track]:bg-transparent

                          focus:ring-2
                          focus:ring-inset
                          focus:ring-blue-100

                          min-[400px]:max-h-[245px]

                          sm:max-h-[270px]
                          sm:px-5
                          sm:py-5

                          md:max-h-[290px]

                          lg:max-h-[310px]
                          lg:px-6

                          xl:max-h-[330px]
                        "
                      >
                        <p
                          className="
                            whitespace-pre-line
                            break-words
                            text-sm
                            leading-7
                            text-gray-600

                            [hyphens:auto]
                            [text-align:justify]
                            [text-justify:inter-word]

                            sm:text-[15px]
                            sm:leading-8
                          "
                        >
                          {
                            currentProduct.descriptionProduct
                          }
                        </p>
                      </div>


                      {/* =============================
                          SCROLL FOOTER
                      ============================== */}

                      <div
                        className="
                          flex
                          items-center
                          justify-center
                          border-t
                          border-gray-100
                          bg-gray-50/60
                          px-4
                          py-2
                        "
                      >
                        <span
                          className="
                            text-center
                            text-[10px]
                            font-medium
                            text-gray-400
                          "
                        >
                          Geser untuk membaca deskripsi lengkap
                        </span>
                      </div>
                    </div>


                    {/* =================================
                        BENEFITS
                    ================================== */}

                    <div
                      className="
                        mt-5
                        grid
                        grid-cols-1
                        gap-2.5

                        sm:grid-cols-3
                        sm:gap-3

                        lg:grid-cols-1

                        xl:grid-cols-3
                      "
                    >
                      {PRODUCT_BENEFITS.map(
                        (
                          benefit,
                        ) => (
                          <div
                            key={
                              benefit
                            }
                            className="
                              flex
                              items-start
                              gap-3
                              rounded-xl
                              border
                              border-gray-100
                              bg-gray-50/70
                              p-3.5

                              sm:rounded-2xl
                              sm:p-4
                            "
                          >
                            <span
                              className="
                                flex
                                h-7
                                w-7
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-blue-50
                                text-blue-600
                              "
                            >
                              <FiCheck className="text-xs" />
                            </span>


                            <p
                              className="
                                text-xs
                                font-medium
                                leading-5
                                text-gray-600

                                sm:text-sm
                                sm:leading-6
                              "
                            >
                              {benefit}
                            </p>
                          </div>
                        ),
                      )}
                    </div>


                    {/* =================================
                        WHATSAPP
                    ================================== */}

                    <div
                      className="
                        mt-6
                        flex
                        flex-col
                        gap-3

                        sm:flex-row
                        sm:items-center

                        lg:mt-7
                      "
                    >
                      <ProductWhatsappButton
                        product={
                          currentProduct
                        }
                      />


                      <p
                        className="
                          max-w-sm
                          text-xs
                          leading-5
                          text-gray-400
                        "
                      >
                        Hubungi admin untuk informasi
                        ukuran, ketersediaan, dan
                        pemesanan produk.
                      </p>
                    </div>
                  </motion.div>
                </div>


                {/* =================================
                    OTHER PRODUCTS
                ================================== */}

                {otherProducts.length >
                  0 && (
                  <section
                    className="
                      mt-12
                      border-t
                      border-gray-100
                      pt-8

                      sm:mt-14
                      sm:pt-10

                      lg:mt-16
                      lg:pt-12
                    "
                  >
                    <div
                      className="
                        mb-6
                        flex
                        flex-col
                        gap-2

                        sm:flex-row
                        sm:items-end
                        sm:justify-between
                      "
                    >
                      <div>
                        <p
                          className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.12em]
                            text-blue-600
                          "
                        >
                          Produk Lainnya
                        </p>


                        <h3
                          className="
                            mt-1
                            text-xl
                            font-bold
                            text-gray-900

                            sm:text-2xl
                          "
                        >
                          Pilihan Produk HMPTI
                        </h3>
                      </div>


                      <span
                        className="
                          hidden
                          text-xs
                          text-gray-400

                          sm:block
                        "
                      >
                        Pilih produk untuk melihat detail
                      </span>
                    </div>


                    <div
                      className="
                        grid
                        grid-cols-1
                        gap-3

                        sm:grid-cols-2
                        sm:gap-4

                        lg:grid-cols-3
                      "
                    >
                      {otherProducts.map(
                        (
                          item,
                        ) => (
                          <SmallProductCard
                            key={
                              item.product.id
                            }
                            product={
                              item.product
                            }
                            onSelect={() => {
                              setCurrentIndex(
                                item.index,
                              );

                              window.requestAnimationFrame(
                                () => {
                                  sectionRef.current
                                    ?.scrollIntoView({
                                      behavior:
                                        "smooth",

                                      block:
                                        "start",
                                    });
                                },
                              );
                            }}
                          />
                        ),
                      )}
                    </div>
                  </section>
                )}
              </>
            )}


          {/* =======================================
              EMPTY
          ======================================== */}

          {!loading &&
            !error &&
            products.length ===
              0 && (
              <ProductEmpty />
            )}
        </div>
      </section>
    </MotionConfig>
  );
}


// =========================================================
// PRODUCT IMAGE
// =========================================================

function ProductImage({
  product,
}: {
  product: ProductItem;
}) {
  const [
    imageError,
    setImageError,
  ] = useState(false);


  useEffect(() => {
    setImageError(
      false,
    );
  }, [
    product.imageUrl,
  ]);


  return (
    <div
      className="
        relative
        aspect-[4/3]
        w-full
        overflow-hidden
        bg-gradient-to-br
        from-gray-50
        via-white
        to-blue-50/40

        sm:aspect-[5/4]

        lg:aspect-[4/3]
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
        "
      >
        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-[70%]
            w-[70%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-blue-100/40
            blur-3xl
          "
        />


        <div
          className="
            absolute
            inset-4
            rounded-2xl
            border
            border-gray-100/80

            sm:inset-6

            lg:inset-7

            xl:inset-8
          "
        />
      </div>


      {/* =========================================
          IMAGE
      ========================================== */}

      {product.imageUrl &&
      !imageError ? (
        <Image
          src={
            product.imageUrl
          }
          alt={
            product.productName
          }
          fill
          sizes="
            (max-width: 639px) 92vw,
            (max-width: 1023px) 90vw,
            45vw
          "
          onError={() =>
            setImageError(
              true,
            )
          }
          className="
            relative
            z-10
            object-contain
            p-7

            sm:p-9

            lg:p-10

            xl:p-12
          "
        />
      ) : (
        <ProductImageFallback />
      )}


      {/* =========================================
          LABEL
      ========================================== */}

      <div
        className="
          absolute
          left-3
          top-3
          z-20

          sm:left-4
          sm:top-4

          lg:left-5
          lg:top-5
        "
      >
        <span
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-blue-100
            bg-white/90
            px-2.5
            py-1.5
            text-[10px]
            font-semibold
            text-blue-700
            shadow-sm
            backdrop-blur-md

            sm:px-3
            sm:text-xs
          "
        >
          <FiShoppingBag />

          Produk HMPTI
        </span>
      </div>
    </div>
  );
}


// =========================================================
// WHATSAPP BUTTON
// =========================================================

function ProductWhatsappButton({
  product,
}: {
  product: ProductItem;
}) {
  const whatsappUrl =
    getWhatsappUrl(
      product,
    );

  if (!whatsappUrl) {
    return null;
  }

  return (
    <a
      href={
        whatsappUrl
      }
      target="_blank"
      rel="noopener noreferrer"
      className="
        inline-flex
        min-h-12
        w-full
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-green-600
        px-5
        py-3
        text-sm
        font-semibold
        text-white
        shadow-lg
        shadow-green-600/15
        transition-all

        hover:-translate-y-0.5
        hover:bg-green-500
        hover:shadow-xl

        sm:w-auto
        sm:px-6
      "
    >
      <FiMessageSquare />

      Pesan via WhatsApp
    </a>
  );
}


// =========================================================
// PRODUCT INDICATORS
// =========================================================

function ProductIndicators({
  products,
  currentIndex,
  onChange,
}: {
  products: ProductItem[];

  currentIndex: number;

  onChange: (
    index: number,
  ) => void;
}) {
  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        justify-center
        gap-2
      "
    >
      {products.map(
        (
          product,
          index,
        ) => (
          <button
            key={
              product.id
            }
            type="button"
            onClick={() =>
              onChange(
                index,
              )
            }
            aria-label={`Tampilkan produk ${
              index + 1
            }`}
            aria-current={
              currentIndex ===
              index
                ? "true"
                : undefined
            }
            className={`
              h-2
              rounded-full
              transition-all

              ${
                currentIndex ===
                index
                  ? `
                    w-6
                    bg-blue-600
                  `
                  : `
                    w-2
                    bg-gray-300

                    hover:bg-gray-400
                  `
              }
            `}
          />
        ),
      )}
    </div>
  );
}


// =========================================================
// SMALL PRODUCT CARD
// =========================================================

function SmallProductCard({
  product,
  onSelect,
}: {
  product: ProductItem;

  onSelect: () => void;
}) {
  const [
    imageError,
    setImageError,
  ] = useState(false);


  useEffect(() => {
    setImageError(
      false,
    );
  }, [
    product.imageUrl,
  ]);


  return (
    <button
      type="button"
      onClick={
        onSelect
      }
      className="
        group
        flex
        min-w-0
        items-center
        gap-3
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-3
        text-left
        shadow-sm
        transition-all

        hover:-translate-y-0.5
        hover:border-blue-100
        hover:shadow-md

        sm:gap-4
      "
    >
      {/* =========================================
          IMAGE
      ========================================== */}

      <div
        className="
          relative
          h-20
          w-20
          shrink-0
          overflow-hidden
          rounded-xl
          bg-gray-50

          sm:h-24
          sm:w-24
        "
      >
        {product.imageUrl &&
        !imageError ? (
          <Image
            src={
              product.imageUrl
            }
            alt={
              product.productName
            }
            fill
            sizes="
              (max-width: 639px) 80px,
              96px
            "
            onError={() =>
              setImageError(
                true,
              )
            }
            className="
              object-contain
              p-2
              transition-transform
              duration-300

              group-hover:scale-[1.04]
            "
          />
        ) : (
          <ProductImageFallback />
        )}
      </div>


      {/* =========================================
          CONTENT
      ========================================== */}

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <h4
          className="
            line-clamp-2
            text-sm
            font-bold
            leading-5
            text-gray-900
            transition-colors

            group-hover:text-blue-600
          "
        >
          {
            product.productName
          }
        </h4>


        <p
          className="
            mt-1.5
            text-sm
            font-semibold
            text-blue-600
          "
        >
          {formatPrice(
            product.priceProduct,
          )}
        </p>


        <span
          className="
            mt-2
            inline-flex
            text-[11px]
            font-medium
            text-gray-400
          "
        >
          Lihat detail
        </span>
      </div>
    </button>
  );
}


// =========================================================
// IMAGE FALLBACK
// =========================================================

function ProductImageFallback() {
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
        to-cyan-100
      "
    >
      <FiShoppingBag
        className="
          text-4xl
          text-blue-300
        "
      />
    </div>
  );
}


// =========================================================
// LOADING
// =========================================================

function ProductSkeleton() {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-8

        lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]
        lg:gap-12

        xl:gap-16
      "
    >
      {/* LEFT */}

      <div>
        <div
          className="
            overflow-hidden
            rounded-[24px]
            border
            border-gray-100
            bg-white

            sm:rounded-[28px]
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
              border-t
              border-gray-100
              p-5

              sm:p-6
            "
          >
            <div
              className="
                h-4
                w-24
                animate-pulse
                rounded
                bg-blue-100
              "
            />

            <div
              className="
                mt-3
                h-8
                w-2/3
                animate-pulse
                rounded
                bg-gray-200
              "
            />

            <div
              className="
                mt-3
                h-7
                w-32
                animate-pulse
                rounded
                bg-blue-100
              "
            />
          </div>
        </div>
      </div>


      {/* RIGHT */}

      <div className="space-y-4">
        <div
          className="
            h-10
            w-48
            animate-pulse
            rounded-xl
            bg-gray-100
          "
        />

        <div
          className="
            h-[300px]
            animate-pulse
            rounded-2xl
            bg-gray-100
          "
        />

        <div
          className="
            grid
            grid-cols-1
            gap-3

            sm:grid-cols-3

            lg:grid-cols-1

            xl:grid-cols-3
          "
        >
          {Array.from({
            length: 3,
          }).map(
            (
              _,
              index,
            ) => (
              <div
                key={
                  index
                }
                className="
                  h-20
                  animate-pulse
                  rounded-2xl
                  bg-gray-100
                "
              />
            ),
          )}
        </div>

        <div
          className="
            h-12
            w-full
            animate-pulse
            rounded-xl
            bg-gray-100

            sm:w-52
          "
        />
      </div>
    </div>
  );
}


// =========================================================
// ERROR
// =========================================================

function ProductError({
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
        px-5
        py-10
        text-center
        shadow-sm

        sm:px-6
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
        <FiShoppingBag className="text-xl" />
      </div>


      <h3
        className="
          mt-4
          text-lg
          font-bold
          text-gray-900
        "
      >
        Produk Gagal Dimuat
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
        onClick={
          onRetry
        }
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
// EMPTY
// =========================================================

function ProductEmpty() {
  return (
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
      }}
      className="
        mx-auto
        max-w-md
        rounded-3xl
        border
        border-dashed
        border-gray-200
        bg-white/70
        px-5
        py-12
        text-center

        sm:px-6
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
        <FiShoppingBag className="text-3xl" />
      </div>


      <h3
        className="
          mt-4
          text-lg
          font-bold
          text-gray-900
        "
      >
        Belum Ada Produk
      </h3>


      <p
        className="
          mt-2
          text-sm
          leading-6
          text-gray-500
        "
      >
        Produk kreatif HMPTI akan ditampilkan
        di bagian ini setelah tersedia.
      </p>
    </motion.div>
  );
}
"use client";

import { auth } from "@/lib/firebase";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  FiArrowRight,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
} from "react-icons/fi";

import { toast } from "react-toastify";


// =========================================================
// CONSTANTS
// =========================================================

const ADMIN_FEATURES = [
  "Data Fungsionaris",
  "Event & Berita",
  "Produk HMPTI",
];


// =========================================================
// MAIN COMPONENT
// =========================================================

export default function Login() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(true);


  // =======================================================
  // CHECK EXISTING SESSION
  // =======================================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            router.replace(
              "/admin/dashboard",
            );

            return;
          }

          setCheckingAuth(false);
        },
      );

    return unsubscribe;
  }, [router]);


  // =======================================================
  // LOGIN
  // =======================================================

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (!normalizedEmail) {
      toast.error(
        "Email wajib diisi.",
      );

      return;
    }

    if (!password) {
      toast.error(
        "Password wajib diisi.",
      );

      return;
    }

    if (password.length < 6) {
      toast.error(
        "Password minimal 6 karakter.",
      );

      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );

      toast.success(
        "Login berhasil.",
      );

      router.replace(
        "/admin/dashboard",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Login error:",
        error,
      );

      toast.error(
        "Email atau password tidak sesuai.",
      );
    } finally {
      setLoading(false);
    }
  };


  // =======================================================
  // NO LOADING SCREEN
  // =======================================================

  if (checkingAuth) {
    return null;
  }


  // =======================================================
  // PAGE
  // =======================================================

  return (
    <main
      className="
        relative
        min-h-[100svh]
        w-full
        overflow-hidden
        bg-white
      "
    >
      <div
        className="
          grid
          min-h-[100svh]
          w-full
          grid-cols-1

          lg:grid-cols-[minmax(0,1.15fr)_minmax(400px,0.85fr)]
        "
      >
        {/* =====================================
            LEFT SIDE
        ====================================== */}

        <section
          className="
            relative
            flex
            min-h-[100svh]
            min-w-0
            items-center
            justify-center
            overflow-hidden
            bg-white
            px-5
            py-8

            min-[400px]:px-6

            sm:px-8
            sm:py-10

            lg:px-12
            lg:py-12

            xl:px-16
          "
        >
          {/* ===================================
              MOBILE BACKGROUND
          ==================================== */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              overflow-hidden

              lg:hidden
            "
          >
            <div
              className="
                absolute
                -left-28
                -top-28
                h-72
                w-72
                rounded-full
                bg-blue-100/60
                blur-3xl
              "
            />

            <div
              className="
                absolute
                -bottom-32
                -right-28
                h-72
                w-72
                rounded-full
                bg-cyan-100/50
                blur-3xl
              "
            />
          </div>


          {/* ===================================
              FORM WRAPPER
          ==================================== */}

          <div
            className="
              relative
              z-10
              w-full
              max-w-[430px]
            "
          >
            {/* =================================
                BRAND
            ================================== */}

            <div
              className="
                mb-9
                flex
                items-center
                gap-3

                sm:mb-10
              "
            >
              <div
                className="
                  relative
                  h-12
                  w-12
                  shrink-0

                  sm:h-14
                  sm:w-14
                "
              >
                <Image
                  src="/assets/image/logoHMPTI.png"
                  alt="Logo HMPTI"
                  fill
                  priority
                  sizes="56px"
                  className="
                    object-contain
                  "
                />
              </div>


              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    text-base
                    font-bold
                    tracking-tight
                    text-gray-950

                    sm:text-lg
                  "
                >
                  HMPTI
                </p>

                <p
                  className="
                    mt-0.5
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-gray-400

                    min-[400px]:text-[10px]
                  "
                >
                  Universitas Duta Bangsa
                </p>
              </div>
            </div>


            {/* =================================
                ADMIN BADGE
            ================================== */}

            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                border
                border-blue-100
                bg-blue-50
                px-3
                py-1.5
                text-[10px]
                font-semibold
                text-blue-700

                sm:text-xs
              "
            >
              <FiShield />

              Area Administrator
            </div>


            {/* =================================
                TITLE
            ================================== */}

            <h1
              className="
                mt-5
                text-[2rem]
                font-bold
                leading-[1.06]
                tracking-[-0.04em]
                text-gray-950

                min-[400px]:text-[2.2rem]

                sm:text-[2.5rem]
              "
            >
              Selamat Datang

              <span
                className="
                  block
                  text-blue-600
                "
              >
                Kembali.
              </span>
            </h1>


            {/* =================================
                DESCRIPTION
            ================================== */}

            <p
              className="
                mt-4
                max-w-sm
                text-sm
                leading-7
                text-gray-500

                sm:text-base
              "
            >
              Masuk untuk mengelola informasi
              dan konten website HMPTI.
            </p>


            {/* =================================
                FORM
            ================================== */}

            <form
              onSubmit={handleLogin}
              className="
                mt-8
                space-y-5

                sm:mt-9
              "
            >
              {/* ===============================
                  EMAIL
              ================================ */}

              <div>
                <label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                  "
                >
                  Email
                </label>


                <div
                  className="
                    group
                    relative
                  "
                >
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-y-0
                      left-0
                      flex
                      items-center
                      pl-4
                    "
                  >
                    <FiMail
                      className="
                        text-gray-400
                        transition-colors

                        group-focus-within:text-blue-600
                      "
                    />
                  </div>


                  <input
                    id="email"
                    type="email"
                    name="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="admin@hmpti.id"
                    value={email}
                    disabled={loading}
                    required
                    onChange={(event) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    className="
                      min-h-12
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      py-3
                      pl-11
                      pr-4
                      text-sm
                      text-gray-900
                      outline-none
                      transition-all

                      placeholder:text-gray-400

                      hover:border-gray-300

                      focus:border-blue-400
                      focus:ring-4
                      focus:ring-blue-100/60

                      disabled:cursor-not-allowed
                      disabled:bg-gray-50
                      disabled:text-gray-400

                      sm:text-[15px]
                    "
                  />
                </div>
              </div>


              {/* ===============================
                  PASSWORD
              ================================ */}

              <div>
                <label
                  htmlFor="password"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                  "
                >
                  Password
                </label>


                <div
                  className="
                    group
                    relative
                  "
                >
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-y-0
                      left-0
                      flex
                      items-center
                      pl-4
                    "
                  >
                    <FiLock
                      className="
                        text-gray-400
                        transition-colors

                        group-focus-within:text-blue-600
                      "
                    />
                  </div>


                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    value={password}
                    disabled={loading}
                    required
                    minLength={6}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    className="
                      min-h-12
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      py-3
                      pl-11
                      pr-12
                      text-sm
                      text-gray-900
                      outline-none
                      transition-all

                      placeholder:text-gray-400

                      hover:border-gray-300

                      focus:border-blue-400
                      focus:ring-4
                      focus:ring-blue-100/60

                      disabled:cursor-not-allowed
                      disabled:bg-gray-50
                      disabled:text-gray-400

                      sm:text-[15px]
                    "
                  />


                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous,
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    title={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    className="
                      absolute
                      inset-y-0
                      right-0
                      flex
                      w-12
                      items-center
                      justify-center
                      text-gray-400
                      transition-colors

                      hover:text-gray-700

                      focus:outline-none
                      focus-visible:text-blue-600

                      disabled:cursor-not-allowed
                    "
                  >
                    {showPassword ? (
                      <FiEyeOff />
                    ) : (
                      <FiEye />
                    )}
                  </button>
                </div>
              </div>


              {/* ===============================
                  BUTTON
              ================================ */}

              <button
                type="submit"
                disabled={loading}
                className="
                  group
                  flex
                  min-h-12
                  w-full
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

                  active:translate-y-0

                  disabled:cursor-not-allowed
                  disabled:translate-y-0
                  disabled:bg-blue-400
                  disabled:shadow-none
                "
              >
                {loading ? (
                  <>
                    <span
                      aria-hidden="true"
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

                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk ke Dashboard

                    <FiArrowRight
                      className="
                        transition-transform

                        group-hover:translate-x-1
                      "
                    />
                  </>
                )}
              </button>
            </form>


            {/* =================================
                SECURITY
            ================================== */}

            <div
              className="
                mt-6
                flex
                items-start
                gap-3
                border-t
                border-gray-100
                pt-5
              "
            >
              <FiShield
                className="
                  mt-0.5
                  shrink-0
                  text-sm
                  text-gray-400
                "
              />


              <p
                className="
                  text-[11px]
                  leading-5
                  text-gray-400

                  sm:text-xs
                "
              >
                Khusus administrator HMPTI
                yang memiliki akses resmi.
              </p>
            </div>
          </div>
        </section>


        {/* =====================================
            RIGHT BRANDING
        ====================================== */}

        <aside
          className="
            relative
            hidden
            min-h-[100svh]
            overflow-hidden

            lg:flex
            lg:items-center
            lg:justify-center
            lg:bg-[#1646a8]
            lg:px-10
            lg:py-12

            xl:px-12
          "
        >
          {/* ===================================
              BACKGROUND
          ==================================== */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              overflow-hidden
            "
          >
            {/* GRADIENT */}

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-br
                from-[#173d95]
                via-[#1550bc]
                to-[#1787cc]
              "
            />


            {/* SUBTLE GRID */}

            <div
              className="
                absolute
                inset-0
                opacity-[0.055]
                bg-[linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.45)_1px,transparent_1px)]
                bg-[size:48px_48px]
              "
            />


            {/* GLOWS */}

            <div
              className="
                absolute
                -right-32
                -top-32
                h-[420px]
                w-[420px]
                rounded-full
                bg-cyan-300/20
                blur-3xl
              "
            />


            <div
              className="
                absolute
                -bottom-40
                -left-32
                h-[420px]
                w-[420px]
                rounded-full
                bg-indigo-300/20
                blur-3xl
              "
            />
          </div>


          {/* ===================================
              CENTERED CONTENT
          ==================================== */}

          <div
            className="
              relative
              z-10
              mx-auto
              flex
              w-full
              max-w-[430px]
              flex-col
              items-center
              text-center
            "
          >
            {/* =================================
                EYEBROW
            ================================== */}

            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-blue-100/80
              "
            >
              Sistem Informasi HMPTI
            </p>


            {/* =================================
                LOGO PLATE
            ================================== */}

            <div
              className="
                mt-8
                flex
                h-32
                w-32
                items-center
                justify-center
                rounded-[30px]
                border
                border-white/70
                bg-white
                shadow-[0_24px_60px_rgba(10,30,90,0.22)]

                xl:h-36
                xl:w-36
              "
            >
              <div
                className="
                  relative
                  h-[82%]
                  w-[82%]
                "
              >
                <Image
                  src="/assets/image/logoHMPTI.png"
                  alt="Logo HMPTI Universitas Duta Bangsa"
                  fill
                  priority
                  sizes="144px"
                  className="
                    object-contain
                    p-3
                  "
                />
              </div>
            </div>


            {/* =================================
                TITLE
            ================================== */}

            <h2
              className="
                mt-8
                text-3xl
                font-bold
                leading-[1.08]
                tracking-[-0.035em]
                text-white

                xl:text-[2.25rem]
              "
            >
              Kelola HMPTI dengan
              lebih sederhana.
            </h2>


            {/* =================================
                DESCRIPTION
            ================================== */}

            <p
              className="
                mt-4
                max-w-sm
                text-sm
                leading-7
                text-blue-50/80

                xl:text-[15px]
              "
            >
              Satu dashboard untuk mengelola
              informasi organisasi secara cepat,
              rapi, dan terstruktur.
            </p>


            {/* =================================
                DIVIDER
            ================================== */}

            <div
              className="
                my-7
                h-px
                w-16
                bg-white/20
              "
            />


            {/* =================================
                FEATURES
            ================================== */}

            <div
              className="
                flex
                w-full
                max-w-[290px]
                flex-col
                gap-3
              "
            >
              {ADMIN_FEATURES.map(
                (feature) => (
                  <div
                    key={feature}
                    className="
                      flex
                      items-center
                      gap-3
                      text-left
                    "
                  >
                    <span
                      className="
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-white/15
                        text-white
                        ring-1
                        ring-white/10
                      "
                    >
                      <FiCheck className="text-[11px]" />
                    </span>


                    <span
                      className="
                        text-sm
                        font-medium
                        text-blue-50/90
                      "
                    >
                      {feature}
                    </span>
                  </div>
                ),
              )}
            </div>


            {/* =================================
                FOOTER BRAND
            ================================== */}

            <p
              className="
                mt-9
                text-[10px]
                font-medium
                uppercase
                tracking-[0.14em]
                text-blue-100/50
              "
            >
              Universitas Duta Bangsa
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
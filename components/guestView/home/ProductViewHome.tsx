"use client";
import { productsCollection } from "@/lib/firebase";
import { getDocs, orderBy, query } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowRight, FiDollarSign, FiMessageSquare, FiShoppingBag, FiArrowLeft, FiArrowRight as FiRight } from "react-icons/fi";
import { IoSparkles, IoCartOutline } from "react-icons/io5";

interface Product {
  id: string;
  imageUrl: string;
  productName: string;
  priceProduct: string;
  descriptionProduct: string;
  whatsappNumber: string;
  category?: string;
}

export default function ProductViewHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(productsCollection, orderBy("productName"));
        const data = await getDocs(q);
        const filteredProducts = data.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            }) as Product,
        );
        setProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (products.length === 0 || isHovered) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products, isHovered]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(price));
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]"></div>
        
        {/* Floating shapes */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-300/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          viewport={{ once: true }} 
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
            <IoCartOutline className="text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Produk Unggulan</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Produk Kreatif
            </span>{' '}
            HMPTI
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Karya kreatif dan inovatif mahasiswa Teknik Informatika UDB
          </p>
        </motion.div>

        {/* Product showcase */}
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Product carousel */}
          <div 
            className="w-full lg:w-1/2 relative" 
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
          >
            {products.length > 0 ? (
              <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-blue-500/10 bg-white border border-gray-100">
                <AnimatePresence custom={direction} mode="popLayout" initial={false}>
                  <motion.div
                    key={products[currentIndex]?.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                    className="aspect-square w-full relative"
                  >
                    <div className="p-8">
                      <img 
                        src={products[currentIndex]?.imageUrl} 
                        alt={products[currentIndex]?.productName || "Produk HMPTI"} 
                        className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                      <div className="flex justify-between items-end">
                        <div>
                          <motion.span
                            className="inline-block px-3 py-1.5 text-xs font-semibold tracking-wider text-white uppercase bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-3"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            {products[currentIndex]?.category || "Produk"}
                          </motion.span>
                          <motion.h3 
                            className="text-2xl font-bold text-blue-600 mb-2" 
                            initial={{ y: 10, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            transition={{ delay: 0.3 }}
                          >
                            {products[currentIndex]?.productName}
                          </motion.h3>
                          <motion.p 
                            className="text-white/90 text-sm line-clamp-2 leading-relaxed" 
                            initial={{ y: 10, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            transition={{ delay: 0.4 }}
                          >
                            {products[currentIndex]?.descriptionProduct}
                          </motion.p>
                        </div>
                        <motion.span
                          className="text-xl font-bold text-white flex items-center bg-black/30 px-3 py-2 rounded-lg"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          
                          {formatPrice(products[currentIndex]?.priceProduct || "0")}
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                {products.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                      aria-label="Previous product"
                    >
                      <FiArrowLeft className="text-gray-700" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                      aria-label="Next product"
                    >
                      <FiRight className="text-gray-700" />
                    </button>
                  </>
                )}

                {/* Navigation dots */}
                {products.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {products.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setDirection(index > currentIndex ? 1 : -1);
                          setCurrentIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentIndex === index 
                            ? "bg-white w-6" 
                            : "bg-white/50 hover:bg-white/80"
                        }`}
                        aria-label={`Go to product ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square w-full bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center flex-col gap-4 border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <FiShoppingBag className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-500">Belum ada produk tersedia</p>
                <p className="text-gray-400 text-sm">Produk baru akan segera hadir</p>
              </div>
            )}
          </div>

          {/* Product description */}
          <div className="w-full lg:w-1/2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5, delay: 0.2 }} 
              viewport={{ once: true }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                  Kewirausahaan Kreatif
                </span>{' '}
                Mahasiswa Informatika
              </h3>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Produk HMPTI adalah inisiatif kewirausahaan yang lahir dari semangat kreativitas dan inovasi mahasiswa. 
                Kami membuktikan bahwa kemampuan teknis bisa berpadu dengan jiwa wirausaha.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Mengembangkan keterampilan di luar bidang teknologi",
                  "Meningkatkan kemandirian dan jiwa wirausaha",
                  "Menciptakan peluang dan nilai lebih bagi masyarakat"
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start gap-4 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      </div>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-wrap gap-4"
            >
             
              
              {products.length > 0 && (
                <a
                  href={`https://wa.me/${products[currentIndex]?.whatsappNumber || ""}`}
                  className="px-6 py-3.5 bg-white text-green-600 border border-green-200 rounded-xl font-medium flex items-center gap-2 shadow-sm hover:bg-green-50 hover:shadow-md transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiMessageSquare /> 
                  Pesan Sekarang
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
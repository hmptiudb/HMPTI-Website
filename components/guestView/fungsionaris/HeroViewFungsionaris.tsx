"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { FiAward, FiBook, FiCode, FiGlobe, FiTarget, FiUsers, FiArrowRight } from "react-icons/fi";
import { IoSparkles, IoPeopleCircleOutline, IoRocketOutline } from "react-icons/io5";

function HeroViewFungsionaris() {
  return (
    <section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-indigo-700/90"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')]"></div>
        
        {/* Floating shapes */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
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
          className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"
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

      <div className="relative w-full max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6"
        >
          <IoPeopleCircleOutline className="text-white" />
          <span className="text-sm font-medium text-white">Tentang Kami</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight text-white"
        >
          BERSAMA MENJADI <span className="text-blue-300">PENGGERAK</span> ORGANISASI
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg text-white/90 max-w-3xl mx-auto uppercase tracking-wide"
        >
          Bangun kolaborasi, tingkatkan dedikasi, dan jadilah bagian penting dari perubahan yang berdampak!
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}

          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AboutUsContent() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* About Section */}
      <section className="py-20 relative">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]"></div>
          
          <motion.div
            className="absolute top-20 right-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"
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
            className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-300/15 rounded-full blur-3xl"
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
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8 }} 
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
                <IoSparkles className="text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Tentang HMPTI</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Mengenal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">HMPTI</span>
              </h2>
              
              <div className="space-y-4 text-gray-600">
                <p className="leading-relaxed">
                  HMPTI (Himpunan Mahasiswa Teknik Informatika) adalah organisasi kemahasiswaan yang menjadi wadah resmi bagi mahasiswa Program Studi Teknik Informatika.
                </p>
                <p className="leading-relaxed">
                  Didirikan pada tahun 2010, HMPTI telah menjadi pionir dalam pengembangan kompetensi teknis dan soft skill mahasiswa di bidang teknologi informasi.
                </p>
                <p className="leading-relaxed">
                  Kami berkomitmen untuk menciptakan lingkungan yang mendukung pertumbuhan akademik, profesional, dan personal anggota kami.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-gray-100"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <IoRocketOutline className="text-blue-500 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">HMPTI Team</h3>
                  <p className="text-gray-600">Komunitas penggerak teknologi masa depan</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visi Misi Section */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            viewport={{ once: true }} 
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Visi</span> dan{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Misi</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Pedoman yang menjadi arah perjalanan organisasi kami
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <FiTarget size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Visi</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                "Menjadi himpunan mahasiswa terdepan yang mencetak profesional di bidang teknologi informasi yang berkarakter, inovatif, dan berdaya saing global pada tahun 2025."
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg shadow-indigo-500/5 border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                  <FiBook size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Misi</h3>
              </div>
              <ul className="space-y-4 text-gray-600">
                {[
                  "Mengembangkan kompetensi anggota di bidang teknologi informasi",
                  "Menjalin kerjasama dengan industri dan akademisi",
                  "Mendorong inovasi dan kreativitas dalam pengembangan teknologi",
                  "Membangun karakter kepemimpinan dan jiwa sosial anggota",
                  "Meningkatkan kontribusi untuk masyarakat melalui teknologi"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-indigo-500 mr-3 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            viewport={{ once: true }} 
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nilai <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Inti</span> Kami
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Prinsip-prinsip yang menjadi dasar setiap kegiatan dan keputusan kami
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-blue-200/30 transition-all group"
              >
                <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')]"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Bergabunglah dengan <span className="text-blue-400">HMPTI</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Jadilah bagian dari komunitas yang mendorong perkembangan teknologi informasi dan pengembangan diri Anda.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-blue-500/25">
                Daftar Sekarang <FiArrowRight />
              </button>
              <button className="px-8 py-3.5 bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 rounded-xl font-medium transition-all">
                Lihat Kegiatan Kami
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Data untuk nilai-nilai inti
const values = [
  {
    icon: <FiCode size={28} />,
    title: "Inovasi",
    description: "Terus mendorong batas kreativitas dalam pengembangan teknologi dan solusi digital",
  },
  {
    icon: <FiUsers size={28} />,
    title: "Kolaborasi",
    description: "Bekerja sama dengan semangat tim untuk mencapai hasil yang lebih baik",
  },
  {
    icon: <FiAward size={28} />,
    title: "Integritas",
    description: "Bertindak jujur, transparan, dan bertanggung jawab dalam setiap kegiatan",
  },
  {
    icon: <FiBook size={28} />,
    title: "Pembelajaran",
    description: "Terus mengembangkan pengetahuan dan keterampilan melalui pengalaman baru",
  },
  {
    icon: <FiGlobe size={28} />,
    title: "Kontribusi Sosial",
    description: "Memberikan dampak positif bagi masyarakat melalui penerapan teknologi",
  },
  {
    icon: <FiTarget size={28} />,
    title: "Keunggulan",
    description: "Selalu berusaha memberikan yang terbaik dalam setiap aspek dan pencapaian",
  },
];

export default function AboutUsPage() {
  return (
    <main className="min-h-screen">
      <HeroViewFungsionaris />
      <AboutUsContent />
    </main>
  );
}
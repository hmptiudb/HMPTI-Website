"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { IoPeopleCircleOutline } from "react-icons/io5";

const teamMembers = [
  // Ketua (akan diposisikan khusus)
  {
    name: "Ketua HMPTI",
    image: "/assets/image/LogoKetua.png",
    description: "Memimpin dan mengkoordinasikan seluruh kegiatan organisasi",
    color: "from-blue-600 to-blue-400",
    isLeader: true,
    link: "/pages/fungsionaris/ketua-wakil",
  },
  // Anggota lainnya
  {
    name: "Sekretaris",
    image: "/assets/image/LogoSekretaris.png",
    description: "Mengurus administrasi dan dokumentasi organisasi",
    color: "from-purple-600 to-purple-400",
    link: "/pages/fungsionaris/sekretaris",
  },
  {
    name: "Bendahara",
    image: "/assets/image/LogoBendahara.png",
    description: "Mengelola keuangan dan aset organisasi",
    color: "from-green-600 to-green-400",
    link: "/pages/fungsionaris/bendahara",
  },
  {
    name: "Divisi Riset",
    image: "/assets/image/LogoRiset.png",
    description: "Mengembangkan penelitian dan inovasi teknologi",
    color: "from-red-600 to-red-400",
    link: "/pages/fungsionaris/riset-dan-teknologi",
  },
  {
    name: "Divisi Kominfo",
    image: "/assets/image/LogoKominfo.png",
    description: "Mengelola komunikasi dan informasi organisasi",
    color: "from-yellow-600 to-yellow-400",
    link: "/pages/fungsionaris/kominfo",
  },
  {
    name: "Divisi Minat Bakat",
    image: "/assets/image/LogoMinatbakat.png",
    description: "Mengembangkan bakat non-akademik mahasiswa",
    color: "from-pink-600 to-pink-400",
    link: "/pages/fungsionaris/minat-dan-bakat",
  },
  {
    name: "Divisi Humas",
    image: "/assets/image/LogoHumas.png",
    description: "Membangun relasi dengan pihak internal dan eksternal",
    color: "from-indigo-600 to-indigo-400",
    link: "/pages/fungsionaris/humas",
  },
];

export default function StrukturViewHome() {
  const leader = teamMembers.find((member) => member.isLeader);
  const regularMembers = teamMembers.filter((member) => !member.isLeader);

  return (
    <section className="relative w-full py-16 md:py-28 bg-gray-50 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10  bg-repeat bg-[length:80px_80px]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          viewport={{ once: true }} 
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
            <IoPeopleCircleOutline className="text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Struktur Organisasi</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Tim Pengurus{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              HMPTI
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tim profesional yang membangun dan mengembangkan HMPTI Universitas Duta Bangsa
          </p>
        </motion.div>

        {/* Leader card - centered at the top */}
        {leader && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-center mb-16"
          >
            <div className="w-full max-w-full md:max-w-[470px] group">
              <div className="h-full bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col">
                <div className={`aspect-square bg-gradient-to-r ${leader.color} relative overflow-hidden`}>
                  <div
                    className="w-full h-full bg-cover bg-center opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    style={{
                      backgroundImage: `url(${leader.image})`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                  ></div>
                </div>
                <div className="p-6 flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{leader.name}</h3>
                  <p className="text-gray-600 mb-4">{leader.description}</p>
                  <Link href={leader.link} className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                    Lihat Detail <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Regular members - two rows of 3 cards each */}
        <div className="space-y-12">
          {/* First row of 3 */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {regularMembers.slice(0, 3).map((member, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="group">
                <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col">
                  <div className={`aspect-square bg-gradient-to-r ${member.color} relative overflow-hidden`}>
                    <div
                      className="w-full h-full bg-cover bg-center opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      style={{
                        backgroundImage: `url(${member.image})`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    ></div>
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-gray-600 mb-4">{member.description}</p>
                    <Link href={member.link} className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                      Lihat Detail <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Second row of 3 */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {regularMembers.slice(3, 6).map((member, index) => (
              <motion.div key={index + 3} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="group">
                <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col">
                  <div className={`aspect-square bg-gradient-to-r ${member.color} relative overflow-hidden`}>
                    <div
                      className="w-full h-full bg-cover bg-center opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      style={{
                        backgroundImage: `url(${member.image})`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    ></div>
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-gray-600 mb-4">{member.description}</p>
                    <Link href={member.link} className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                      Lihat Detail <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Tertarik bergabung dengan kami?</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
              Daftar Sekarang <FiArrowRight />
            </button>
            <button className="px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium shadow-sm hover:bg-gray-50 transition-all">Lihat Prosedur</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

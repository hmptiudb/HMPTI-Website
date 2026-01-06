"use client";
import { membersCollection } from "@/lib/firebase";
import { getDocs, orderBy, query } from "firebase/firestore";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FiGithub, FiInstagram, FiMail, FiCamera, FiVideo, FiShare2 } from "react-icons/fi";
import { IoSparkles, IoPeopleCircleOutline, IoMegaphoneOutline } from "react-icons/io5";

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
  phone?: string;
  linkLinkedin?: string;
  linkTwitter?: string;
  bio?: string;
  motto?: string;
  skills?: string[];
}

export default function KominfoPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        const q = query(membersCollection, orderBy("position"));
        const snapshot = await getDocs(q);
        const allMembers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Member);

        // Filter members from Kominfo division
        const kominfoMembers = allMembers.filter((member) => member.division === "Kominfo");

        // Sort members: Koordinator first, then others
        const sortedMembers = kominfoMembers.sort((a, b) => {
          if (a.position === "Koordinator") return -1;
          if (b.position === "Koordinator") return 1;
          return 0;
        });

        setMembers(sortedMembers);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Gagal memuat data divisi kominfo");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-br from-amber-50/30 to-orange-50/20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-gray-50/30 to-white/20"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2U1ZTVlNSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]"></div>
        
        {/* Floating Shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/10 rounded-full blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-200/10 rounded-full blur-3xl"
          animate={{
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10">
        <HeroSection />
        <TeamSection members={members} />
        <DivisionInfoSection />
      </div>
    </main>
  );
}

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center">
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-4"
      >
        <IoMegaphoneOutline className="text-white text-xl" />
      </motion.div>
      <p className="text-gray-600 font-medium">Memuat data kominfo...</p>
    </div>
  </div>
);

const ErrorScreen = ({ error }: { error: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center max-w-md"
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <IoPeopleCircleOutline className="text-red-500 text-2xl" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        Coba Lagi
      </button>
    </motion.div>
  </div>
);

const HeroSection = () => (
  <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100 mb-8"
      >
        <IoMegaphoneOutline className="text-amber-500" />
        <span className="text-sm font-medium text-amber-700">Divisi Komunikasi & Informasi</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
      >
        Tim
        <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Kominfo
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
      >
        Menjaga komunikasi efektif dan menyebarkan informasi dengan kreativitas tanpa batas
      </motion.p>
    </div>
  </section>
);

const TeamSection = ({ members }: { members: Member[] }) => {
  const coordinators = members.filter(member => member.position === "Koordinator");
  const regularMembers = members.filter(member => member.position !== "Koordinator");

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Coordinators Section */}
        {coordinators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Koordinator Kominfo
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Pemimpin yang mengarahkan strategi komunikasi dan penyebaran informasi organisasi
              </p>
            </div>

            <div className="grid grid-cols-1  gap-8">
              {coordinators.map((member, index) => (
                <MemberCard key={member.id} member={member} index={index} isCoordinator={true} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Regular Members Section */}
        {regularMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Anggota Kominfo
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Tim kreatif yang menghubungkan organisasi dengan dunia melalui konten berkualitas
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {regularMembers.map((member, index) => (
                <MemberCard key={member.id} member={member} index={index} isCoordinator={false} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {members.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <IoPeopleCircleOutline className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Anggota</h3>
            <p className="text-gray-500">Data anggota divisi kominfo akan segera tersedia</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

const MemberCard = ({ member, index, isCoordinator }: { member: Member; index: number; isCoordinator: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="group"
  >
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={member.imageUrl}
          alt={member.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Position Badge */}
        {isCoordinator && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-500 text-white text-xs font-semibold rounded-full">
              Koordinator
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
        <p className="text-gray-500 text-sm mb-4">NIM: {member.nim}</p>

        {/* Skills */}
        {member.skills && member.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {member.skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                  {skill}
                </span>
              ))}
              {member.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{member.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="flex gap-3">
          {member.linkInstagram && (
            <a
              href={member.linkInstagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors group/social"
              aria-label="Instagram"
            >
              <FiInstagram className="text-gray-700 group-hover/social:text-pink-600 text-lg transition-colors" />
            </a>
          )}
          {member.linkGithub && (
            <a
              href={member.linkGithub}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors group/social"
              aria-label="GitHub"
            >
              <FiGithub className="text-gray-700 group-hover/social:text-gray-900 text-lg transition-colors" />
            </a>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors group/social"
              aria-label="Email"
            >
              <FiMail className="text-gray-700 group-hover/social:text-red-600 text-lg transition-colors" />
            </a>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const DivisionInfoSection = () => (
  <section className="py-20 bg-gray-50">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShare2 className="text-amber-600 text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tugas Divisi Kominfo</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Bertanggung jawab atas komunikasi internal, eksternal, dan penyebaran informasi organisasi
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <IoSparkles className="text-amber-500" />
              Tanggung Jawab Utama
            </h3>
            <ul className="space-y-4">
              {[
                "Mengelola media sosial dan website organisasi",
                "Membuat konten kreatif untuk promosi kegiatan",
                "Mendokumentasikan kegiatan melalui foto dan video",
                "Menjaga komunikasi dengan anggota dan pihak eksternal"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <FiCamera className="text-orange-500" />
              Keahlian yang Dibutuhkan
            </h3>
            <ul className="space-y-4">
              {[
                "Kemampuan desain grafis dan editing konten",
                "Keterampilan fotografi dan videografi",
                "Kemampuan menulis dan komunikasi yang baik",
                "Penguasaan platform media sosial dan tools digital"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <FiVideo className="text-amber-500" />
            Platform yang Dikelola
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Instagram", color: "bg-pink-100 text-pink-700" },
              { name: "Website", color: "bg-blue-100 text-blue-700" },
              { name: "YouTube", color: "bg-red-100 text-red-700" },
              { name: "LinkedIn", color: "bg-sky-100 text-sky-700" },
              { name: "TikTok", color: "bg-black text-white" },
              { name: "Newsletter", color: "bg-green-100 text-green-700" },
              { name: "Design", color: "bg-amber-100 text-amber-700" },
              { name: "Photography", color: "bg-purple-100 text-purple-700" },
            ].map((platform, index) => (
              <div key={index} className={`px-3 py-2 rounded-lg text-center text-sm font-medium ${platform.color}`}>
                {platform.name}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12 pt-8 border-t border-gray-100"
        >
          <p className="text-gray-600 italic">
            "Komunikasi yang efektif adalah jembatan antara ide dan realitas, antara organisasi dan dunia."
          </p>
        </motion.div>
      </motion.div>
    </div>
  </section>
);
"use client";
import { membersCollection } from "@/lib/firebase";
import { getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiGithub, FiInstagram, FiMail } from "react-icons/fi";
import { IoPeopleCircleOutline } from "react-icons/io5";

interface Member {
  id: string;
  nim: string;
  name: string;
  division?: string;
  position?: string;
  imageUrl: string;
  status?: string;
  linkInstagram: string;
  linkGithub: string;
  email?: string;
}

const divisionOrder = ["Ketua", "Wakil", "Bendahara", "Sekretaris", "Riset&Teknologi", "Kominfo", "Minat&Bakat", "Humas"];

const divisionColors: Record<string, string> = {
  Ketua: "from-blue-600 to-blue-400",
  Wakil: "from-purple-600 to-purple-400",
  Bendahara: "from-green-600 to-green-400",
  Sekretaris: "from-red-600 to-red-400",
  "Riset&Teknologi": "from-yellow-600 to-yellow-400",
  Kominfo: "from-pink-600 to-pink-400",
  "Minat&Bakat": "from-indigo-600 to-indigo-400",
  Humas: "from-teal-600 to-teal-400",
};

export default function ExecutiveViewHome() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const snapshot = await getDocs(membersCollection);
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Member)
        .filter(
          (member) =>
            divisionOrder.includes(member.division || "") &&
            ((member.division === "Ketua" && member.position === "Ketua") ||
              (member.division === "Wakil" && member.position === "Wakil Ketua") ||
              (member.division === "Bendahara" && member.position === "Bendahara") ||
              (member.division === "Sekretaris" && member.position === "Sekretaris") ||
              (member.division !== "Ketua" && member.division !== "Wakil" && member.position === "Koordinator")),
        )
        .sort((a, b) => divisionOrder.indexOf(a.division!) - divisionOrder.indexOf(b.division!));
      setMembers(data);
    };
    fetchMembers();
  }, []);

  return (
    <section className="relative w-full py-16 md:py-28 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('/assets/image/grid-pattern.svg')] bg-repeat bg-[length:80px_80px]"></div>

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
            <span className="text-sm font-medium text-blue-700">Tim Pengurus</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Pengurus Inti
            </span>{' '}
            HMPTI
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tim inti yang menggerakkan dan memimpin HMPTI Universitas Duta Bangsa
          </p>
        </motion.div>


        {/* Members grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
              }}
              viewport={{ once: true, margin: "-100px" }}
              className="group"
            >
              <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                {/* Gradient border based on division */}
                <div className={`h-1 bg-gradient-to-r ${divisionColors[member.division!] || "from-gray-400 to-gray-300"}`}></div>

                {/* Member photo */}
                <div className="relative aspect-square overflow-hidden">
                  <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
                    <h3 className="text-xl font-bold text-white">{member.name}</h3>
                  </div>
                </div>

                {/* Member info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-gray-500">NIM: {member.nim}</p>
                      <h4 className="text-lg font-semibold text-gray-900 mt-1">{member.position}</h4>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        member.division === "Ketua" || member.division === "Wakil" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {member.division}
                    </span>
                  </div>

                  {/* Social links */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    {member.linkInstagram && (
                      <a
                        href={member.linkInstagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-500 hover:text-pink-700 transition-colors"
                        aria-label="Instagram"
                      >
                        <FiInstagram size={20} />
                      </a>
                    )}
                    {member.linkGithub && (
                      <a href={member.linkGithub} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 transition-colors" aria-label="GitHub">
                        <FiGithub size={20} />
                      </a>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="text-gray-500 hover:text-blue-600 transition-colors" aria-label="Email">
                        <FiMail size={20} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {members.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="text-center py-12">
            <div className="bg-gray-100 rounded-xl p-8 inline-block">
              <p className="text-gray-500">Data pengurus harian belum tersedia</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

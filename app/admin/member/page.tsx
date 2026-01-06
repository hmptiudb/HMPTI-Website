"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaGithubSquare, FaInstagramSquare, FaEdit, FaTrash, FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { membersCollection } from "@/lib/firebase";
import { addDoc, doc, updateDoc, deleteDoc, getDocs, orderBy, query } from "firebase/firestore";
import { uploadToCloudinary } from "../../../app/api/upload";
import AdminLayout from "../AdminLayout";

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
}

function MemberForm({ existingData, onClose }: { existingData?: Member; onClose: () => void }) {
  const [nim, setNim] = useState(existingData?.nim || "");
  const [name, setName] = useState(existingData?.name || "");
  const [division, setDivision] = useState(existingData?.division || "Ketua");
  const [position, setPosition] = useState(existingData?.position || "Ketua");
  const [status, setStatus] = useState(existingData?.status || "Aktif");
  const [linkInstagram, setLinkInstagram] = useState(existingData?.linkInstagram || "");
  const [linkGithub, setLinkGithub] = useState(existingData?.linkGithub || "");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingData?.imageUrl || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!image) return;
    
    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);
    
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setImage(null);
      return;
    }
    
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = existingData?.imageUrl || "";

      if (image) {
        const uploadedImageUrl = await uploadToCloudinary(image);
        if (!uploadedImageUrl) throw new Error("Gagal mengunggah gambar.");
        imageUrl = uploadedImageUrl;
      }

      const timestamp = new Date().toISOString();

      if (existingData) {
        await updateDoc(doc(membersCollection, existingData.id), {
          nim,
          name,
          division,
          position,
          status,
          linkInstagram,
          linkGithub,
          imageUrl,
          updatedAt: timestamp,
        });
        toast.success("Data berhasil diperbarui!");
      } else {
        await addDoc(membersCollection, {
          nim,
          name,
          division,
          position,
          status,
          linkInstagram,
          linkGithub,
          imageUrl,
          dateCreated: timestamp,
        });
        toast.success("Data berhasil ditambahkan!");
      }

      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat menyimpan data!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden max-h-screen md:max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {existingData ? "Edit Anggota" : "Tambah Anggota"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-grow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                <input
                  type="text"
                  placeholder="NIM"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                  disabled={!!existingData}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="Ketua">Ketua</option>
                  <option value="Wakil">Wakil</option>
                  <option value="Sekretaris">Sekretaris</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Riset&Teknologi">Riset & Teknologi</option>
                  <option value="Kominfo">Kominfo</option>
                  <option value="Minat&Bakat">Minat & Bakat</option>
                  <option value="Humas">Humas</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="Ketua">Ketua</option>
                  <option value="Wakil Ketua">Wakil Ketua</option>
                  <option value="Koordinator">Koordinator</option>
                  <option value="Anggota">Anggota</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Kepengurusan</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>
              
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Gambar</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  accept="image/*"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input
                type="text"
                placeholder="Link Instagram"
                value={linkInstagram}
                onChange={(e) => setLinkInstagram(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Github</label>
              <input
                type="text"
                placeholder="Link Github"
                value={linkGithub}
                onChange={(e) => setLinkGithub(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>
            
            {previewUrl && (
              <div className="flex justify-center mt-4">
                <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-gray-300">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </form>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : existingData ? "Update Anggota" : "Tambah Anggota"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MembersTable() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(membersCollection, orderBy("name"));
        const data = await getDocs(q);
        const membersData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Member);
        setMembers(membersData);
        setFilteredMembers(membersData);
      } catch (error) {
        console.error("Error fetching members:", error);
        toast.error("Gagal memuat data anggota!");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.division?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  }, [searchTerm, members]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus anggota ini?")) return;
    
    try {
      await deleteDoc(doc(membersCollection, id));
      setMembers(members.filter((member) => member.id !== id));
      toast.success("Data berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Gagal menghapus data!");
    }
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedMember(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    // Reload data after form is closed to reflect changes
    const fetchData = async () => {
      const q = query(membersCollection, orderBy("name"));
      const data = await getDocs(q);
      setMembers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Member));
    };
    fetchData();
  };

  return (
    <AdminLayout>
      <div className="md:ml-[250px] min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Manajemen Anggota</h1>
                <p className="text-gray-500 text-sm mt-1">Kelola data anggota organisasi</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari anggota..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <FaPlus className="text-sm" />
                  <span>Tambah Anggota</span>
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <FaSearch className="text-gray-500 text-xl" />
                </div>
                <p className="text-gray-500 text-lg">
                  {searchTerm ? "Tidak ada hasil pencarian" : "Belum ada data anggota."}
                </p>
                <button
                  onClick={handleAddNew}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Tambah Anggota Pertama
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anggota</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Social Media</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full object-cover" src={member.imageUrl} alt={member.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.nim}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.division}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex gap-2">
                            <Link href={member.linkInstagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-700 transition-colors">
                              <FaInstagramSquare className="text-xl" />
                            </Link>
                            <Link href={member.linkGithub} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-900 transition-colors">
                              <FaGithubSquare className="text-xl" />
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(member)}
                              className="text-blue-600 hover:text-blue-900 p-1 transition-colors"
                              title="Edit"
                            >
                              <FaEdit className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="text-red-600 hover:text-red-900 p-1 transition-colors"
                              title="Hapus"
                            >
                              <FaTrash className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {isFormOpen && (
          <MemberForm
            existingData={selectedMember}
            onClose={handleFormClose}
          />
        )}
      </div>
    </AdminLayout>
  );
}
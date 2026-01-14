"use client";

import { eventsCollection } from "@/lib/firebase";
import { addDoc, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaEdit, FaExternalLinkAlt, FaPlus, FaSearch, FaTimes, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { uploadToCloudinary } from "../../../app/api/upload";
import AdminLayout from "../AdminLayout";

interface Event {
  eventName: string;
  id: string;
  dateEvent: string;
  imageUrl: string;
  descriptionEvent: string;
  statusEvent?: string;
  linkForm: string;
  categoryAudiens?: string;
  categoryEvent?: string;
}

function EventForm({ existingData, onClose }: { existingData?: Event; onClose: () => void }) {
  const [eventName, setEventName] = useState(existingData?.eventName || "");
  const [dateEvent, setDateEvent] = useState(existingData?.dateEvent || "");
  const [linkForm, setLinkForm] = useState(existingData?.linkForm || "");
  const [descriptionEvent, setDescriptionEvent] = useState(existingData?.descriptionEvent || "");
  const [statusEvent, setStatusEvent] = useState(existingData?.statusEvent || "Selesai");
  const [categoryAudiens, setCategoryAudiens] = useState(existingData?.categoryAudiens || "Mahasiswa");
  const [categoryEvent, setCategoryEvent] = useState(existingData?.categoryEvent || "Web Development");
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
        await updateDoc(doc(eventsCollection, existingData.id), {
          eventName,
          dateEvent,
          descriptionEvent,
          statusEvent,
          linkForm,
          categoryAudiens,
          categoryEvent,
          updatedAt: timestamp,
          ...(image && { imageUrl }),
        });
        toast.success("Data berhasil diperbarui!");
      } else {
        await addDoc(eventsCollection, {
          eventName,
          dateEvent,
          statusEvent,
          descriptionEvent,
          linkForm,
          categoryAudiens,
          categoryEvent,
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-screen md:max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">{existingData ? "Edit Event" : "Tambah Event"}</h2>
            <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors">
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Event</label>
                <input
                  type="text"
                  placeholder="Nama Event"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pelaksanaan Event</label>
                <input
                  type="date"
                  value={dateEvent}
                  onChange={(e) => setDateEvent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Event</label>
              <textarea
                placeholder="Deskripsi Event"
                value={descriptionEvent}
                onChange={(e) => setDescriptionEvent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Event</label>
                <select
                  value={statusEvent}
                  onChange={(e) => setStatusEvent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="Selesai">Selesai</option>
                  <option value="Pending">Pending</option>
                  <option value="Batal">Batal</option>
                  <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Form</label>
                <input
                  type="text"
                  placeholder="Link Form"
                  value={linkForm}
                  onChange={(e) => setLinkForm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Event</label>
                <select
                  value={categoryEvent}
                  onChange={(e) => setCategoryEvent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="Web Development">Web Development</option>
                  <option value="UI/UX">UI/UX</option>
                  <option value="Web Design">Web Design</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Internet of Things">Internet of Things</option>
                  <option value="Big Data">Big Data</option>
                  <option value="Cyber Security">Cyber Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Audiens</label>
                <select
                  value={categoryAudiens}
                  onChange={(e) => setCategoryAudiens(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="Umum">Umum</option>
                  <option value="Mahasiswa UDB">Mahasiswa UDB</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Gambar</label>
              <input
                type="file"
                onChange={handleImageChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                accept="image/*"
              />
            </div>

            {previewUrl && (
              <div className="flex justify-center mt-4">
                <div className="relative h-48 w-full rounded-lg overflow-hidden border-2 border-gray-300">
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors" disabled={loading}>
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
              ) : existingData ? (
                "Update Event"
              ) : (
                "Tambah Event"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventTable() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(eventsCollection, orderBy("dateEvent", "desc"));
        const data = await getDocs(q);
        const eventsData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Event);
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Gagal memuat data event!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.descriptionEvent.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.categoryEvent?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "Semua") {
      filtered = filtered.filter((event) => event.statusEvent === statusFilter);
    }

    setFilteredEvents(filtered);
  }, [searchTerm, statusFilter, events]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus event ini?")) return;

    try {
      await deleteDoc(doc(eventsCollection, id));
      setEvents(events.filter((event) => event.id !== id));
      toast.success("Data berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Gagal menghapus data!");
    }
  };

  const refreshData = async () => {
    const q = query(eventsCollection, orderBy("dateEvent", "desc"));
    const data = await getDocs(q);
    setEvents(data.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Event));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Selesai":
        return "bg-green-100 text-green-800";
      case "Sedang Berlangsung":
        return "bg-blue-100 text-blue-800";
      case "Coming Soon":
        return "bg-yellow-100 text-yellow-800";
      case "Batal":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Manajemen Event</h1>
                <p className="text-gray-500 text-sm mt-1">Kelola event dan kegiatan organisasi</p>
              </div>
              <button
                onClick={() => {
                  setSelectedEvent(undefined);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <FaPlus className="text-sm" />
                <span>Tambah Event</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Pending">Pending</option>
                  <option value="Batal">Batal</option>
                </select>
              </div>
            </div>

            {isFormOpen && (
              <EventForm
                existingData={selectedEvent}
                onClose={() => {
                  setIsFormOpen(false);
                  refreshData();
                }}
              />
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <FaSearch className="text-gray-500 text-xl" />
                </div>
                <p className="text-gray-500 text-lg">{searchTerm || statusFilter !== "Semua" ? "Tidak ada hasil pencarian" : "Belum ada event yang ditambahkan."}</p>
                <button onClick={() => setIsFormOpen(true)} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Tambah Event Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-40 overflow-hidden">
                      <img src={event.imageUrl} alt={event.eventName} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800 line-clamp-1">{event.eventName}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.statusEvent)}`}>{event.statusEvent}</span>
                      </div>

                      <p className="text-sm text-gray-500 mb-3">{formatDate(event.dateEvent)}</p>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.descriptionEvent}</p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{event.categoryEvent}</span>
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">{event.categoryAudiens}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <a href={event.linkForm} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                          Link Form <FaExternalLinkAlt className="text-xs" />
                        </a>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setIsFormOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 transition-colors"
                            title="Edit"
                          >
                            <FaEdit className="text-lg" />
                          </button>
                          <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-900 p-1 transition-colors" title="Hapus">
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

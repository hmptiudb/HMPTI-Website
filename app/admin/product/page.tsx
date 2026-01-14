"use client";
import { uploadToCloudinary } from "@/app/api/upload";
import { productsCollection } from "@/lib/firebase";
import { addDoc, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaSearch, FaTimes, FaTrash, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import AdminLayout from "../AdminLayout";

interface Product {
  id: string;
  imageUrl: string;
  productName: string;
  priceProduct: string;
  descriptionProduct: string;
  whatsappNumber: string;
  dateCreated?: string;
}

function ProductForm({ existingData, onClose }: { existingData?: Product; onClose: () => void }) {
  const [productName, setProductName] = useState(existingData?.productName || "");
  const [priceProduct, setPriceProduct] = useState(existingData?.priceProduct || "");
  const [descriptionProduct, setDescriptionProduct] = useState(existingData?.descriptionProduct || "");
  const [whatsappNumber, setWhatsappNumber] = useState(existingData?.whatsappNumber || "");
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

  async function handleSubmit(e: React.FormEvent) {
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
        await updateDoc(doc(productsCollection, existingData.id), {
          productName,
          priceProduct,
          descriptionProduct,
          whatsappNumber,
          ...(image && { imageUrl }),
          updatedAt: timestamp,
        });
        toast.success("Data berhasil diperbarui!");
      } else {
        await addDoc(productsCollection, {
          productName,
          priceProduct,
          descriptionProduct,
          whatsappNumber,
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
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-screen md:max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">{existingData ? "Edit Produk" : "Tambah Produk Baru"}</h2>
            <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors">
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <input
                  type="text"
                  placeholder="Nama Produk"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Produk</label>
                <input
                  type="text"
                  placeholder="Harga"
                  value={priceProduct}
                  onChange={(e) => setPriceProduct(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp</label>
              <input
                type="text"
                placeholder="Nomor WhatsApp"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Produk</label>
              <textarea
                placeholder="Deskripsi Produk"
                value={descriptionProduct}
                onChange={(e) => setDescriptionProduct(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                rows={3}
                required
              />
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
                "Update Produk"
              ) : (
                "Tambah Produk"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductItem, setSelectedProductItem] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) => product.productName.toLowerCase().includes(searchTerm.toLowerCase()) || product.descriptionProduct.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const q = query(productsCollection, orderBy("dateCreated", "desc"));
      const data = await getDocs(q);
      const productsData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Product);
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Gagal mengambil data produk!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    try {
      await deleteDoc(doc(productsCollection, id));
      setProducts(products.filter((product) => product.id !== id));
      toast.success("Data berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Gagal menghapus data!");
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProduct(undefined);
    fetchProducts();
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  const openWhatsApp = (number: string) => {
    const formattedNumber = number.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${formattedNumber}`, "_blank");
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Manajemen Produk</h1>
                <p className="text-gray-500 text-sm mt-1">Kelola produk yang ditampilkan di website</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <FaPlus className="text-sm" />
                  <span>Tambah Produk</span>
                </button>
              </div>
            </div>

            {isFormOpen && <ProductForm existingData={selectedProduct} onClose={handleCloseForm} />}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <FaSearch className="text-gray-500 text-xl" />
                </div>
                <p className="text-gray-500 text-lg">{searchTerm ? "Tidak ada hasil pencarian" : "Belum ada produk yang ditambahkan."}</p>
                <button onClick={() => setIsFormOpen(true)} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Tambah Produk Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-48 overflow-hidden">
                      <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-cover cursor-pointer" onClick={() => setSelectedProductItem(product)} />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1">{product.productName}</h3>

                      <p className="text-lg font-bold text-blue-600 mb-2">{formatPrice(product.priceProduct)}</p>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.descriptionProduct}</p>

                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => openWhatsApp(product.whatsappNumber)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm transition-colors"
                          title="Hubungi via WhatsApp"
                        >
                          <FaWhatsapp className="text-base" />
                          <span>Hubungi</span>
                        </button>

                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 p-1 transition-colors" title="Edit">
                            <FaEdit className="text-lg" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 p-1 transition-colors" title="Hapus">
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedProductItem && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-800">Detail Produk</h2>
                      <button onClick={() => setSelectedProductItem(null)} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors">
                        <FaTimes className="text-lg" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <img src={selectedProductItem.imageUrl} alt={selectedProductItem.productName} className="w-full h-64 object-cover rounded-lg mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedProductItem.productName}</h1>
                    <p className="text-2xl font-bold text-blue-600 mb-4">{formatPrice(selectedProductItem.priceProduct)}</p>
                    <p className="text-gray-700 leading-relaxed mb-6">{selectedProductItem.descriptionProduct}</p>
                    <button
                      onClick={() => openWhatsApp(selectedProductItem.whatsappNumber)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      <FaWhatsapp className="text-lg" />
                      <span>Hubungi via WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

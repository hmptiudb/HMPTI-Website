"use client";

import { auth, db, eventsCollection, membersCollection, newsCollection, productsCollection } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  AiFillProduct, 
  AiOutlineLogout, 
  AiOutlineDashboard,
  AiOutlineTeam,
  AiOutlineCalendar,
  AiOutlineFileText,
  AiOutlineShop
} from "react-icons/ai";
import { 
  FaGithubSquare, 
  FaInstagramSquare, 
  FaRegNewspaper,
  FaWhatsapp
} from "react-icons/fa";
import { 
  FaPeopleGroup,
  FaArrowRight
} from "react-icons/fa6";
import { 
  MdEvent,
  MdOutlineEmail,
  MdOutlineNotificationsNone
} from "react-icons/md";
import { 
  SiLimesurvey 
} from "react-icons/si";
import Link from "next/link";
import TransitionLayout from "@/components/TransitionLayout";
import AdminLayout from "../AdminLayout";

interface Event {
  createdAt: string | number | Date;
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

interface Member {
  createdAt: string | number | Date;
  nim: string;
  name: string;
  division?: string;
  position?: string;
  imageUrl: string;
  status?: string;
  linkInstagram: string;
  linkGithub: string;
  id: string;
}

interface New {
  createdAt: string | number | Date;
  descriptionNews: string;
  titleNews: string;
  writterNews: string;
  categoryNews?: string;
  imageUrl: string;
  dateCreated: string;
  id: string;
}

interface Product {
  createdAt: string | number | Date;
  id: string;
  imageUrl: string;
  productName: string;
  priceProduct: string;
  descriptionProduct: string;
  whatsappNumber: string;
}

function DashboardCount() {
  const [memberCount, setMemberCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersSnapshot, eventsSnapshot, newsSnapshot, productsSnapshot] = await Promise.all([
          getDocs(collection(db, "members")),
          getDocs(collection(db, "events")),
          getDocs(collection(db, "news")),
          getDocs(collection(db, "products"))
        ]);
        
        setMemberCount(membersSnapshot.size);
        setEventCount(eventsSnapshot.size);
        setNewsCount(newsSnapshot.size);
        setProductCount(productsSnapshot.size);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "Jumlah Anggota",
      value: memberCount,
      icon: <FaPeopleGroup className="text-xl" />,
      color: "bg-blue-100 text-blue-600",
      path: "/admin/member"
    },
    {
      title: "Jumlah Event",
      value: eventCount,
      icon: <MdEvent className="text-xl" />,
      color: "bg-purple-100 text-purple-600",
      path: "/admin/event"
    },
    {
      title: "Jumlah Berita",
      value: newsCount,
      icon: <FaRegNewspaper className="text-xl" />,
      color: "bg-green-100 text-green-600",
      path: "/admin/news"
    },
    {
      title: "Jumlah Produk",
      value: productCount,
      icon: <AiFillProduct className="text-xl" />,
      color: "bg-yellow-100 text-yellow-600",
      path: "/admin/product"
    },
    {
      title: "Respon Survey",
      value: 20,
      icon: <SiLimesurvey className="text-xl" />,
      color: "bg-pink-100 text-pink-600",
      path: "#"
    }
  ];

  return (
    <div className="py-6 px-6 md:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <Link href={stat.path} key={index} className="group">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-200">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                {stat.icon}
              </div>
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function DashboardViewEvent() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDocs(eventsCollection);
      setEvents(data.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Event));
    };
    fetchData();
  }, []);

  return (
    <div className="w-full bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-semibold text-lg flex items-center">
          <AiOutlineCalendar className="mr-2 text-blue-500" />
          Event Terbaru
        </h2>
        <Link href="/admin/event" className="text-sm text-blue-500 font-medium flex items-center hover:underline">
          Lihat semua <FaArrowRight className="ml-1 text-xs" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events
          .map((event) => ({
            ...event,
            createdAt: event.createdAt instanceof Date ? event.createdAt : new Date(event.createdAt),
          }))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 4)
          .map((event) => (
            <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <img src={event.imageUrl} alt={event.eventName} className="w-16 h-16 rounded-lg object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{event.eventName}</h3>
                  <p className="text-sm text-gray-500 mt-1">{event.dateEvent}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${event.statusEvent === "Selesai" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                      {event.statusEvent}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function DashboardViewMember() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDocs(membersCollection);
      setMembers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Member));
    };
    fetchData();
  }, []);

  return (
    <div className="w-full bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-semibold text-lg flex items-center">
          <AiOutlineTeam className="mr-2 text-purple-500" />
          Anggota HMPTI
        </h2>
        <Link href="/admin/member" className="text-sm text-blue-500 font-medium flex items-center hover:underline">
          Lihat semua <FaArrowRight className="ml-1 text-xs" />
        </Link>
      </div>

      <div className="space-y-4">
        {members
          .map((member) => ({
            ...member,
            createdAt: member.createdAt instanceof Date ? member.createdAt : new Date(member.createdAt),
          }))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5)
          .map((member) => (
            <div key={member.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <img src={member.imageUrl} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="ml-3 flex-1">
                <h3 className="font-medium text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.division} • {member.position}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${member.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                {member.status}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function DashboardViewNews() {
  const [news, setNews] = useState<New[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDocs(newsCollection);
      setNews(data.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as New));
    };
    fetchData();
  }, []);

  return (
    <div className="w-full bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-semibold text-lg flex items-center">
          <AiOutlineFileText className="mr-2 text-green-500" />
          Berita Terbaru
        </h2>
        <Link href="/admin/news" className="text-sm text-blue-500 font-medium flex items-center hover:underline">
          Lihat semua <FaArrowRight className="ml-1 text-xs" />
        </Link>
      </div>

      <div className="space-y-4">
        {news
          .map((neww) => ({
            ...neww,
            createdAt: neww.createdAt instanceof Date ? neww.createdAt : new Date(neww.createdAt),
          }))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 4)
          .map((neww) => (
            <div key={neww.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <h3 className="font-medium text-gray-900 line-clamp-1">{neww.titleNews}</h3>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <span>{neww.writterNews}</span>
                <span className="mx-2">•</span>
                <span>{neww.dateCreated}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{neww.descriptionNews}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

function DashboardViewProduct() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDocs(productsCollection);
      setProducts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Product));
    };
    fetchData();
  }, []);

  return (
    <div className="w-full bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-semibold text-lg flex items-center">
          <AiOutlineShop className="mr-2 text-yellow-500" />
          Produk Terbaru
        </h2>
        <Link href="/admin/product" className="text-sm text-blue-500 font-medium flex items-center hover:underline">
          Lihat semua <FaArrowRight className="ml-1 text-xs" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products
          .map((product) => ({
            ...product,
            createdAt: product.createdAt instanceof Date ? product.createdAt : new Date(product.createdAt),
          }))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 3)
          .map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200">
              <div className="h-40 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{product.productName}</h3>
                <p className="text-lg font-semibold text-gray-800 mt-1">{product.priceProduct}</p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.descriptionProduct}</p>
                <a
                  href={`https://wa.me/${product.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center text-sm"
                >
                  <FaWhatsapp className="mr-2" />
                  WhatsApp
                </a>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/auth/login");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth/login");
  };

  return (
    <AdminLayout>
    <div className="flex h-screen bg-gray-50">
     

      {/* Main Content */}
      <div className="md:ml-64 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button 
                className="md:hidden mr-2 text-gray-500"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <MdOutlineNotificationsNone className="text-xl" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <MdOutlineEmail className="text-xl" />
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {user.email ? user.email[0].toUpperCase() : 'A'}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        </header>



        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <TransitionLayout />
          
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Selamat Datang, {user.email}</h1>
            <p className="text-gray-600">Himpunan Mahasiswa Prodi Teknik Informatika</p>
          </div>

          {/* Stats Cards */}
          <DashboardCount />

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <DashboardViewMember />
            <DashboardViewEvent />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <DashboardViewNews />
            <DashboardViewProduct />
          </div>
        </main>
      </div>
    </div>
    </AdminLayout>
  );
}
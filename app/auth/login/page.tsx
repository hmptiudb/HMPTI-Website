"use client";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login berhasil!");
      router.push("/admin/dashboard");
    } catch (error) {
      toast.error("Email atau password salah!");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center text-[#374785] justify-center min-h-screen bg-[#374785] shadow-xl shadow-black p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row w-full max-w-3xl">
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-center mb-4">Login Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded" required />
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded" disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </button>
          </form>
        </div>

        <div className="w-full md:w-1/2  md:block">
          <img src="/assets/image/HMPTIlogo.png" alt="Login Illustration" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}

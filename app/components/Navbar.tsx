// app/components/Navbar.tsx
import { Search, Wallet, BarChart3 } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-[#0d1117] border-b border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <BarChart3 className="text-blue-500" size={28} />
        <span className="text-xl font-bold text-white tracking-tighter">REPUTA</span>
      </div>

      {/* Search Bar - الأداة الأساسية لجلب بيانات المحفظة */}
      <div className="hidden md:flex flex-1 max-w-xl mx-10">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by Wallet Address (0x...)" 
            className="w-full bg-[#161b22] border border-gray-700 rounded-full py-2 px-10 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white text-sm font-medium transition">Dashboard</button>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          <Wallet size={16} />
          Connect
        </button>
      </div>
    </nav>
  );
}
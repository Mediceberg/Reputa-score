// app/page.tsx
import Navbar from './components/Navbar';
import ScoreCard from './components/ScoreCard';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* قسم التقييم */}
          <div className="lg:col-span-1">
            <ScoreCard score={75} status="TRUSTED" />
          </div>

          {/* قسم الإحصائيات (سنقوم ببنائه في الخطوة القادمة) */}
          <div className="lg:col-span-2 bg-[#161b22] border border-gray-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Activity Analysis</h2>
            <div className="h-64 flex items-end gap-2">
               {/* هنا سنضع الرسم البياني لاحقاً */}
               <div className="w-full h-full border-b border-l border-gray-700 flex items-center justify-center text-gray-600 italic">
                 Transaction Volume Graph (Coming Next...)
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
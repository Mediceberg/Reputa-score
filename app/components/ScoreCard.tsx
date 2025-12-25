// app/components/ScoreCard.tsx
export default function ScoreCard({ score = 50, status = "CASUAL" }) {
  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
      {/* خلفية جمالية خفيفة */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-[80px]"></div>
      
      <div className="flex flex-col items-center">
        <h3 className="text-gray-400 text-sm font-medium mb-6">Trust Score</h3>
        
        {/* الدائرة المركزية (Gauge) */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full rotate-[-90deg]">
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-800" />
            <circle 
              cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
              strokeDasharray={552}
              strokeDashoffset={552 - (552 * score) / 100}
              className="text-blue-500 transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-bold text-white">{score}</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">out of 100</span>
          </div>
        </div>

        <div className="mt-6 px-4 py-1 bg-blue-500/20 rounded-full">
          <span className="text-blue-400 text-xs font-bold">{status}</span>
        </div>
      </div>
    </div>
  );
}
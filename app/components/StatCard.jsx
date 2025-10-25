import CopilotIcon from "./CopilotIcon";

export default function StatCard({ currentCount }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12 mb-6 sm:mb-8">
      <div className="absolute inset-0 bg-black opacity-5"></div>
      <div className="relative text-center">
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <div className="text-white drop-shadow-lg">
            <CopilotIcon size={48} />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 text-white drop-shadow-lg">
          Copilot at Work
        </h1>
        <p className="text-white/90 text-base sm:text-lg md:text-xl mb-6 sm:mb-8 font-medium">
          Tracking merged Copilot PRs worldwide
        </p>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 inline-block">
          <p className="text-white/80 text-xs mb-2 font-medium uppercase tracking-wider">
            Total Merged PRs (Public)
          </p>
          <p className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-lg">
            {currentCount.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

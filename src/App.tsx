import { Crown, Brain, Users, Sparkles } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-[#0e1f3e]">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="bg-[#ca3433] rounded-full p-6 shadow-2xl">
                <Crown className="w-16 h-16 text-white" strokeWidth={2} />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              CHESS KIDS CLASS
            </h1>

            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12">
              <p className="text-xl md:text-2xl text-[#0e1f3e] leading-relaxed">
                Curious about making strategic moves and boosting brainpower? Join our chess program where kids learn to{' '}
                <span className="font-semibold text-[#ca3433]">think critically</span> and develop{' '}
                <span className="font-semibold text-[#ca3433]">problem-solving skills</span>, all while having fun and making friends!
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-[#f7e0e0] rounded-xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-[#ca3433] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0e1f3e] mb-3">Think Critically</h3>
              <p className="text-[#0e1f3e] text-lg">
                Develop strategic thinking and decision-making skills that last a lifetime
              </p>
            </div>

            <div className="bg-[#f7e0e0] rounded-xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-[#ca3433] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0e1f3e] mb-3">Have Fun</h3>
              <p className="text-[#0e1f3e] text-lg">
                Learn chess through engaging games and activities designed for kids
              </p>
            </div>

            <div className="bg-[#f7e0e0] rounded-xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-[#ca3433] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0e1f3e] mb-3">Make Friends</h3>
              <p className="text-[#0e1f3e] text-lg">
                Connect with fellow chess enthusiasts in a friendly, supportive environment
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <button className="bg-[#ca3433] hover:bg-[#a82a29] text-white font-bold text-xl px-12 py-5 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300">
              Join Our Program
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

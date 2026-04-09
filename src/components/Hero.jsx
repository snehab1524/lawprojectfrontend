const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center py-24">

      {/* LEFT SIDE */}

      <div className="space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Legal Intelligence
          <br />
          <span className="bg-gradient-to-r from-gray-400 to-gray-200 bg-clip-text text-transparent">
            at Your Fingertips
          </span>
        </h1>

        <p className="mt-6 text-gray-400 text-lg">
          Instantly connect with verified lawyers and use our 
          AI-powered legal assistant to analyze cases, 
          summarize documents, and guide you through legal processes.
        </p>

        {/* SEARCH BAR */}

        <div className="flex bg-gray-900 rounded-xl overflow-hidden shadow-lg">
          <input
            className="flex-1 px-5 py-4 bg-transparent outline-none text-white placeholder-gray-500"
            placeholder="Describe your legal issue (e.g. property dispute)..."
          />
          <button className="bg-gray-600 text-white px-6 font-semibold hover:bg-gray-500 hover:scale-105 transition-all px-8">
            Analyze
          </button>
        </div>

        {/* STATS */}

        <div className="flex gap-10 mt-10 text-sm text-gray-400">
          <div>
            <p className="text-gray-300 text-xl font-bold">
              500+
            </p>
            <p>Lawyers</p>
          </div>
          <div>
            <p className="text-gray-300 text-xl font-bold">
              10k+
            </p>
            <p>Cases Solved</p>
          </div>
          <div>
            <p className="text-gray-300 text-xl font-bold">
              95%
            </p>
            <p>Success Rate</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="relative h-96 flex items-center justify-center">
        {/* Glow background */}
        <div className="absolute w-72 h-72 bg-gray-400 blur-[120px] opacity-30 rounded-full"></div>
        {/* AI Graphic Placeholder */}
        <div className="relative bg-gray-900 w-80 h-80 rounded-2xl flex items-center justify-center border border-gray-700 p-8">
          <p className="text-gray-400 text-center">
            AI Neural Network
          </p>
        </div>
      </div>

    </section>
  )
}

export default Hero


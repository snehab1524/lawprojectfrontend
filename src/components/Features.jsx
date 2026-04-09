import { Brain, Scale, FileText, MessageSquare } from "lucide-react"

const Features = () => {

  const features = [

    {
      icon: <Brain size={30}/>,
      title: "AI Case Prediction",
      desc: "Our machine learning models analyze previous cases to predict possible outcomes."
    },

    {
      icon: <Scale size={30}/>,
      title: "Smart Lawyer Matching",
      desc: "Automatically match with the best lawyer based on specialization and case history."
    },

    {
      icon: <FileText size={30}/>,
      title: "Document Analysis",
      desc: "Upload legal documents and get AI-powered summaries instantly."
    },

    {
      icon: <MessageSquare size={30}/>,
      title: "Legal Chat Assistant",
      desc: "Chat with our AI assistant to understand legal procedures and options."
    }

  ]

  return (

    <section className="max-w-7xl mx-auto py-24">

      <h2 className="text-4xl font-bold text-center mb-16">

        AI Powered Legal Platform

      </h2>

      <div className="grid md:grid-cols-4 gap-8">

        {features.map((feature,index)=>(

<div
          key={index}
          className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-xl hover:scale-105 hover:border-white transition-all">
            <div className="text-white mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-400 text-sm">
              {feature.desc}
            </p>
          </div>

        ))}

      </div>

    </section>

  )
}

export default Features
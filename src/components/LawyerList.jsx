import LawyerCard from "./LawyerCard"

const LawyerList = () => {

  const lawyers = [
    {name:"Rahul Sharma",specialization:"Corporate",score:92},
    {name:"Ananya Singh",specialization:"Criminal",score:88},
    {name:"Arjun Mehta",specialization:"Family Law",score:90}
  ]

  return (
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 py-20">

      {/* FILTER */}
      <div className="bg-slate-800 p-6 rounded-xl">

        <h3 className="font-semibold mb-4">
          Filter by Practice
        </h3>

        <ul className="space-y-2 text-gray-400">

          <li>Corporate</li>
          <li>Criminal</li>
          <li>Family</li>
          <li>Property</li>

        </ul>

      </div>

      {/* LAWYER GRID */}
      <div className="md:col-span-3 grid md:grid-cols-3 gap-6">

        {lawyers.map((lawyer,index)=>(
          <LawyerCard
            key={index}
            {...lawyer}
          />
        ))}

      </div>

    </div>
  )
}

export default LawyerList
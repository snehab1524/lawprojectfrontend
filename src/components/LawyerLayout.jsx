import LawyerNavbar from "./LawyerNavbar"
import LawyerSidebar from "./LawyerSidebar"

const LawyerLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <LawyerSidebar />
      <div className="flex flex-1 flex-col">
        <LawyerNavbar />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default LawyerLayout

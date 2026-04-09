import Navbar from "./Navbar"
import { Outlet } from "react-router-dom"
import Footer from "./Footer"

const Layout = () => {
  return (
    <>
      <Navbar />
      <main className="app-container pt-24">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default Layout

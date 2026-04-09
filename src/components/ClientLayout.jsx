import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const ClientLayout = () => {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Outlet />
      </main>
    </>
  );
};

export default ClientLayout;

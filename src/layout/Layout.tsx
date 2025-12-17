import React from "react";
import Footer from "../shared/Footer"; 
import Navbar from "../shared/Navbar"; 
import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default Layout;

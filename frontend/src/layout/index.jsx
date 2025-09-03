import React from "react";
import Navbar from "../navbar";
import Footer from "../footer";

const Layout = ({ children }) => {
  return (
    <>
      <div className="flex flex-col  ">
        <header>
          <Navbar />
        </header>

        <main className="md:flex-grow bg-almostBlack">{children}</main>

        <footer>
          <Footer />
        </footer>
      </div>
    </>
  );
};

export default Layout;

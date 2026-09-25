import { Outlet, useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

function Layout() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default Layout;

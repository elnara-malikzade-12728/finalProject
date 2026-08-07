import { Outlet, ScrollRestoration } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

function Layout() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>

      <Footer />

      <ScrollRestoration />
    </div>
  );
}

export default Layout;
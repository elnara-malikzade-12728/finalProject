import {
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  BookOpen,
  Video,
  ListChecks,
} from "lucide-react";
import {
  NavLink,
  Outlet,
} from "react-router-dom";

const adminLinks = [
  {
    to: "/admin",
    label: "İcmal",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/admin/courses",
    label: "Kurslar",
    icon: BookOpen,
    end: false,
  },
  {
    to: "/admin/tests",
    label: "Testlər",
    icon: ListChecks,
    end: false,
  },
  {
    to: "/admin/videos",
    label: "Video dərslər",
    icon: Video,
    end: false,
  },
  {
    to: "/admin/jobs",
    label: "Vakansiyalar",
    icon: BriefcaseBusiness,
    end: true,
  },
  {
    to: "/admin/applications",
    label: "Müraciətlər",
    icon: ClipboardList,
    end: false,
  },
];

function AdminLayout() {
  return (
    <section className="section admin-section">
      <div className="container admin-layout">
        <header className="admin-header">
          <div>
            <span className="eyebrow">
              İdarəetmə paneli
            </span>

            <h1>Administrator paneli</h1>

            <p>
              Təlimləri, videoları,
              vakansiyaları və istifadəçi
              müraciətlərini idarə edin.
            </p>
          </div>
        </header>

        <nav
          className="admin-navigation"
          aria-label="Administrator menyusu"
        >
          {adminLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  isActive
                    ? "admin-navigation-link admin-navigation-link-active"
                    : "admin-navigation-link"
                }
              >
                <Icon
                  size={19}
                  aria-hidden="true"
                />

                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </section>
  );
}

export default AdminLayout;

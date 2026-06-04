import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";

export default function Sidebar({ activePage = "" }) {
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkScreenSize() {
      setIsMobile(window.innerWidth < 768);
    }

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    async function fetchUserRole() {
      if (!session?.user?.email) return;

      const { data, error } = await supabase
        .from("Users")
        .select("role")
        .eq("email", session.user.email)
        .single();

      if (error) {
        console.error("Sidebar role error:", error);
        return;
      }

      setUserRole(data?.role || "");
    }

    fetchUserRole();
  }, [session]);

  const isAdmin = userRole === "admin";
  const isCoach = userRole === "coach";

  const links = [
    { label: "Dashboard", href: "/dashboard", key: "dashboard" },
    { label: "My Progress", href: "/my-progress", key: "my-progress" },

    ...(isAdmin || isCoach
      ? [
          { label: "Activity", href: "/activity", key: "activity" },
          { label: "Glyphs", href: "/glyphs", key: "glyphs" },
          { label: "Athletes", href: "/athletes", key: "athletes" },
          { label: "Classes", href: "/classes", key: "classes" },
          { label: "Enrollments", href: "/enrollments", key: "enrollments" },
          { label: "Attendance", href: "/attendance", key: "attendance" },
          { label: "Skill Pyramid", href: "/skills", key: "skills" },
        ]
      : []),

    ...(isAdmin
      ? [
          { label: "Payments", href: "/payments", key: "payments" },
          { label: "Settings", href: "/settings", key: "settings" },
        ]
      : []),
  ];

  const sidebarDisplayStyle = isMobile
    ? {
        position: "fixed",
        top: 0,
        left: mobileOpen ? 0 : "-280px",
        height: "100vh",
        zIndex: 999,
      }
    : {};

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={mobileButton}
        >
          ☰
        </button>
      )}

      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={overlayStyle}
        />
      )}

      <aside style={{ ...sidebarStyle, ...sidebarDisplayStyle }}>
        <h2 style={{ color: "#d4af37", marginBottom: "2rem" }}>
          Anubix
        </h2>

        <nav style={navStyle}>
          {links.map((link) => (
            <a
              key={link.key}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                ...navLink,
                color: activePage === link.key ? "#d4af37" : "#cfcfcf",
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}

const sidebarStyle = {
  width: "240px",
  minWidth: "240px",
  background: "#111118",
  borderRight: "1px solid #2a2a35",
  padding: "1.5rem",
  transition: "left 0.25s ease",
};

const mobileButton = {
  position: "fixed",
  top: "1rem",
  left: "1rem",
  zIndex: 1001,
  background: "#d4af37",
  color: "#0b0b0f",
  border: "none",
  borderRadius: "8px",
  padding: "0.6rem 0.9rem",
  cursor: "pointer",
  fontWeight: "bold",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  zIndex: 998,
};

const navStyle = {
  display: "grid",
  gap: "1rem",
};

const navLink = {
  color: "#cfcfcf",
  textDecoration: "none",
};
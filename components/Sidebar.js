export default function Sidebar({ activePage = "" }) {
  const links = [
    { label: "Dashboard", href: "/dashboard", key: "dashboard" },
    { label: "My Progress", href: "/my-progress", key: "my-progress" },
    { label: "Athletes", href: "/athletes", key: "athletes" },
    { label: "Classes", href: "/classes", key: "classes" },
    { label: "Enrollments", href: "/enrollments", key: "enrollments" },
    { label: "Attendance", href: "/attendance", key: "attendance" },
    { label: "Skill Pyramid", href: "/skills", key: "skills" },
  ];

  return (
    <aside style={sidebarStyle}>
      <h2 style={{ color: "#d4af37", marginBottom: "2rem" }}>Anubix</h2>

      <nav style={navStyle}>
        {links.map((link) => (
          <a
            key={link.key}
            href={link.href}
            style={{
              ...navLink,
              color: activePage === link.key ? "#d4af37" : "#cfcfcf",
            }}
          >
            {link.label}
          </a>
        ))}

        <span>Payments</span>
        <span>Settings</span>
      </nav>
    </aside>
  );
}

const sidebarStyle = {
  width: "240px",
  background: "#111118",
  borderRight: "1px solid #2a2a35",
  padding: "1.5rem",
};

const navStyle = {
  display: "grid",
  gap: "1rem",
  color: "#cfcfcf",
};

const navLink = {
  color: "#cfcfcf",
  textDecoration: "none",
};
import { getSession, useSession, signOut } from "next-auth/react";
import StatCard from "../components/StatCard";
import QuickActions from "../components/QuickActions";
import UpcomingClasses from "../components/UpcomingClasses";
import ClassManager from "../components/ClassManager";
import CalendarView from "../components/CalendarView";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  if (!session) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Access Denied</h1>
        <p>You must be signed in to view this page.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b0f",
        color: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        display: "flex",
      }}
    >
      <aside
        style={{
          width: "240px",
          background: "#111118",
          borderRight: "1px solid #2a2a35",
          padding: "1.5rem",
        }}
      >
        <h2 style={{ color: "#d4af37", marginBottom: "2rem" }}>Anubix</h2>

        <nav style={{ display: "grid", gap: "1rem", color: "#cfcfcf" }}>
          <span>Dashboard</span>
          <a href="/athletes" style={{ color: "#cfcfcf", textDecoration: "none" }}>
  Athletes
</a>
          <span>Classes</span>
          <span>Attendance</span>
          <span>Payments</span>
          <span>Skill Pyramid</span>
          <span>Settings</span>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "2rem" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Dashboard</h1>
            <p style={{ color: "#aaa", marginTop: "0.5rem" }}>
              Welcome back, {session.user.name}
            </p>
          </div>

          <button
            onClick={() => signOut()}
            style={{
              background: "#d4af37",
              border: "none",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <StatCard title="Active Students" value="142" />
          <StatCard title="Total Classes" value="23" />
          <StatCard title="Signups This Week" value="12" />
          <StatCard title="Revenue (MTD)" value="$3,450" />
        </section>

        <section style={{ display: "grid", gap: "2rem" }}>
          <QuickActions />
          <UpcomingClasses />
          <CalendarView />
          <ClassManager />
        </section>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
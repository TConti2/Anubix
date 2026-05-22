import { useEffect, useState } from "react";
import { getSession, useSession, signOut } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";

import StatCard from "../components/StatCard";
import QuickActions from "../components/QuickActions";
import UpcomingClasses from "../components/UpcomingClasses";
import ClassManager from "../components/ClassManager";
import CalendarView from "../components/CalendarView";

export default function Dashboard() {
  const { data: session, status } = useSession();

  const [userRole, setUserRole] = useState("");
  const [dashboardStats, setDashboardStats] = useState({
    activeStudents: 0,
    totalClasses: 0,
  });
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    if (!session?.user?.email) return;

    fetchUserRole();
    fetchDashboardStats();
    fetchActivityLog();
  }, [session]);

  async function fetchUserRole() {
    const { data, error } = await supabase
      .from("Users")
      .select("role")
      .eq("email", session.user.email)
      .single();

    if (error) {
      console.error("User role error:", error);
      return;
    }

    setUserRole(data?.role || "");
  }

  async function fetchDashboardStats() {
    const { count: athleteCount, error: athleteError } = await supabase
      .from("Athletes")
      .select("*", { count: "exact", head: true });

    const { count: classCount, error: classError } = await supabase
      .from("Classes")
      .select("*", { count: "exact", head: true });

    if (athleteError) console.error("Athlete count error:", athleteError);
    if (classError) console.error("Class count error:", classError);

    setDashboardStats({
      activeStudents: athleteCount || 0,
      totalClasses: classCount || 0,
    });
  }

  async function fetchActivityLog() {
    const { data, error } = await supabase
      .from("ActivityLog")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Activity log fetch error:", error);
      return;
    }

    setActivityLog(data || []);
  }

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

  const isAdmin = userRole === "admin";
  const isCoach = userRole === "coach";

  return (
    <div style={pageShell}>
      <aside style={sidebarStyle}>
        <h2 style={{ color: "#d4af37", marginBottom: "2rem" }}>Anubix</h2>

        <nav style={navStyle}>
          <a href="/dashboard" style={{ ...navLink, color: "#d4af37" }}>
            Dashboard
          </a>

          <a href="/my-progress" style={navLink}>
            My Progress
          </a>

          {(isAdmin || isCoach) && (
            <>
              <a href="/athletes" style={navLink}>Athletes</a>
              <a href="/classes" style={navLink}>Classes</a>
              <a href="/enrollments" style={navLink}>Enrollments</a>
              <a href="/attendance" style={navLink}>Attendance</a>
              <a href="/skills" style={navLink}>Skill Pyramid</a>
            </>
          )}

          {isAdmin && (
            <>
              <span>Payments</span>
              <span>Settings</span>
            </>
          )}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "2rem" }}>
        <header style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>Dashboard</h1>

            <p style={{ color: "#aaa", marginTop: "0.5rem" }}>
              Welcome back, {session.user.name}
            </p>

            <p style={{ color: "#d4af37", marginTop: "0.5rem" }}>
              Role: {userRole || "Not assigned"}
            </p>
          </div>

          <button onClick={() => signOut()} style={goldButton}>
            Sign out
          </button>
        </header>

        <section style={statsGridStyle}>
          <StatCard title="Active Students" value={dashboardStats.activeStudents} />
          <StatCard title="Total Classes" value={dashboardStats.totalClasses} />
          <StatCard title="Signups This Week" value="12" />
          <StatCard title="Revenue (MTD)" value="$3,450" />
        </section>

        <section style={activityPanelStyle}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>
            Recent Activity
          </h2>

          {activityLog.length === 0 ? (
            <p style={{ color: "#aaa" }}>No recent activity yet.</p>
          ) : (
            activityLog.map((item) => (
              <div key={item.id} style={activityItemStyle}>
                <strong>{item.action}</strong>

                <p style={{ margin: "0.35rem 0 0", color: "#aaa" }}>
                  {item.description}
                </p>
              </div>
            ))
          )}
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

const pageShell = {
  minHeight: "100vh",
  background: "#0b0b0f",
  color: "#f5f5f5",
  fontFamily: "Arial, sans-serif",
  display: "flex",
};

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

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2rem",
};

const goldButton = {
  background: "#d4af37",
  color: "#0b0b0f",
  border: "none",
  padding: "0.75rem 1rem",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "1rem",
  marginBottom: "2rem",
};

const activityPanelStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "1.5rem",
  marginBottom: "2rem",
};

const activityItemStyle = {
  borderBottom: "1px solid #2a2a35",
  padding: "0.75rem 0",
};

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
import { useEffect, useState } from "react";
import { getSession, useSession, signOut } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";
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
    totalEnrollments: 0,
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

    const { count: enrollmentCount, error: enrollmentError } = await supabase
      .from("Enrollments")
      .select("*", { count: "exact", head: true });

    if (athleteError) {
      console.error("Athlete count error:", athleteError);
    }

    if (classError) {
      console.error("Class count error:", classError);
    }

    if (enrollmentError) {
      console.error("Enrollment count error:", enrollmentError);
    }

    setDashboardStats({
      activeStudents: athleteCount || 0,
      totalClasses: classCount || 0,
      totalEnrollments: enrollmentCount || 0,
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
  const isStaff = isAdmin || isCoach;

  return (
    <div style={pageShell}>
      <Sidebar activePage="dashboard" />

      <main style={mainStyle}>
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

          <button
            onClick={() => signOut()}
            style={goldButton}
          >
            Sign out
          </button>
        </header>

        {!isStaff ? (
          <section style={activityPanelStyle}>
            <h2 style={{ color: "#d4af37", marginTop: 0 }}>
              My Athlete Portal
            </h2>

            <p style={{ color: "#aaa" }}>
              View your private progression dashboard and athlete development milestones.
            </p>

            <a
              href="/my-progress"
              style={portalButtonStyle}
            >
              Open My Progress
            </a>
          </section>
        ) : (
          <>
            <section style={statsGridStyle}>
              <StatCard
                title="Active Students"
                value={dashboardStats.activeStudents}
              />

              <StatCard
                title="Total Classes"
                value={dashboardStats.totalClasses}
              />

              <StatCard
                title="Total Enrollments"
                value={dashboardStats.totalEnrollments}
              />

              <StatCard
                title="Revenue (MTD)"
                value="$3,450"
              />
            </section>

            <section style={activityPanelStyle}>
              <h2 style={{ color: "#d4af37", marginTop: 0 }}>
                Recent Activity
              </h2>

              {activityLog.length === 0 ? (
                <p style={{ color: "#aaa" }}>
                  No recent activity yet.
                </p>
              ) : (
                activityLog.map((item) => (
                  <div
                    key={item.id}
                    style={activityItemStyle}
                  >
                    <strong>{item.action}</strong>

                    <p
                      style={{
                        margin: "0.35rem 0 0",
                        color: "#aaa",
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                ))
              )}
            </section>

            <section
              style={{
                display: "grid",
                gap: "2rem",
              }}
            >
              <QuickActions />
              <UpcomingClasses />
              <CalendarView />
              <ClassManager />
            </section>
          </>
        )}
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

const mainStyle = {
  flex: 1,
  padding: "2rem",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2rem",
};

const portalButtonStyle = {
  display: "inline-block",
  background: "#d4af37",
  color: "#0b0b0f",
  textDecoration: "none",
  padding: "0.75rem 1rem",
  borderRadius: "10px",
  fontWeight: "bold",
  marginTop: "1rem",
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
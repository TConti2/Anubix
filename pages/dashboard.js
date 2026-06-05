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
    monthlyRevenue: 0,
    outstandingBalance: 0,
    attendanceRate: 0,
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

    const { data: athleteFinanceData, error: financeError } = await supabase
      .from("Athletes")
      .select("monthly_tuition, balance");

    const { data: attendanceData, error: attendanceError } = await supabase
      .from("Attendance")
      .select("status");

    if (athleteError) console.error("Athlete count error:", athleteError);
    if (classError) console.error("Class count error:", classError);
    if (enrollmentError) console.error("Enrollment count error:", enrollmentError);
    if (financeError) console.error("Finance stats error:", financeError);
    if (attendanceError) console.error("Attendance stats error:", attendanceError);

    const monthlyRevenue = (athleteFinanceData || []).reduce(
      (sum, athlete) => sum + Number(athlete.monthly_tuition || 0),
      0
    );

    const outstandingBalance = (athleteFinanceData || []).reduce(
      (sum, athlete) => sum + Number(athlete.balance || 0),
      0
    );

    const totalAttendance = attendanceData?.length || 0;

    const presentAttendance =
      attendanceData?.filter((record) => record.status === "Present").length || 0;

    const attendanceRate =
      totalAttendance > 0
        ? Math.round((presentAttendance / totalAttendance) * 100)
        : 0;

    setDashboardStats({
      activeStudents: athleteCount || 0,
      totalClasses: classCount || 0,
      totalEnrollments: enrollmentCount || 0,
      monthlyRevenue,
      outstandingBalance,
      attendanceRate,
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
    return <p style={{ padding: "2rem" }}>Access Denied</p>;
  }

  const isStaff = userRole === "admin" || userRole === "coach";

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

          <button onClick={() => signOut()} style={goldButton}>
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

            <a href="/my-progress" style={portalButtonStyle}>
              Open My Progress
            </a>
          </section>
        ) : (
          <>
            <section style={statsGridStyle}>
              <StatCard title="Active Students" value={dashboardStats.activeStudents} />
              <StatCard title="Total Classes" value={dashboardStats.totalClasses} />
              <StatCard title="Total Enrollments" value={dashboardStats.totalEnrollments} />
              <StatCard title="Monthly Tuition" value={`$${dashboardStats.monthlyRevenue}`} />
              <StatCard title="Outstanding Balance" value={`$${dashboardStats.outstandingBalance}`} />
              <StatCard title="Attendance Rate" value={`${dashboardStats.attendanceRate}%`} />
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

            <section style={widgetGridStyle}>
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
  padding: "clamp(1rem, 4vw, 2rem)",
  minWidth: 0,
  overflowX: "hidden"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "2rem",
  gap: "1rem",
  flexWrap: "wrap"
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

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "1rem",
  marginBottom: "2rem",
  width: "100%",
};

const activityPanelStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "clamp(1rem, 4vw, 1.5rem)",
  marginBottom: "2rem",
  width: "100%",
  boxSizing: "border-box",
  overflowWrap: "break-word",
};

const activityItemStyle = {
  borderBottom: "1px solid #2a2a35",
  padding: "0.75rem 0",
};

const widgetGridStyle = {
  display: "grid",
  gap: "2rem",
  width: "100%",
  minWidth: 0,
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
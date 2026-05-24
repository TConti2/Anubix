import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";

export default function Activity() {
  const { data: session, status } = useSession();

  const [activityLog, setActivityLog] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("All");

  useEffect(() => {
    if (session?.user?.email) {
      fetchActivity();
    }
  }, [session]);

  async function fetchActivity() {
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("role")
      .eq("email", session.user.email)
      .single();

    if (userError) {
      console.error("Activity role error:", userError);
      return;
    }

    setUserRole(userData?.role || "");

    const { data, error } = await supabase
      .from("ActivityLog")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Activity fetch error:", error);
      return;
    }

    setActivityLog(data || []);
  }

  const actionTypes = [
    "All",
    ...new Set(activityLog.map((item) => item.action).filter(Boolean)),
  ];

  const filteredActivity = activityLog.filter((item) => {
    const matchesSearch =
      (item.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction =
      selectedAction === "All" || item.action === selectedAction;

    return matchesSearch && matchesAction;
  });

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  if (!session) {
    return <p style={{ padding: "2rem" }}>Access Denied</p>;
  }

  if (userRole && userRole !== "admin" && userRole !== "coach") {
    return (
      <div style={pageShell}>
        <Sidebar activePage="activity" />

        <main style={mainStyle}>
          <h1>Access Denied</h1>
          <p>This area is only available to coaches and admins.</p>
        </main>
      </div>
    );
  }

  return (
    <div style={pageShell}>
      <Sidebar activePage="activity" />

      <main style={mainStyle}>
        <h1 style={{ color: "#d4af37" }}>Activity Log</h1>

        <p style={{ color: "#aaa", marginBottom: "2rem" }}>
          Search and filter system actions across athletes, classes, enrollments,
          attendance, payments, and skill progress.
        </p>

        <section style={filterPanelStyle}>
          <input
            type="text"
            placeholder="Search activity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            style={inputStyle}
          >
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </section>

        <section style={panelStyle}>
          <p style={{ color: "#aaa", marginTop: 0 }}>
            Showing {filteredActivity.length} of {activityLog.length} records.
          </p>

          {filteredActivity.length === 0 ? (
            <p style={{ color: "#aaa" }}>No matching activity found.</p>
          ) : (
            filteredActivity.map((item) => (
              <div key={item.id} style={activityItemStyle}>
                <strong style={{ color: "#f5f5f5" }}>
                  {item.action}
                </strong>

                <p style={{ margin: "0.35rem 0", color: "#aaa" }}>
                  {item.description}
                </p>

                <small style={{ color: "#777" }}>
                  {new Date(item.created_at).toLocaleString()}
                </small>
              </div>
            ))
          )}
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

const mainStyle = {
  flex: 1,
  padding: "2rem",
};

const filterPanelStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "1rem",
  marginBottom: "1.5rem",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1rem",
};

const inputStyle = {
  padding: "0.9rem 1rem",
  borderRadius: "12px",
  border: "1px solid #2a2a35",
  background: "#0b0b0f",
  color: "#f5f5f5",
};

const panelStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "1.5rem",
};

const activityItemStyle = {
  borderBottom: "1px solid #2a2a35",
  padding: "0.9rem 0",
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
import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";

export default function Settings() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .order("id", { ascending: true });
      const { data: currentUserData, error: currentUserError } = await supabase
  .from("Users")
  .select("role")
  .eq("email", session.user.email)
  .single();

if (currentUserError) {
  console.error("Current user role error:", currentUserError);
  return;
}

setUserRole(currentUserData?.role || "");
if (userRole && userRole !== "admin") {
  return (
    <div style={pageShell}>
      <Sidebar activePage="settings" />

      <main style={mainStyle}>
        <h1>Access Denied</h1>
        <p>This area is only available to admins.</p>
      </main>
    </div>
  );
}
    if (error) {
      console.error("Users fetch error:", error);
      return;
    }

    setUsers(data || []);
  }

  async function handleRoleChange(userId, newRole) {
    const { error } = await supabase
      .from("Users")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      console.error("Role update error:", error);
      return;
    }

    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  }

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  return (
    <div style={pageShell}>
      <Sidebar activePage="settings" />

      <main style={mainStyle}>
        <h1 style={{ color: "#d4af37" }}>Settings</h1>

        <p style={{ color: "#aaa" }}>
          Organization settings, roles, permissions, branding, and account controls will live here.
        </p>

        <section style={panelStyle}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>
            Users & Roles
          </h2>

          {users.map((user) => (
            <div key={user.id} style={userRowStyle}>
              <div>
                <strong>{user.name || "Unnamed User"}</strong>

                <p style={{ margin: "0.35rem 0 0", color: "#aaa" }}>
                  {user.email}
                </p>
              </div>

              <select
                value={user.role}
                onChange={(e) =>
                  handleRoleChange(user.id, e.target.value)
                }
                style={selectStyle}
              >
                <option value="admin">admin</option>
                <option value="coach">coach</option>
                <option value="parent">parent</option>
                <option value="athlete">athlete</option>
              </select>
            </div>
          ))}
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

const panelStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "1.5rem",
  marginTop: "2rem",
};

const userRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #2a2a35",
  padding: "0.9rem 0",
  gap: "1rem",
};

const selectStyle = {
  background: "#1f1f2b",
  color: "#f5f5f5",
  border: "1px solid #2f2f3d",
  borderRadius: "10px",
  padding: "0.45rem 0.75rem",
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
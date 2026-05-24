import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";

export default function Payments() {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState("");
  const [athletes, setAthletes] = useState([]);

  useEffect(() => {
    fetchAthletes();
  }, []);

  const { data: userData, error: userError } = await supabase
  .from("Users")
  .select("role")
  .eq("email", session.user.email)
  .single();

if (userError) {
  console.error("Payment role error:", userError);
  return;
}

setUserRole(userData?.role || "");

  async function fetchAthletes() {
    const { data, error } = await supabase
      .from("Athletes")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Payment athlete fetch error:", error);
      return;
    }

    setAthletes(data || []);
  }

  const monthlyRevenue = athletes.reduce(
    (sum, athlete) => sum + Number(athlete.monthly_tuition || 0),
    0
  );

  const outstandingBalance = athletes.reduce(
    (sum, athlete) => sum + Number(athlete.balance || 0),
    0
  );

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  if (userRole && userRole !== "admin") {
  return (
    <div style={pageShell}>
      <Sidebar activePage="payments" />

      <main style={mainStyle}>
        <h1>Access Denied</h1>
        <p>This area is only available to admins.</p>
      </main>
    </div>
  );
}

  return (
    <div style={pageShell}>
      <Sidebar activePage="payments" />

      <main style={mainStyle}>
        <h1 style={{ color: "#d4af37" }}>Payments</h1>

        <section style={statsGridStyle}>
          <div style={statCardStyle}>
            <h3>Monthly Tuition</h3>
            <p style={statValueStyle}>${monthlyRevenue}</p>
          </div>

          <div style={statCardStyle}>
            <h3>Outstanding Balance</h3>
            <p style={statValueStyle}>${outstandingBalance}</p>
          </div>
        </section>

        <section style={panelStyle}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>
            Athlete Balances
          </h2>

          {athletes.map((athlete) => (
            <div key={athlete.id} style={rowStyle}>
              <div>
                <strong>{athlete.name}</strong>
                <p style={{ color: "#aaa", margin: "0.35rem 0 0" }}>
                  Tuition: ${athlete.monthly_tuition || 0}
                </p>
              </div>

              <strong style={{ color: "#d4af37" }}>
                Balance: ${athlete.balance || 0}
              </strong>
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

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1rem",
  marginBottom: "2rem",
};

const statCardStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "1.5rem",
};

const statValueStyle = {
  color: "#d4af37",
  fontSize: "2rem",
  fontWeight: "bold",
  margin: 0,
};

const panelStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "1.5rem",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #2a2a35",
  padding: "0.9rem 0",
  gap: "1rem",
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
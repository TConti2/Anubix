import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import { logActivity } from "../lib/activityLogger";
import Sidebar from "../components/Sidebar";

export default function Payments() {
  const { data: session, status } = useSession();

  const [userRole, setUserRole] = useState("");
  const [athletes, setAthletes] = useState([]);
  const [editedBalances, setEditedBalances] = useState({});
  const [editedTuitions, setEditedTuitions] = useState({});

  useEffect(() => {
    if (session?.user?.email) {
      fetchAthletes();
    }
  }, [session]);

  async function fetchAthletes() {
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

  async function handleBalanceUpdate(id, newBalance) {
    const athlete = athletes.find(
      (athlete) => Number(athlete.id) === Number(id)
    );
    async function handleTuitionUpdate(id, newTuition) {
  const athlete = athletes.find(
    (athlete) => Number(athlete.id) === Number(id)
  );

  const { error } = await supabase
    .from("Athletes")
    .update({
      monthly_tuition: Number(newTuition),
    })
    .eq("id", id);

  if (error) {
    console.error("Tuition update error:", error);
    return;
  }

  setAthletes(
    athletes.map((athlete) =>
      athlete.id === id
        ? { ...athlete, monthly_tuition: Number(newTuition) }
        : athlete
    )
  );

  await logActivity(
    "Tuition Updated",
    `${athlete?.name || "An athlete"} tuition updated to $${newTuition}`
  );
}

    const { error } = await supabase
      .from("Athletes")
      .update({
        balance: Number(newBalance),
      })
      .eq("id", id);

    if (error) {
      console.error("Balance update error:", error);
      return;
    }

    setAthletes(
      athletes.map((athlete) =>
        athlete.id === id
          ? { ...athlete, balance: Number(newBalance) }
          : athlete
      )
    );

    await logActivity(
      "Balance Updated",
      `${athlete?.name || "An athlete"} balance updated to $${newBalance}`
    );
  }

  async function handleTuitionUpdate(id, newTuition) {
  const athlete = athletes.find(
    (athlete) => Number(athlete.id) === Number(id)
  );

  const { error } = await supabase
    .from("Athletes")
    .update({
      monthly_tuition: Number(newTuition),
    })
    .eq("id", id);

  if (error) {
    console.error("Tuition update error:", error);
    return;
  }

  setAthletes(
    athletes.map((athlete) =>
      athlete.id === id
        ? {
            ...athlete,
            monthly_tuition: Number(newTuition),
          }
        : athlete
    )
  );

  await logActivity(
    "Tuition Updated",
    `${athlete?.name || "An athlete"} tuition updated to $${newTuition}`
  );
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

  if (!session) {
    return <p style={{ padding: "2rem" }}>Access Denied</p>;
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

          {athletes.length === 0 ? (
            <p style={{ color: "#aaa" }}>No athletes found.</p>
          ) : (
            athletes.map((athlete) => (
              <div key={athlete.id} style={rowStyle}>
                <div>
                  <strong>{athlete.name}</strong>

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.35rem" }}>
  <span style={{ color: "#aaa" }}>Tuition:</span>

  <input
    type="number"
    value={editedTuitions[athlete.id] ?? athlete.monthly_tuition ?? 0}
    onChange={(e) =>
      setEditedTuitions({
        ...editedTuitions,
        [athlete.id]: e.target.value,
      })
    }
    style={balanceInputStyle}
  />

  <button
    onClick={() =>
      handleTuitionUpdate(
        athlete.id,
        editedTuitions[athlete.id] ?? athlete.monthly_tuition ?? 0
      )
    }
    style={smallButtonStyle}
  >
    Save
  </button>
</div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
  <input
    type="number"
    value={editedBalances[athlete.id] ?? athlete.balance ?? 0}
    onChange={(e) =>
      setEditedBalances({
        ...editedBalances,
        [athlete.id]: e.target.value,
      })
    }
    style={balanceInputStyle}
  />

  <button
    onClick={() =>
      handleBalanceUpdate(
        athlete.id,
        editedBalances[athlete.id] ?? athlete.balance ?? 0
      )
    }
    style={smallButtonStyle}
  >
    Save
  </button>
</div>
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

const balanceInputStyle = {
  background: "#1f1f2b",
  color: "#d4af37",
  border: "1px solid #2f2f3d",
  borderRadius: "10px",
  padding: "0.5rem 0.75rem",
  width: "120px",
  fontWeight: "bold",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #2a2a35",
  padding: "0.9rem 0",
  gap: "1rem",
};

const smallButtonStyle = {
  background: "#d4af37",
  color: "#0b0b0f",
  border: "none",
  borderRadius: "8px",
  padding: "0.45rem 0.7rem",
  fontWeight: "bold",
  cursor: "pointer",
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
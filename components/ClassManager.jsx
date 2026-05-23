import { useRouter } from "next/router";

export default function ClassManager() {
  const router = useRouter();

  return (
    <div style={panelStyle}>
      <h2 style={{ color: "#d4af37", marginTop: 0 }}>
        Class Management
      </h2>

      <p style={{ color: "#aaa" }}>
        Manage classes, schedules, capacity, rosters, and enrollment from the main class system.
      </p>

      <button onClick={() => router.push("/classes")} style={buttonStyle}>
        Open Class Manager
      </button>
    </div>
  );
}

const panelStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "1.5rem",
};

const buttonStyle = {
  background: "#d4af37",
  color: "#0b0b0f",
  border: "none",
  padding: "0.75rem 1rem",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};
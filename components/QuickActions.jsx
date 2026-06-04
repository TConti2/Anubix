import { useRouter } from "next/router";

export default function QuickActions() {
  const router = useRouter();

  const buttonStyle = {
  background: "#1f1f2b",
  color: "#f5f5f5",
  border: "1px solid #2f2f3d",
  borderRadius: "12px",
  padding: "1rem",
  cursor: "pointer",
  fontWeight: "600",
  transition: "0.2s ease",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
};

  return (
    <div>
      <h2
        style={{
          marginBottom: "1rem",
          color: "#d4af37",
        }}
      >
        Quick Actions
      </h2>

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    width: "100%",
  }}
>
        <button
          style={buttonStyle}
          onClick={() => router.push("/athletes")}
        >
          Add Athlete
        </button>

        <button
          style={buttonStyle}
          onClick={() => router.push("/classes")}
        >
          Create Class
        </button>

        <button
          style={buttonStyle}
          onClick={() => router.push("/enrollments")}
        >
          Enroll Athlete
        </button>

        <button
          style={buttonStyle}
          onClick={() => router.push("/attendance")}
        >
          Mark Attendance
        </button>

        <button
          style={buttonStyle}
          onClick={() => router.push("/skills")}
        >
          Skill Pyramid
        </button>
      </div>
    </div>
  );
}
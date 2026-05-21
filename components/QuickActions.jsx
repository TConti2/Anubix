export default function QuickActions() {
  const buttonStyle = {
    background: "#1f1f2b",
    color: "#f5f5f5",
    border: "1px solid #2f2f3d",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.2s ease",
    minWidth: "180px",
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
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button style={buttonStyle}>
          Add New Student
        </button>

        <button style={buttonStyle}>
          Create New Class
        </button>

        <button style={buttonStyle}>
          Send Announcement
        </button>
      </div>
    </div>
  );
}
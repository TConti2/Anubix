export default function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "#15151d",
        border: "1px solid #2a2a35",
        borderRadius: "16px",
        padding: "1.5rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        textAlign: "center",
        transition: "0.2s ease",
      }}
    >
      <h3
        style={{
          color: "#9ca3af",
          fontSize: "0.9rem",
          marginBottom: "0.75rem",
          fontWeight: "500",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#d4af37",
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}
export default function UpcomingClasses() {
  const classes = [
    {
      time: "4:00 PM",
      name: "Beginner Tumbling",
      coach: "Coach Sarah",
    },
    {
      time: "5:30 PM",
      name: "Intermediate Tumbling",
      coach: "Coach James",
    },
    {
      time: "7:00 PM",
      name: "Advanced Tumbling",
      coach: "Coach Bossman",
    },
  ];

  return (
    <div>
      <h2
        style={{
          color: "#d4af37",
          marginBottom: "1rem",
        }}
      >
        Upcoming Classes
      </h2>

      <div
        style={{
          display: "grid",
          gap: "1rem",
        }}
      >
        {classes.map((cls, index) => (
          <div
            key={index}
            style={{
              background: "#15151d",
              border: "1px solid #2a2a35",
              borderRadius: "14px",
              padding: "1rem 1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  color: "#f5f5f5",
                }}
              >
                {cls.name}
              </h3>

              <p
                style={{
                  margin: "0.4rem 0 0",
                  color: "#9ca3af",
                }}
              >
                {cls.coach}
              </p>
            </div>

            <div
              style={{
                color: "#d4af37",
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              {cls.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useState } from "react";
import { getSession, useSession, signOut } from "next-auth/react";

export default function Athletes() {
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");

  const [athletes, setAthletes] = useState([
    { name: "Ava Martinez", age: 9, level: "Beginner", parent: "Maria Martinez", status: "Active" },
    { name: "Jaxon Reed", age: 11, level: "Intermediate", parent: "Chris Reed", status: "Active" },
    { name: "Mia Johnson", age: 13, level: "Advanced", parent: "Tara Johnson", status: "Active" },
  ]);

  const [newAthlete, setNewAthlete] = useState({
    name: "",
    age: "",
    level: "",
    parent: "",
  });

  const [editingIndex, setEditingIndex] = useState(null);

  const [editedAthlete, setEditedAthlete] = useState({
    name: "",
    age: "",
    level: "",
    parent: "",
  });

  const filteredAthletes = athletes.filter((athlete) =>
    athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    athlete.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    athlete.parent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleAddAthlete(e) {
    e.preventDefault();

    if (!newAthlete.name || !newAthlete.age || !newAthlete.level || !newAthlete.parent) {
      return;
    }

    setAthletes([
      ...athletes,
      {
        ...newAthlete,
        status: "Active",
      },
    ]);

    setNewAthlete({
      name: "",
      age: "",
      level: "",
      parent: "",
    });
  }

  function handleDeleteAthlete(indexToDelete) {
    const updatedAthletes = athletes.filter((athlete, index) => index !== indexToDelete);
    setAthletes(updatedAthletes);
  }

  function handleStartEdit(index) {
    setEditingIndex(index);

    setEditedAthlete({
      name: athletes[index].name,
      age: athletes[index].age,
      level: athletes[index].level,
      parent: athletes[index].parent,
    });
  }

  function handleSaveEdit(index) {
    const updatedAthletes = athletes.map((athlete, athleteIndex) => {
      if (athleteIndex === index) {
        return {
          ...athlete,
          ...editedAthlete,
        };
      }

      return athlete;
    });

    setAthletes(updatedAthletes);
    setEditingIndex(null);

    setEditedAthlete({
      name: "",
      age: "",
      level: "",
      parent: "",
    });
  }

  function handleCancelEdit() {
    setEditingIndex(null);

    setEditedAthlete({
      name: "",
      age: "",
      level: "",
      parent: "",
    });
  }

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  if (!session) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Access Denied</h1>
        <p>You must be signed in to view this page.</p>
      </div>
    );
  }

  return (
    <div style={pageShell}>
      <aside style={sidebarStyle}>
        <h2 style={{ color: "#d4af37", marginBottom: "2rem" }}>Anubix</h2>

        <nav style={{ display: "grid", gap: "1rem", color: "#cfcfcf" }}>
          <a href="/dashboard" style={navLink}>Dashboard</a>
          <a href="/athletes" style={{ ...navLink, color: "#d4af37" }}>Athletes</a>
          <span>Classes</span>
          <span>Attendance</span>
          <span>Payments</span>
          <span>Skill Pyramid</span>
          <span>Settings</span>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "2rem" }}>
        <header style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>Athletes</h1>
            <p style={{ color: "#aaa", marginTop: "0.5rem" }}>
              Manage athlete profiles, levels, parent contacts, and activity status.
            </p>
          </div>

          <button onClick={() => signOut()} style={goldButton}>
            Sign out
          </button>
        </header>

        <form onSubmit={handleAddAthlete} style={formStyle}>
          <input
            type="text"
            placeholder="Athlete name"
            value={newAthlete.name}
            onChange={(e) => setNewAthlete({ ...newAthlete, name: e.target.value })}
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Age"
            value={newAthlete.age}
            onChange={(e) => setNewAthlete({ ...newAthlete, age: e.target.value })}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Level"
            value={newAthlete.level}
            onChange={(e) => setNewAthlete({ ...newAthlete, level: e.target.value })}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Parent name"
            value={newAthlete.parent}
            onChange={(e) => setNewAthlete({ ...newAthlete, parent: e.target.value })}
            style={inputStyle}
          />

          <button type="submit" style={goldButton}>
            Add Athlete
          </button>
        </form>

        <input
          type="text"
          placeholder="Search athletes, levels, or parents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            ...inputStyle,
            width: "100%",
            maxWidth: "420px",
            marginBottom: "1.5rem",
            background: "#15151d",
          }}
        />

        <section style={gridStyle}>
          {filteredAthletes.map((athlete, index) => (
            <div key={index} style={cardStyle}>
              {editingIndex === index ? (
                <>
                  <input
                    value={editedAthlete.name}
                    onChange={(e) => setEditedAthlete({ ...editedAthlete, name: e.target.value })}
                    style={inputStyle}
                  />

                  <input
                    type="number"
                    value={editedAthlete.age}
                    onChange={(e) => setEditedAthlete({ ...editedAthlete, age: e.target.value })}
                    style={{ ...inputStyle, marginTop: "0.75rem" }}
                  />

                  <input
                    value={editedAthlete.level}
                    onChange={(e) => setEditedAthlete({ ...editedAthlete, level: e.target.value })}
                    style={{ ...inputStyle, marginTop: "0.75rem" }}
                  />

                  <input
                    value={editedAthlete.parent}
                    onChange={(e) => setEditedAthlete({ ...editedAthlete, parent: e.target.value })}
                    style={{ ...inputStyle, marginTop: "0.75rem" }}
                  />

                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                    <button onClick={() => handleSaveEdit(index)} style={goldButton}>
                      Save
                    </button>

                    <button onClick={handleCancelEdit} style={darkButton}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ marginTop: 0, color: "#d4af37" }}>{athlete.name}</h2>
                  <p><strong>Age:</strong> {athlete.age}</p>
                  <p><strong>Level:</strong> {athlete.level}</p>
                  <p><strong>Parent:</strong> {athlete.parent}</p>

                  <div style={cardFooterStyle}>
                    <span style={activeBadgeStyle}>{athlete.status}</span>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => handleStartEdit(index)} style={darkButton}>
                        Edit
                      </button>

                      <button onClick={() => handleDeleteAthlete(index)} style={dangerButton}>
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
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

const sidebarStyle = {
  width: "240px",
  background: "#111118",
  borderRight: "1px solid #2a2a35",
  padding: "1.5rem",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2rem",
};

const formStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "1.5rem",
  marginBottom: "1.5rem",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "1rem",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "1rem",
};

const cardStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "1.5rem",
};

const cardFooterStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "1rem",
  gap: "1rem",
};

const activeBadgeStyle = {
  display: "inline-block",
  padding: "0.35rem 0.7rem",
  borderRadius: "999px",
  background: "#1f2a1f",
  color: "#7ee787",
  fontSize: "0.85rem",
  fontWeight: "bold",
};

const navLink = {
  color: "#cfcfcf",
  textDecoration: "none",
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

const darkButton = {
  background: "#1f1f2b",
  color: "#f5f5f5",
  border: "1px solid #2f2f3d",
  borderRadius: "10px",
  padding: "0.6rem 0.9rem",
  cursor: "pointer",
  fontWeight: "bold",
};

const dangerButton = {
  background: "#3b1111",
  color: "#ffb4b4",
  border: "1px solid #7f1d1d",
  borderRadius: "10px",
  padding: "0.6rem 0.9rem",
  cursor: "pointer",
  fontWeight: "bold",
};

const inputStyle = {
  padding: "0.9rem 1rem",
  borderRadius: "12px",
  border: "1px solid #2a2a35",
  background: "#0b0b0f",
  color: "#f5f5f5",
  outline: "none",
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
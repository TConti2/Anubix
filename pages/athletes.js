import { useEffect, useState } from "react";
import { getSession, useSession, signOut } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import { logActivity } from "../lib/activityLogger";
import Sidebar from "../components/Sidebar";

export default function Athletes() {
  const { data: session, status } = useSession();

  const [searchTerm, setSearchTerm] = useState("");
  const [athletes, setAthletes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [userRole, setUserRole] = useState("");

  const [newAthlete, setNewAthlete] = useState({
    name: "",
    age: "",
    level: "",
    parent: "",
    monthly_tuition: "",
    balance: "",
  });

  const [editingIndex, setEditingIndex] = useState(null);

  const [editedAthlete, setEditedAthlete] = useState({
    name: "",
    age: "",
    level: "",
    parent: "",
    monthly_tuition: "",
    balance: "",
  });

  useEffect(() => {
    if (session?.user?.email) {
      fetchAthletes();
    }
  }, [session]);

  async function fetchAthletes() {
    const { data: athleteData, error: athleteError } = await supabase
      .from("Athletes")
      .select("*");

    const { data: classData, error: classError } = await supabase
      .from("Classes")
      .select("*");

    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from("Enrollments")
      .select("*");

    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("role")
      .eq("email", session.user.email)
      .single();

    if (athleteError) console.error("Error fetching athletes:", athleteError);
    if (classError) console.error("Error fetching classes:", classError);
    if (enrollmentError) console.error("Error fetching enrollments:", enrollmentError);
    if (userError) console.error("User role error:", userError);

    setAthletes(athleteData || []);
    setClasses(classData || []);
    setEnrollments(enrollmentData || []);
    setUserRole(userData?.role || "");
  }

  const filteredAthletes = athletes.filter((athlete) =>
    (athlete.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (athlete.level || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (athlete.parent || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleAddAthlete(e) {
    e.preventDefault();

    if (!newAthlete.name || !newAthlete.age || !newAthlete.level || !newAthlete.parent) {
      return;
    }

    const athleteToAdd = {
      name: newAthlete.name,
      age: Number(newAthlete.age),
      level: newAthlete.level,
      parent: newAthlete.parent,
      monthly_tuition: Number(newAthlete.monthly_tuition || 0),
      balance: Number(newAthlete.balance || 0),
      status: "Active",
    };

    const { data, error } = await supabase
      .from("Athletes")
      .insert([athleteToAdd])
      .select();

    if (error) {
      console.error("Error adding athlete:", error);
      return;
    }

    setAthletes([...athletes, data[0]]);

    await logActivity(
      "Athlete Added",
      `${newAthlete.name} was added to Anubix`
    );

    setNewAthlete({
      name: "",
      age: "",
      level: "",
      parent: "",
      monthly_tuition: "",
      balance: "",
    });
  }

  async function handleDeleteAthlete(idToDelete) {
    const athleteToDelete = athletes.find(
      (athlete) => Number(athlete.id) === Number(idToDelete)
    );

    const { error } = await supabase
      .from("Athletes")
      .delete()
      .eq("id", idToDelete);

    if (error) {
      console.error("Error deleting athlete:", error);
      return;
    }

    setAthletes(athletes.filter((athlete) => athlete.id !== idToDelete));

    await logActivity(
      "Athlete Deleted",
      `${athleteToDelete?.name || "An athlete"} was deleted`
    );
  }

  function handleStartEdit(index) {
    const athlete = filteredAthletes[index];

    setEditingIndex(index);

    setEditedAthlete({
      name: athlete.name || "",
      age: athlete.age || "",
      level: athlete.level || "",
      parent: athlete.parent || "",
      monthly_tuition: athlete.monthly_tuition || "",
      balance: athlete.balance || "",
    });
  }

  async function handleSaveEdit(id) {
    const { data, error } = await supabase
      .from("Athletes")
      .update({
        name: editedAthlete.name,
        age: Number(editedAthlete.age),
        level: editedAthlete.level,
        parent: editedAthlete.parent,
        monthly_tuition: Number(editedAthlete.monthly_tuition || 0),
        balance: Number(editedAthlete.balance || 0),
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating athlete:", error);
      return;
    }

    setAthletes(
      athletes.map((athlete) =>
        athlete.id === id ? data[0] : athlete
      )
    );

    await logActivity(
      "Athlete Updated",
      `${editedAthlete.name} profile was updated`
    );

    setEditingIndex(null);

    setEditedAthlete({
      name: "",
      age: "",
      level: "",
      parent: "",
      monthly_tuition: "",
      balance: "",
    });
  }

  function handleCancelEdit() {
    setEditingIndex(null);

    setEditedAthlete({
      name: "",
      age: "",
      level: "",
      parent: "",
      monthly_tuition: "",
      balance: "",
    });
  }

  function getAthleteEnrollments(athleteId) {
    return enrollments.filter(
      (enrollment) => Number(enrollment.athlete_id) === Number(athleteId)
    );
  }

  function getClassName(classId) {
    const cls = classes.find(
      (cls) => Number(cls.id) === Number(classId)
    );

    return cls ? cls.name : "Unknown Class";
  }

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  if (!session) {
    return <p style={{ padding: "2rem" }}>Access Denied</p>;
  }

  if (userRole && userRole !== "admin" && userRole !== "coach") {
    return (
      <div style={pageShell}>
        <Sidebar activePage="athletes" />

        <main style={mainStyle}>
          <h1>Access Denied</h1>
          <p>This area is only available to coaches and admins.</p>
        </main>
      </div>
    );
  }

  return (
    <div style={pageShell}>
      <Sidebar activePage="athletes" />

      <main style={mainStyle}>
        <header style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>Athletes</h1>
            <p style={{ color: "#aaa", marginTop: "0.5rem" }}>
              Manage athlete profiles, levels, parent contacts, tuition, balances, and activity status.
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

          <input
            type="number"
            placeholder="Monthly Tuition"
            value={newAthlete.monthly_tuition}
            onChange={(e) => setNewAthlete({ ...newAthlete, monthly_tuition: e.target.value })}
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Balance"
            value={newAthlete.balance}
            onChange={(e) => setNewAthlete({ ...newAthlete, balance: e.target.value })}
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
            <div key={athlete.id} style={cardStyle}>
              {editingIndex === index ? (
                <>
                  <input
                    value={editedAthlete.name}
                    onChange={(e) =>
                      setEditedAthlete({ ...editedAthlete, name: e.target.value })
                    }
                    style={inputStyle}
                  />

                  <input
                    type="number"
                    value={editedAthlete.age}
                    onChange={(e) =>
                      setEditedAthlete({ ...editedAthlete, age: e.target.value })
                    }
                    style={{ ...inputStyle, marginTop: "0.75rem" }}
                  />

                  <input
                    value={editedAthlete.level}
                    onChange={(e) =>
                      setEditedAthlete({ ...editedAthlete, level: e.target.value })
                    }
                    style={{ ...inputStyle, marginTop: "0.75rem" }}
                  />

                  <input
                    value={editedAthlete.parent}
                    onChange={(e) =>
                      setEditedAthlete({ ...editedAthlete, parent: e.target.value })
                    }
                    style={{ ...inputStyle, marginTop: "0.75rem" }}
                  />

                  <input
                    type="number"
                    value={editedAthlete.monthly_tuition}
                    onChange={(e) =>
                      setEditedAthlete({
                        ...editedAthlete,
                        monthly_tuition: e.target.value,
                      })
                    }
                    style={{ ...inputStyle, marginTop: "0.75rem" }}
                  />

                  <input
                    type="number"
                    value={editedAthlete.balance}
                    onChange={(e) =>
                      setEditedAthlete({
                        ...editedAthlete,
                        balance: e.target.value,
                      })
                    }
                    style={{ ...inputStyle, marginTop: "0.75rem" }}
                  />

                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                    <button onClick={() => handleSaveEdit(athlete.id)} style={goldButton}>
                      Save
                    </button>

                    <button onClick={handleCancelEdit} style={darkButton}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ marginTop: 0, color: "#d4af37" }}>
                    {athlete.name}
                  </h2>

                  <p><strong>Age:</strong> {athlete.age}</p>
                  <p><strong>Level:</strong> {athlete.level}</p>
                  <p><strong>Parent:</strong> {athlete.parent}</p>
                  <p><strong>Monthly Tuition:</strong> ${athlete.monthly_tuition || 0}</p>
                  <p><strong>Balance:</strong> ${athlete.balance || 0}</p>

                  <div style={{ marginTop: "1rem" }}>
                    <strong>Enrolled Classes:</strong>

                    <p>
                      Count: {getAthleteEnrollments(athlete.id).length}
                    </p>

                    <ul style={{ paddingLeft: "1.2rem" }}>
                      {getAthleteEnrollments(athlete.id).map((enrollment) => (
                        <li key={enrollment.id}>
                          {getClassName(enrollment.class_id)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={cardFooterStyle}>
                    <span style={activeBadgeStyle}>{athlete.status}</span>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => handleStartEdit(index)} style={darkButton}>
                        Edit
                      </button>

                      <button onClick={() => handleDeleteAthlete(athlete.id)} style={dangerButton}>
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

const mainStyle = {
  flex: 1,
  padding: "2rem",
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
import { useEffect, useState } from "react";
import { getSession, useSession, signOut } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import { logActivity } from "../lib/ActivityLogger";
import Sidebar from "../components/Sidebar";

export default function Classes() {
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [newClass, setNewClass] = useState({
    name: "",
    coach: "",
    level: "",
    day: "",
    time: "",
    capacity: "",
  });
  const[editingClassId, setEditingClassId] = useState(null);

  const[editedClass, setEditedClass] = useState({
    name: "",
    coach: "",
    level: "",
    day: "",
    time: "",
    capacity: "",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    const { data, error } = await supabase
      .from("Classes")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching classes:", error);
      return;
    }
const { data: enrollmentData, error: enrollmentError } = await supabase
  .from("Enrollments")
  .select("*");

if (enrollmentError) {
  console.error("Enrollment fetch error:", enrollmentError);
}const { data: athleteData, error: athleteError } = await supabase
  .from("Athletes")
  .select("*");

if (athleteError) {
  console.error("Athlete fetch error:", athleteError);
}
    setClasses(data || []);
    setEnrollments(enrollmentData || []);
    setAthletes(athleteData || []);
    
if (athleteError) {
  console.error("Athlete fetch error:", athleteError);
}
  }

  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.coach.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleAddClass(e) {
    e.preventDefault();

    if (!newClass.name || !newClass.coach || !newClass.level || !newClass.day || !newClass.time || !newClass.capacity) {
      return;
    }

    const classToAdd = {
      name: newClass.name,
      coach: newClass.coach,
      level: newClass.level,
      day: newClass.day,
      time: newClass.time,
      capacity: Number(newClass.capacity),
      status: "Active",
    };

    const { data, error } = await supabase
      .from("Classes")
      .insert([classToAdd])
      .select();

    if (error) {
      console.error("Error adding class:", error);
      return;
    }

    setClasses([...classes, data[0]]);
    await logActivity(
  "Class Created",
  `${newClass.name} was created`
);

    setNewClass({
      name: "",
      coach: "",
      level: "",
      day: "",
      time: "",
      capacity: "",
    });
  }

async function handleDeleteClass(idToDelete) {
  const classToDelete = classes.find(
    (cls) => Number(cls.id) === Number(idToDelete)
  );

  const { error } = await supabase
    .from("Classes")
    .delete()
    .eq("id", idToDelete);

  if (error) {
    console.error("Error deleting class:", error);
    return;
  }

  setClasses(classes.filter((cls) => cls.id !== idToDelete));

  await logActivity(
    "Class Deleted",
    `${classToDelete?.name || "A class"} was deleted`
  );
}

function handleStartEditClass(cls) {
  setEditingClassId(cls.id);

  setEditedClass({
    name: cls.name,
    coach: cls.coach,
    level: cls.level,
    day: cls.day,
    time: cls.time,
    capacity: cls.capacity,
  });
}

function handleCancelEditClass() {
  setEditingClassId(null);

  setEditedClass({
    name: "",
    coach: "",
    level: "",
    day: "",
    time: "",
    capacity: "",
  });
}

async function handleSaveEditClass(id) {
  const { data, error } = await supabase
    .from("Classes")
    .update({
      name: editedClass.name,
      coach: editedClass.coach,
      level: editedClass.level,
      day: editedClass.day,
      time: editedClass.time,
      capacity: Number(editedClass.capacity),
    })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating class:", error);
    return;
  }

  setClasses(
    classes.map((cls) =>
      cls.id === id ? data[0] : cls
    )
  );

  await logActivity(
    "Class Updated",
    `${editedClass.name} was updated`
  );

  handleCancelEditClass();
}
  function getClassEnrollments(classId) {
  return enrollments.filter(
    (enrollment) => enrollment.class_id === classId
  );
}
function getAthleteName(athleteId) {
  const athlete = athletes.find(
    (athlete) => Number(athlete.id) === Number(athleteId)
  );

  return athlete ? athlete.name : "Unknown Athlete";
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
      <Sidebar activePage="classes" />

      <main style={{ flex: 1, padding: "2rem" }}>
        <header style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>Classes</h1>
            <p style={{ color: "#aaa", marginTop: "0.5rem" }}>
              Manage class schedules, coaches, levels, and capacity.
            </p>
          </div>

          <button onClick={() => signOut()} style={goldButton}>
            Sign out
          </button>
        </header>

        <form onSubmit={handleAddClass} style={formStyle}>
          <input
            type="text"
            placeholder="Class name"
            value={newClass.name}
            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Coach"
            value={newClass.coach}
            onChange={(e) => setNewClass({ ...newClass, coach: e.target.value })}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Level"
            value={newClass.level}
            onChange={(e) => setNewClass({ ...newClass, level: e.target.value })}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Day"
            value={newClass.day}
            onChange={(e) => setNewClass({ ...newClass, day: e.target.value })}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Time"
            value={newClass.time}
            onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Capacity"
            value={newClass.capacity}
            onChange={(e) => setNewClass({ ...newClass, capacity: e.target.value })}
            style={inputStyle}
          />

          <button type="submit" style={goldButton}>
            Add Class
          </button>
        </form>

        <input
          type="text"
          placeholder="Search classes, coaches, or levels..."
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
          {filteredClasses.map((cls) => (
            <div key={cls.id} style={cardStyle}>{editingClassId === cls.id ? (
  <>
    <input
      value={editedClass.name}
      onChange={(e) =>
        setEditedClass({ ...editedClass, name: e.target.value })
      }
      style={inputStyle}
    />

    <input
      value={editedClass.coach}
      onChange={(e) =>
        setEditedClass({ ...editedClass, coach: e.target.value })
      }
      style={{ ...inputStyle, marginTop: "0.75rem" }}
    />

    <input
      value={editedClass.level}
      onChange={(e) =>
        setEditedClass({ ...editedClass, level: e.target.value })
      }
      style={{ ...inputStyle, marginTop: "0.75rem" }}
    />

    <input
      value={editedClass.day}
      onChange={(e) =>
        setEditedClass({ ...editedClass, day: e.target.value })
      }
      style={{ ...inputStyle, marginTop: "0.75rem" }}
    />

    <input
      value={editedClass.time}
      onChange={(e) =>
        setEditedClass({ ...editedClass, time: e.target.value })
      }
      style={{ ...inputStyle, marginTop: "0.75rem" }}
    />

    <input
      type="number"
      value={editedClass.capacity}
      onChange={(e) =>
        setEditedClass({ ...editedClass, capacity: e.target.value })
      }
      style={{ ...inputStyle, marginTop: "0.75rem" }}
    />

    <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
      <button
        onClick={() => handleSaveEditClass(cls.id)}
        style={goldButton}
      >
        Save
      </button>

      <button
        onClick={handleCancelEditClass}
        style={darkButton}
      >
        Cancel
      </button>
    </div>
  </>
) : (
  <>
    <h2 style={{ marginTop: 0, color: "#d4af37" }}>{cls.name}</h2>

    <p><strong>Coach:</strong> {cls.coach}</p>
    <p><strong>Level:</strong> {cls.level}</p>
    <p><strong>Day:</strong> {cls.day}</p>
    <p><strong>Time:</strong> {cls.time}</p>
    <p><strong>Capacity:</strong> {cls.capacity}</p>

    <div style={{ marginTop: "1rem" }}>
      <strong>Enrolled Athletes:</strong>

      <p>
        Count: {getClassEnrollments(cls.id).length}
      </p>

      <ul style={{ paddingLeft: "1.2rem" }}>
        {getClassEnrollments(cls.id).map((enrollment) => (
          <li key={enrollment.id}>
            {getAthleteName(enrollment.athlete_id)}
          </li>
        ))}
      </ul>
    </div>

    <div style={cardFooterStyle}>
      <span style={activeBadgeStyle}>
        {cls.status}
      </span>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={() => handleStartEditClass(cls)}
          style={darkButton}
        >
          Edit
        </button>

        <button
          onClick={() => handleDeleteClass(cls.id)}
          style={dangerButton}
        >
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

const dangerButton = {
  background: "#3b1111",
  color: "#ffb4b4",
  border: "1px solid #7f1d1d",
  borderRadius: "10px",
  padding: "0.6rem 0.9rem",
  cursor: "pointer",
  fontWeight: "bold",
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
import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import { logActivity } from "../lib/ActivityLogger";
import Sidebar from "../components/Sidebar";

export default function Enrollments() {
  const { data: session, status } = useSession();
  const [athletes, setAthletes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: athleteData, error: athleteError } = await supabase
      .from("Athletes")
      .select("*");

    const { data: classData, error: classError } = await supabase
      .from("Classes")
      .select("*");

    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from("Enrollments")
      .select("*");

    if (athleteError) console.error("Athlete fetch error:", athleteError);
    if (classError) console.error("Class fetch error:", classError);
    if (enrollmentError) console.error("Enrollment fetch error:", enrollmentError);

    setAthletes(athleteData || []);
    setClasses(classData || []);
    setEnrollments(enrollmentData || []);
  }

async function handleEnrollment(e) {
  e.preventDefault();

  if (!selectedAthlete || !selectedClass) return;

  const existingEnrollment = enrollments.find(
    (enrollment) =>
      Number(enrollment.athlete_id) === Number(selectedAthlete) &&
      Number(enrollment.class_id) === Number(selectedClass)
  );

  if (existingEnrollment) {
    alert("This athlete is already enrolled in that class.");
    return;
  }

  const selectedClassData = classes.find(
    (cls) => Number(cls.id) === Number(selectedClass)
  );

  const currentEnrollmentCount = enrollments.filter(
    (enrollment) => Number(enrollment.class_id) === Number(selectedClass)
  ).length;

  if (selectedClassData && currentEnrollmentCount >= Number(selectedClassData.capacity)) {
    alert("This class is full.");
    return;
  }

  const enrollment = {
    athlete_id: Number(selectedAthlete),
    class_id: Number(selectedClass),
    status: "Active",
  };

  const { data, error } = await supabase
    .from("Enrollments")
    .insert([enrollment])
    .select();

  if (error) {
    console.error("Error adding enrollment:", error);
    return;
  }

  setEnrollments([...enrollments, data[0]]);

  await logActivity(
    "Enrollment Created",
    `${getAthleteName(Number(selectedAthlete))} enrolled in ${getClassName(Number(selectedClass))}`
  );

  setSelectedAthlete("");
  setSelectedClass("");
}

 async function handleDeleteEnrollment(idToDelete) {
  const enrollmentToDelete = enrollments.find(
    (enrollment) => Number(enrollment.id) === Number(idToDelete)
  );

  const athleteName = enrollmentToDelete
    ? getAthleteName(enrollmentToDelete.athlete_id)
    : "An athlete";

  const className = enrollmentToDelete
    ? getClassName(enrollmentToDelete.class_id)
    : "a class";

  const { error } = await supabase
    .from("Enrollments")
    .delete()
    .eq("id", idToDelete);

  if (error) {
    console.error("Error deleting enrollment:", error);
    function getClassEnrollmentCount(classId) {
  return enrollments.filter(
    (enrollment) => Number(enrollment.class_id) === Number(classId)
  ).length;
}
    return;
  }

  setEnrollments(
    enrollments.filter((enrollment) => enrollment.id !== idToDelete)
  );

  await logActivity(
    "Enrollment Removed",
    `${athleteName} was removed from ${className}`
  );
}

  function getAthleteName(id) {
    const athlete = athletes.find((a) => a.id === id);
    return athlete ? athlete.name : "Unknown Athlete";
  }

  function getClassName(id) {
    const cls = classes.find((c) => c.id === id);
    return cls ? cls.name : "Unknown Class";
  }

  if (status === "loading") {
    return <p style={pageStyle}>Loading...</p>;
  }

  if (!session) {
    return <p style={pageStyle}>Access Denied</p>;
  }

 return (
  <div style={pageShell}>
    <Sidebar activePage="enrollments" />

    <main style={mainStyle}>
      <h1 style={{ color: "#d4af37" }}>Enrollments</h1>

      <form onSubmit={handleEnrollment} style={formStyle}>
        <select
          value={selectedAthlete}
          onChange={(e) => setSelectedAthlete(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select Athlete</option>

          {athletes.map((athlete) => (
            <option key={athlete.id} value={athlete.id}>
              {athlete.name}
            </option>
          ))}
        </select>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select Class</option>

          {classes.map((cls) => {
  const count = getClassEnrollmentCount(cls.id);
  const isFull = count >= Number(cls.capacity);
  function getClassEnrollmentCount(classId) {
  return enrollments.filter(
    (enrollment) =>
      Number(enrollment.class_id) === Number(classId)
  ).length;
}

  return (
    <option key={cls.id} value={cls.id}>
      {cls.name} — {count}/{cls.capacity} {isFull ? "(Full)" : ""}
    </option>
  );
})}
        </select>

        <button type="submit" style={buttonStyle}>
          Enroll Athlete
        </button>
      </form>

      <div style={{ marginTop: "2rem" }}>
        {enrollments.map((enrollment) => (
          <div key={enrollment.id} style={cardStyle}>
            <h3 style={{ color: "#d4af37" }}>
              {getAthleteName(enrollment.athlete_id)}
            </h3>

            <p>
              Enrolled In:{" "}
              <strong>{getClassName(enrollment.class_id)}</strong>
            </p>

            <p>Status: {enrollment.status}</p>

            <button
              onClick={() => handleDeleteEnrollment(enrollment.id)}
              style={dangerButton}
            >
              Remove Enrollment
            </button>
          </div>
        ))}
      </div>
      </main>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#0b0b0f",
  color: "#f5f5f5",
  padding: "2rem",
  fontFamily: "Arial, sans-serif",
};

const formStyle = {
  display: "grid",
  gap: "1rem",
  maxWidth: "400px",
};

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

const inputStyle = {
  padding: "0.9rem 1rem",
  borderRadius: "12px",
  border: "1px solid #2a2a35",
  background: "#15151d",
  color: "#f5f5f5",
};

const buttonStyle = {
  background: "#d4af37",
  color: "#0b0b0f",
  border: "none",
  padding: "0.9rem 1rem",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const dangerButton = {
  marginTop: "1rem",
  background: "#3b1111",
  color: "#ffb4b4",
  border: "1px solid #7f1d1d",
  borderRadius: "10px",
  padding: "0.6rem 0.9rem",
  cursor: "pointer",
  fontWeight: "bold",
};

const cardStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "1rem",
  marginBottom: "1rem",
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
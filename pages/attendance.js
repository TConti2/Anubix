import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import { logActivity } from "../lib/activityLogger";
import Sidebar from "../components/Sidebar";

export default function Attendance() {
  const { data: session, status } = useSession();

  const [athletes, setAthletes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Present");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: athleteData } = await supabase
      .from("Athletes")
      .select("*");

    const { data: classData } = await supabase
      .from("Classes")
      .select("*");

    const { data: attendanceData } = await supabase
      .from("Attendance")
      .select("*");

    setAthletes(athleteData || []);
    setClasses(classData || []);
    setAttendance(attendanceData || []);
  }

  async function handleAttendance(e) {
    e.preventDefault();

    if (!selectedAthlete || !selectedClass) return;

    const attendanceRecord = {
      athlete_id: Number(selectedAthlete),
      class_id: Number(selectedClass),
      date: new Date().toISOString().split("T")[0],
      status: selectedStatus,
      notes: "",
    };

    const { data, error } = await supabase
      .from("Attendance")
      .insert([attendanceRecord])
      .select();

    if (error) {
      console.error(error);
      return;
    }

    setAttendance([...attendance, data[0]]);

    const athleteName = getAthleteName(Number(selectedAthlete));
    const className = getClassName(Number(selectedClass));

    await logActivity(
      "Attendance Marked",
      `${athleteName} marked ${selectedStatus} for ${className}`
    );

    setSelectedAthlete("");
    setSelectedClass("");
    setSelectedStatus("Present");
  }

  function getAthleteName(id) {
    const athlete = athletes.find(
      (athlete) => Number(athlete.id) === Number(id)
    );

    return athlete ? athlete.name : "Unknown Athlete";
  }

  function getClassName(id) {
    const cls = classes.find(
      (cls) => Number(cls.id) === Number(id)
    );

    return cls ? cls.name : "Unknown Class";
  }

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  if (!session) {
    return <p style={{ padding: "2rem" }}>Access Denied</p>;
  }

  return (
    <div style={pageShell}>
      <Sidebar activePage="attendance" />

      <main style={mainStyle}>
        <h1 style={{ color: "#d4af37" }}>Attendance</h1>

        <form onSubmit={handleAttendance} style={formStyle}>
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

            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={inputStyle}
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
            <option value="Excused">Excused</option>
          </select>

          <button type="submit" style={buttonStyle}>
            Mark Attendance
          </button>
        </form>

        <div style={{ marginTop: "2rem" }}>
          {attendance.map((record) => (
            <div key={record.id} style={cardStyle}>
              <h3 style={{ color: "#d4af37" }}>
                {getAthleteName(record.athlete_id)}
              </h3>

              <p>
                <strong>Class:</strong>{" "}
                {getClassName(record.class_id)}
              </p>

              <p>
                <strong>Date:</strong> {record.date}
              </p>

              <p>
                <strong>Status:</strong> {record.status}
              </p>
            </div>
          ))}
        </div>
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

const formStyle = {
  display: "grid",
  gap: "1rem",
  maxWidth: "400px",
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
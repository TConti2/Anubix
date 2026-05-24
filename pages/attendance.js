import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import { logActivity } from "../lib/ActivityLogger";
import Sidebar from "../components/Sidebar";

export default function Attendance() {
  const { data: session, status } = useSession();
  const [athletes, setAthletes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [userRole, setUserRole] = useState("");
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

    const { data: userData, error: userError } = await supabase
  .from("Users")
  .select("role")
  .eq("email", session.user.email)
  .single();

if (userError) {
  console.error("User role error:", userError);
}

setUserRole(userData?.role || "");
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
    if (userRole && userRole !== "admin" && userRole !== "coach") {
  return (
    <div style={pageShell}>
      <Sidebar activePage="attendance" />

      <main style={mainStyle}>
        <h1>Access Denied</h1>
        <p>This area is only available to coaches and admins.</p>
      </main>
    </div>
  );
}
  }
  async function handleDeleteAttendance(recordId) {
  const recordToDelete = attendance.find(
    (record) => Number(record.id) === Number(recordId)
  );

  const { error } = await supabase
    .from("Attendance")
    .delete()
    .eq("id", recordId);

  if (error) {
    console.error("Error deleting attendance:", error);
    return;
  }

  setAttendance(
    attendance.filter((record) => record.id !== recordId)
  );

  await logActivity(
    "Attendance Deleted",
    `${getAthleteName(recordToDelete?.athlete_id)} attendance record was deleted`
  );
}

async function handleUpdateAttendance(recordId, newStatus) {
  const { data, error } = await supabase
    .from("Attendance")
    .update({ status: newStatus })
    .eq("id", recordId)
    .select();

  if (error) {
    console.error("Error updating attendance:", error);
    return;
  }

  setAttendance(
    attendance.map((record) =>
      record.id === recordId ? data[0] : record
    )
  );

  await logActivity(
    "Attendance Updated",
    `Attendance record updated to ${newStatus}`
  );
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
        <section style={summaryGridStyle}>
  <div style={summaryCardStyle}>
    <strong>Total Records</strong>
    <p>{attendance.length}</p>
  </div>

  <div style={summaryCardStyle}>
    <strong>Present</strong>
    <p>
      {attendance.filter((record) => record.status === "Present").length}
    </p>
  </div>

  <div style={summaryCardStyle}>
    <strong>Absent</strong>
    <p>
      {attendance.filter((record) => record.status === "Absent").length}
    </p>
  </div>

  <div style={summaryCardStyle}>
    <strong>Attendance Rate</strong>
    <p>
      {attendance.length > 0
        ? Math.round(
            (attendance.filter((record) => record.status === "Present").length /
              attendance.length) *
              100
          )
        : 0}
      %
    </p>
  </div>
</section>

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

              <label>
  <strong>Status:</strong>
</label>

<select
  value={record.status}
  onChange={(e) =>
    handleUpdateAttendance(record.id, e.target.value)
  }
  style={inputStyle}
>
  <option value="Present">Present</option>
  <option value="Absent">Absent</option>
  <option value="Late">Late</option>
  <option value="Excused">Excused</option>
</select>
              <button
  onClick={() => handleDeleteAttendance(record.id)}
  style={dangerButton}
>
  Delete
</button>
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

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "1rem",
  marginTop: "2rem",
  marginBottom: "2rem",
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

const summaryCardStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "1rem",
  textAlign: "center",
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
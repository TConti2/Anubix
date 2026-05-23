import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function UpcomingClasses() {
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetchUpcomingClasses();
  }, []);

  async function fetchUpcomingClasses() {
    const { data: classData, error: classError } = await supabase
      .from("Classes")
      .select("*")
      .order("id", { ascending: true })
      .limit(5);

    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from("Enrollments")
      .select("*");

    if (classError) {
      console.error("Upcoming classes error:", classError);
      return;
    }

    if (enrollmentError) {
      console.error("Enrollment count error:", enrollmentError);
    }

    setClasses(classData || []);
    setEnrollments(enrollmentData || []);
  }

  function getEnrollmentCount(classId) {
    return enrollments.filter(
      (enrollment) => Number(enrollment.class_id) === Number(classId)
    ).length;
  }

  return (
    <div>
      <h2 style={{ color: "#d4af37", marginBottom: "1rem" }}>
        Upcoming Classes
      </h2>

      <div style={{ display: "grid", gap: "1rem" }}>
        {classes.length === 0 ? (
          <p style={{ color: "#aaa" }}>No classes found.</p>
        ) : (
          classes.map((cls) => (
            <div key={cls.id} style={classCardStyle}>
              <div>
                <h3 style={{ margin: 0, color: "#f5f5f5" }}>
                  {cls.name}
                </h3>

                <p style={{ margin: "0.4rem 0 0", color: "#9ca3af" }}>
                  {cls.coach} • {cls.day}
                </p>

                <p style={{ margin: "0.4rem 0 0", color: "#9ca3af" }}>
                  Enrollment: {getEnrollmentCount(cls.id)}/{cls.capacity}
                </p>
              </div>

              <div style={timeStyle}>
                {cls.time}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const classCardStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "14px",
  padding: "1rem 1.25rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "1rem",
};

const timeStyle = {
  color: "#d4af37",
  fontWeight: "bold",
  fontSize: "1.1rem",
};
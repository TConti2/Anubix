import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";

export default function Skills() {
  const { data: session, status } = useSession();

  const [athletes, setAthletes] = useState([]);
  const [athleteSkills, setAthleteSkills] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Constructing");
  const [tiers, setTiers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      fetchPyramid();
    }
  }, [session]);

  async function fetchPyramid() {
    const { data: tierData, error: tierError } = await supabase
      .from("PyramidTiers")
      .select("*")
      .order("order", { ascending: true });

    const { data: skillData, error: skillError } = await supabase
      .from("Skills")
      .select("*");

    const { data: athleteData, error: athleteError } = await supabase
      .from("Athletes")
      .select("*");

    const { data: athleteSkillData, error: athleteSkillError } = await supabase
      .from("AthleteSkills")
      .select("*");

    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("role")
      .eq("email", session.user.email)
      .single();

    if (tierError) console.error("Tier error:", tierError);
    if (skillError) console.error("Skill error:", skillError);
    if (athleteError) console.error("Athlete error:", athleteError);
    if (athleteSkillError) console.error("Athlete skill error:", athleteSkillError);
    if (userError) console.error("User role error:", userError);

    setTiers(tierData || []);
    setSkills(skillData || []);
    setAthletes(athleteData || []);
    setAthleteSkills(athleteSkillData || []);
    setUserRole(userData?.role || "");
  }

async function handleSkillProgress(e) {
  e.preventDefault();

  if (!selectedAthlete || !selectedSkill) return;

  const athleteId = Number(selectedAthlete);
  const skillId = Number(selectedSkill);

  const existingRecord = athleteSkills.find(
    (record) =>
      Number(record.athlete_id) === athleteId &&
      Number(record.skill_id) === skillId
  );

  if (existingRecord) {
    const { data, error } = await supabase
      .from("AthleteSkills")
      .update({ status: selectedStatus })
      .eq("id", existingRecord.id)
      .select();

    if (error) {
      console.error("Skill progress update error:", error);
      return;
    }

    setAthleteSkills(
      athleteSkills.map((record) =>
        record.id === existingRecord.id ? data[0] : record
      )
    );
    setStatusMessage("Skill progress updated.");
  } else {
    const progressRecord = {
      athlete_id: athleteId,
      skill_id: skillId,
      status: selectedStatus,
      coach_notes: "",
    };

    const { data, error } = await supabase
      .from("AthleteSkills")
      .insert([progressRecord])
      .select();

    if (error) {
      console.error("Skill progress insert error:", error);
      return;
    }

    setAthleteSkills([...athleteSkills, data[0]]);
    setStatusMessage("Skill progress added.");
  }

  setSelectedAthlete("");
  setSelectedSkill("");
  setSelectedStatus("Constructing");
}

  async function handleUpdateSkillProgress(recordId, newStatus) {
    const { data, error } = await supabase
      .from("AthleteSkills")
      .update({ status: newStatus })
      .eq("id", recordId)
      .select();

    if (error) {
      console.error("Error updating skill progress:", error);
      return;
    }

    setAthleteSkills(
      athleteSkills.map((record) =>
        record.id === recordId ? data[0] : record
      )
    );
  }

  async function handleDeleteSkillProgress(recordId) {
    const { error } = await supabase
      .from("AthleteSkills")
      .delete()
      .eq("id", recordId);

    if (error) {
      console.error("Error deleting skill progress:", error);
      return;
    }

    setAthleteSkills(
      athleteSkills.filter((record) => record.id !== recordId)
    );
  }

  function getSkillsForTier(tierId) {
    return skills.filter((skill) => Number(skill.tier_id) === Number(tierId));
  }

  function getSkillProgress(skillId) {
    return athleteSkills.filter(
      (record) => Number(record.skill_id) === Number(skillId)
    );
  }

  function getAthleteName(athleteId) {
    const athlete = athletes.find(
      (athlete) => Number(athlete.id) === Number(athleteId)
    );

    return athlete ? athlete.name : "Unknown Athlete";
  }

  function renderStatusSection(skill, statusName, headerStyle) {
    const records = getSkillProgress(skill.id).filter(
      (record) => record.status === statusName
    );

    if (records.length === 0) return null;

    return (
      <div style={statusSectionStyle}>
        <h4 style={headerStyle}>{statusName}</h4>

        {records.map((record) => (
          <div key={record.id} style={athleteRowStyle}>
            <span>{getAthleteName(record.athlete_id)}</span>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <select
                value={record.status}
                onChange={(e) =>
                  handleUpdateSkillProgress(record.id, e.target.value)
                }
                style={miniSelect}
              >
                <option value="Constructing">Constructing</option>
                <option value="Completed">Completed</option>
                <option value="Shining">Shining</option>
              </select>

              <button
                onClick={() => handleDeleteSkillProgress(record.id)}
                style={miniDangerButton}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === "loading") return <p style={pageStyle}>Loading...</p>;
  if (!session) return <p style={pageStyle}>Access Denied</p>;

  if (userRole && userRole !== "admin" && userRole !== "coach") {
    return (
      <div style={pageStyle}>
        <h1>Access Denied</h1>
        <p>This area is only available to coaches and admins.</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={{ color: "#d4af37" }}>Skill Pyramid</h1>

      <nav style={navStyle}>
        <a href="/dashboard" style={navLink}>Dashboard</a>
        <a href="/athletes" style={navLink}>Athletes</a>
        <a href="/classes" style={navLink}>Classes</a>
        <a href="/enrollments" style={navLink}>Enrollments</a>
        <a href="/attendance" style={navLink}>Attendance</a>
        <a href="/skills" style={{ ...navLink, color: "#d4af37" }}>Skill Pyramid</a>
      </nav>

      <form onSubmit={handleSkillProgress} style={progressFormStyle}>
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
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select Skill</option>
          {skills.map((skill) => (
            <option key={skill.id} value={skill.id}>
              {skill.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={inputStyle}
        >
          <option value="Constructing">Constructing</option>
          <option value="Completed">Completed</option>
          <option value="Shining">Shining</option>
        </select>

        <button type="submit" style={buttonStyle}>
          Update Skill Progress
        </button>
      </form>
{statusMessage && (
  <p style={{ color: "#d4af37", marginBottom: "1rem" }}>
    {statusMessage}
  </p>
)}

      <div style={pyramidStyle}>
        {tiers.map((tier) => (
          <div
            key={tier.id}
            style={{
              ...tierStyle,
              maxWidth: `${1100 - Number(tier.order) * 150}px`,
            }}
          >
            <h2 style={{ color: "#d4af37", marginTop: 0 }}>
              {tier.name}
            </h2>

            <p style={{ color: "#aaa" }}>{tier.description}</p>

            <div style={skillGridStyle}>
              {getSkillsForTier(tier.id).map((skill) => (
                <div key={skill.id} style={skillCardStyle}>
                  <strong>{skill.name}</strong>

                  <p style={{ color: "#aaa" }}>
                    {skill.description}
                  </p>

                  <div style={{ marginTop: "1rem", textAlign: "left" }}>
                    {renderStatusSection(skill, "Constructing", constructingHeaderStyle)}
                    {renderStatusSection(skill, "Completed", completedHeaderStyle)}
                    {renderStatusSection(skill, "Shining", shiningHeaderStyle)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
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

const navStyle = {
  display: "flex",
  gap: "1rem",
  marginBottom: "2rem",
  flexWrap: "wrap",
};

const navLink = {
  color: "#cfcfcf",
  textDecoration: "none",
  fontWeight: "bold",
};

const progressFormStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "18px",
  padding: "1.5rem",
  marginBottom: "2rem",
  display: "grid",
  gap: "1rem",
  maxWidth: "500px",
};

const pyramidStyle = {
  display: "flex",
  flexDirection: "column-reverse",
  alignItems: "center",
  gap: "1rem",
  maxWidth: "1100px",
  margin: "0 auto",
};

const tierStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "18px",
  padding: "1.5rem",
  textAlign: "center",
  width: "100%",
};

const skillGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1rem",
  marginTop: "1rem",
};

const skillCardStyle = {
  background: "#0b0b0f",
  border: "1px solid #2a2a35",
  borderRadius: "14px",
  padding: "1rem",
};

const statusSectionStyle = {
  marginBottom: "1rem",
  background: "#111118",
  padding: "0.8rem",
  borderRadius: "12px",
};

const athleteRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.5rem",
  gap: "1rem",
};

const constructingHeaderStyle = {
  color: "#d97706",
  marginTop: 0,
};

const completedHeaderStyle = {
  color: "#9ca3af",
  marginTop: 0,
};

const shiningHeaderStyle = {
  color: "#d4af37",
  marginTop: 0,
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

const miniDangerButton = {
  background: "#3b1111",
  color: "#ffb4b4",
  border: "1px solid #7f1d1d",
  borderRadius: "8px",
  padding: "0.25rem 0.5rem",
  cursor: "pointer",
  fontSize: "0.75rem",
  fontWeight: "bold",
};

const miniSelect = {
  background: "#15151d",
  color: "#f5f5f5",
  border: "1px solid #2a2a35",
  borderRadius: "8px",
  padding: "0.25rem 0.5rem",
  fontSize: "0.75rem",
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
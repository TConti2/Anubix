import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";

export default function MyProgress() {
  const { data: session, status } = useSession();

  const [userRole, setUserRole] = useState("");
  const [linkedAthleteId, setLinkedAthleteId] = useState(null);

  const [tiers, setTiers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [athleteSkills, setAthleteSkills] = useState([]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchProgress();
    }
  }, [session]);

  async function fetchProgress() {
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("*")
      .eq("email", session.user.email)
      .single();

    if (userError) {
      console.error("User fetch error:", userError);
      return;
    }

    setUserRole(userData?.role || "");
    setLinkedAthleteId(userData?.athlete_id || null);

    const { data: tierData } = await supabase
      .from("PyramidTiers")
      .select("*")
      .order("order", { ascending: true });

    const { data: skillData } = await supabase
      .from("Skills")
      .select("*");

    const { data: athleteSkillData } = await supabase
      .from("AthleteSkills")
      .select("*")
      .eq("athlete_id", userData?.athlete_id);

    setTiers(tierData || []);
    setSkills(skillData || []);
    setAthleteSkills(athleteSkillData || []);
  }

  function getSkillsForTier(tierId) {
    return skills.filter((skill) => Number(skill.tier_id) === Number(tierId));
  }

  function getSkillStatus(skillId) {
    const record = athleteSkills.find(
      (record) => Number(record.skill_id) === Number(skillId)
    );

    return record ? record.status : "Not Started";
  }

  function getSkillStyle(status) {
    if (status === "Shining") return shiningSkillStyle;
    if (status === "Completed") return completedSkillStyle;
    if (status === "Constructing") return constructingSkillStyle;

    return skillCardStyle;
  }

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  if (!session) {
    return <p style={{ padding: "2rem" }}>Access Denied</p>;
  }

  if (!linkedAthleteId) {
    return (
      <div style={pageShell}>
        <Sidebar activePage="my-progress" />

        <main style={mainStyle}>
          <h1 style={{ color: "#d4af37" }}>My Progress</h1>
          <p>No athlete profile is linked to this account yet.</p>
        </main>
      </div>
    );
  }

  return (
    <div style={pageShell}>
      <Sidebar activePage="my-progress" />

      <main style={mainStyle}>
        <h1 style={{ color: "#d4af37" }}>My Progress</h1>

        <p style={{ color: "#aaa", marginBottom: "2rem" }}>
          Private athlete progression view.
        </p>

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
                {getSkillsForTier(tier.id).map((skill) => {
                  const skillStatus = getSkillStatus(skill.id);

                  return (
                    <div key={skill.id} style={getSkillStyle(skillStatus)}>
                      <strong>{skill.name}</strong>

                      <p style={{ color: "#aaa" }}>
                        {skill.description}
                      </p>

                      <p style={{ marginBottom: 0 }}>
                        Status: <strong>{skillStatus}</strong>
                      </p>
                    </div>
                  );
                })}
              </div>
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
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "1rem",
  marginTop: "1rem",
};

const skillCardStyle = {
  background: "#0b0b0f",
  border: "1px solid #2a2a35",
  borderRadius: "14px",
  padding: "1rem",
};

const constructingSkillStyle = {
  ...skillCardStyle,
  border: "1px solid #b45309",
};

const completedSkillStyle = {
  ...skillCardStyle,
  border: "1px solid #9ca3af",
};

const shiningSkillStyle = {
  ...skillCardStyle,
  border: "1px solid #d4af37",
  boxShadow: "0 0 18px rgba(212, 175, 55, 0.35)",
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
import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";

export default function Glyphs() {
  const { data: session, status } = useSession();

  const [glyphs, setGlyphs] = useState([]);
  const [users, setUsers] = useState([]);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      fetchGlyphs();
      fetchUsers();
    }
  }, [session]);

  async function fetchGlyphs() {
    const { data, error } = await supabase
      .from("Glyphs")
      .select("*")
      .or(`sender_email.eq.${session.user.email},recipient_email.eq.${session.user.email}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Glyph fetch error:", error);
      return;
    }

    setGlyphs(data || []);
  }

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("Users")
      .select("email, name, role")
      .order("email", { ascending: true });

    if (error) {
      console.error("Users fetch error:", error);
      return;
    }

    setUsers(data || []);
  }

  async function handleSendGlyph(e) {
    e.preventDefault();

    if (!recipientEmail || !subject || !message) return;

    const { error } = await supabase.from("Glyphs").insert([
      {
        sender_email: session.user.email,
        recipient_email: recipientEmail,
        subject,
        message,
        status: "Unread",
      },
    ]);

    if (error) {
      console.error("Glyph send error:", error);
      return;
    }

    setRecipientEmail("");
    setSubject("");
    setMessage("");
    fetchGlyphs();
  }

  if (status === "loading") return <p style={{ padding: "2rem" }}>Loading...</p>;
  if (!session) return <p style={{ padding: "2rem" }}>Access Denied</p>;

  return (
    <div style={pageShell}>
      <Sidebar activePage="glyphs" />

      <main style={mainStyle}>
        <h1 style={{ color: "#d4af37" }}>Glyphs</h1>

        <p style={{ color: "#aaa", marginBottom: "2rem" }}>
          Secure messages between coaches, parents, and athletes.
        </p>

        <form onSubmit={handleSendGlyph} style={formStyle}>
          <select
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select recipient</option>

            {users
              .filter((user) => user.email !== session.user.email)
              .map((user) => (
                <option key={user.email} value={user.email}>
                  {user.name || user.email} — {user.role}
                </option>
              ))}
          </select>

          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={inputStyle}
          />

          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={textareaStyle}
          />

          <button type="submit" style={goldButton}>
            Send Glyph
          </button>
        </form>

        <section style={panelStyle}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>Message History</h2>

          {glyphs.length === 0 ? (
            <p style={{ color: "#aaa" }}>No glyphs yet.</p>
          ) : (
            glyphs.map((glyph) => (
              <div key={glyph.id} style={glyphCardStyle}>
                <strong>{glyph.subject}</strong>

                <p style={{ color: "#aaa" }}>{glyph.message}</p>

                <small style={{ color: "#777" }}>
                  From: {glyph.sender_email}
                  <br />
                  To: {glyph.recipient_email}
                  <br />
                  {new Date(glyph.created_at).toLocaleString()}
                </small>
              </div>
            ))
          )}
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
  padding: "clamp(1rem, 4vw, 2rem)",
  minWidth: 0,
};

const formStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "1.5rem",
  display: "grid",
  gap: "1rem",
  marginBottom: "2rem",
  maxWidth: "650px",
};

const inputStyle = {
  padding: "0.9rem 1rem",
  borderRadius: "12px",
  border: "1px solid #2a2a35",
  background: "#0b0b0f",
  color: "#f5f5f5",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: "120px",
  resize: "vertical",
};

const goldButton = {
  background: "#d4af37",
  color: "#0b0b0f",
  border: "none",
  padding: "0.85rem 1rem",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const panelStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "1.5rem",
};

const glyphCardStyle = {
  borderBottom: "1px solid #2a2a35",
  padding: "1rem 0",
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
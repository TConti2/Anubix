import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";

export default function Glyphs() {
  const { data: session, status } = useSession();

  const [glyphs, setGlyphs] = useState([]);
  const [users, setUsers] = useState([]);

  const [recipientEmail, setRecipientEmail] = useState("");
  const [messageType, setMessageType] = useState("General");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [activeTab, setActiveTab] = useState("Inbox");
  const [sendMessage, setSendMessage] = useState("");

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
      .or(
        `sender_email.eq.${session.user.email},recipient_email.eq.${session.user.email}`
      )
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
        message_type: messageType,
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
    setMessageType("General");
    setSubject("");
    setMessage("");
    setSendMessage("Glyph sent.");
    fetchGlyphs();
  }

  async function handleMarkAsRead(glyphId) {
    const { data, error } = await supabase
      .from("Glyphs")
      .update({
        status: "Read",
        read_at: new Date().toISOString(),
      })
      .eq("id", glyphId)
      .select();

    if (error) {
      console.error("Mark as read error:", error);
      return;
    }

    setGlyphs(
      glyphs.map((glyph) =>
        glyph.id === glyphId ? data[0] : glyph
      )
    );
  }

  const inboxGlyphs = glyphs.filter(
    (glyph) => glyph.recipient_email === session?.user?.email
  );

  const sentGlyphs = glyphs.filter(
    (glyph) => glyph.sender_email === session?.user?.email
  );

  const visibleGlyphs = activeTab === "Inbox" ? inboxGlyphs : sentGlyphs;

  const unreadCount = inboxGlyphs.filter(
    (glyph) => glyph.status === "Unread"
  ).length;

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  if (!session) {
    return <p style={{ padding: "2rem" }}>Access Denied</p>;
  }

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

          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            style={inputStyle}
          >
            <option value="General">General</option>
            <option value="Progress">Progress</option>
            <option value="Schedule">Schedule</option>
            <option value="Billing">Billing</option>
            <option value="Concern">Concern</option>
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

          {sendMessage && (
            <p style={{ color: "#d4af37", margin: 0 }}>
              {sendMessage}
            </p>
          )}
        </form>

        <section style={panelStyle}>
          <div style={tabRowStyle}>
            <button
              onClick={() => setActiveTab("Inbox")}
              style={
                activeTab === "Inbox"
                  ? activeTabButtonStyle
                  : tabButtonStyle
              }
            >
              Inbox ({unreadCount} unread)
            </button>

            <button
              onClick={() => setActiveTab("Sent")}
              style={
                activeTab === "Sent"
                  ? activeTabButtonStyle
                  : tabButtonStyle
              }
            >
              Sent
            </button>
          </div>

          <h2 style={{ color: "#d4af37", marginTop: 0 }}>
            {activeTab}
          </h2>

          {visibleGlyphs.length === 0 ? (
            <p style={{ color: "#aaa" }}>No glyphs here yet.</p>
          ) : (
            visibleGlyphs.map((glyph) => {
              const isUnread =
                glyph.status === "Unread" &&
                glyph.recipient_email === session.user.email;

              return (
                <div
                  key={glyph.id}
                  style={{
                    ...glyphCardStyle,
                    ...(isUnread ? unreadGlyphStyle : {}),
                  }}
                >
                  <div style={glyphHeaderStyle}>
                    <div>
                      <strong>{glyph.subject}</strong>

                      <p style={typeBadgeStyle}>
                        {glyph.message_type || "General"}
                      </p>
                    </div>

                    <span style={statusBadgeStyle}>
                      {glyph.status}
                    </span>
                  </div>

                  <p style={{ color: "#aaa", whiteSpace: "pre-wrap" }}>
                    {glyph.message}
                  </p>

                  <small style={{ color: "#777" }}>
                    From: {glyph.sender_email}
                    <br />
                    To: {glyph.recipient_email}
                    <br />
                    {new Date(glyph.created_at).toLocaleString()}
                  </small>

                  {isUnread && (
                    <div style={{ marginTop: "1rem" }}>
                      <button
                        onClick={() => handleMarkAsRead(glyph.id)}
                        style={smallButtonStyle}
                      >
                        Mark as Read
                      </button>
                    </div>
                  )}
                </div>
              );
            })
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
  padding: "clamp(1rem, 4vw, 1.5rem)",
  display: "grid",
  gap: "1rem",
  marginBottom: "2rem",
  maxWidth: "650px",
  boxSizing: "border-box",
};

const inputStyle = {
  padding: "0.9rem 1rem",
  borderRadius: "12px",
  border: "1px solid #2a2a35",
  background: "#0b0b0f",
  color: "#f5f5f5",
  width: "100%",
  boxSizing: "border-box",
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
  width: "100%",
};

const panelStyle = {
  background: "#15151d",
  border: "1px solid #2a2a35",
  borderRadius: "16px",
  padding: "clamp(1rem, 4vw, 1.5rem)",
  boxSizing: "border-box",
};

const tabRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  marginBottom: "1.5rem",
};

const tabButtonStyle = {
  background: "#1f1f2b",
  color: "#f5f5f5",
  border: "1px solid #2f2f3d",
  borderRadius: "10px",
  padding: "0.65rem 0.9rem",
  cursor: "pointer",
  fontWeight: "bold",
};

const activeTabButtonStyle = {
  ...tabButtonStyle,
  background: "#d4af37",
  color: "#0b0b0f",
};

const glyphCardStyle = {
  borderBottom: "1px solid #2a2a35",
  padding: "1rem 0",
};

const unreadGlyphStyle = {
  background: "rgba(212, 175, 55, 0.08)",
  borderRadius: "12px",
  padding: "1rem",
};

const glyphHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "1rem",
  flexWrap: "wrap",
};

const typeBadgeStyle = {
  display: "inline-block",
  color: "#d4af37",
  border: "1px solid #d4af37",
  borderRadius: "999px",
  padding: "0.2rem 0.55rem",
  fontSize: "0.75rem",
  margin: "0.5rem 0 0",
};

const statusBadgeStyle = {
  background: "#1f1f2b",
  color: "#f5f5f5",
  border: "1px solid #2f2f3d",
  borderRadius: "999px",
  padding: "0.3rem 0.65rem",
  fontSize: "0.75rem",
  fontWeight: "bold",
};

const smallButtonStyle = {
  background: "#d4af37",
  color: "#0b0b0f",
  border: "none",
  borderRadius: "8px",
  padding: "0.5rem 0.75rem",
  fontWeight: "bold",
  cursor: "pointer",
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
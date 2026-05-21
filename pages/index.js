import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0f",
        color: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <section
        style={{
          maxWidth: "720px",
          width: "100%",
          background: "#15151d",
          border: "1px solid #2a2a35",
          borderRadius: "24px",
          padding: "3rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#d4af37", fontSize: "3rem", marginBottom: "1rem" }}>
          Anubix
        </h1>

        <p style={{ color: "#cfcfcf", fontSize: "1.2rem", marginBottom: "2rem" }}>
          Class management built for gyms, coaches, athletes, and parents.
        </p>

        {status === "loading" ? (
          <p>Checking login...</p>
        ) : session ? (
          <>
            <Link href="/dashboard">
              <button style={buttonStyle}>Go to Dashboard</button>
            </Link>

            <button onClick={() => signOut()} style={secondaryButtonStyle}>
              Sign Out
            </button>
          </>
        ) : (
          <button onClick={() => signIn("google")} style={buttonStyle}>
            Sign in with Google
          </button>
        )}
      </section>
    </main>
  );
}

const buttonStyle = {
  background: "#d4af37",
  color: "#0b0b0f",
  border: "none",
  borderRadius: "12px",
  padding: "0.9rem 1.4rem",
  fontWeight: "bold",
  cursor: "pointer",
  margin: "0.5rem",
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: "#1f1f2b",
  color: "#f5f5f5",
  border: "1px solid #2f2f3d",
};
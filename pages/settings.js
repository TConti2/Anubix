import { getSession, useSession } from "next-auth/react";
import Sidebar from "../components/Sidebar";

export default function Settings() {
  const { status } = useSession();

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  return (
    <div style={pageShell}>
      <Sidebar activePage="settings" />

      <main style={mainStyle}>
        <h1 style={{ color: "#d4af37" }}>Settings</h1>

        <p style={{ color: "#aaa" }}>
          Organization settings, roles, permissions, branding, and account controls will live here.
        </p>
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
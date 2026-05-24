import { getSession } from "next-auth/react";

export default function Home() {
  return null;
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  return {
    redirect: {
      destination: session ? "/dashboard" : "/auth/signin",
      permanent: false,
    },
  };
}
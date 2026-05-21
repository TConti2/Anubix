import { useSession, signIn, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();

  console.log("Session in navbar:", session); 

  return (
    <nav>
      <a href="/">Home</a>
      <a href="/dashboard">Dashboard</a>
      {session ? (
        <button onClick={() => signOut()}>Sign out</button>
      ) : (
        <button onClick={() => signIn()}>Sign in</button>
      )}
    </nav>
  );
};

export default Navbar;

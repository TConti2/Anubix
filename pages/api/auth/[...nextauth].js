import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return baseUrl + "/dashboard";
    },
  },
};

export default NextAuth(authOptions);

console.log("GOOGLE_ID:", process.env.GOOGLE_ID);
console.log("GOOGLE_SECRET:", process.env.GOOGLE_SECRET);

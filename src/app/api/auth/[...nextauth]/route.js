import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found with this email");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Convert Mongoose document to plain object and ensure _id is converted to string
        const userObject = {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          ...(user.role === "admin"
            ? {
                adminFields: JSON.parse(JSON.stringify(user.adminFields)),
              }
            : {
                userFields: JSON.parse(JSON.stringify(user.userFields)),
              }),
        };

        console.log("Authorize returning user object:", userObject);
        return userObject;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // console.log("JWT Callback - Trigger:", trigger);
      // console.log("JWT Callback - Incoming user:", user);
      // console.log("JWT Callback - Current token:", token);

      if (user) {
        // When signing in
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        if (user.role === "admin") {
          token.adminFields = user.adminFields;
        } else {
          token.userFields = user.userFields;
        }
      }

      // console.log("JWT Callback - Returning token:", token);
      return token;
    },
    async session({ session, token }) {
      // console.log("Session Callback - Incoming token:", token);
      // console.log("Session Callback - Current session:", session);

      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;

        if (token.role === "admin") {
          session.user.adminFields = token.adminFields;
        } else {
          session.user.userFields = token.userFields;
        }
      }

      // console.log("Session Callback - Returning session:", session);
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: true, // Enable debug mode in development
  events: {
    async signOut({ session, token }) {
      // Perform any cleanup here
      try {
        // Add any additional cleanup you need
        console.log("User signed out successfully");
      } catch (error) {
        console.error("Error during sign out:", error);
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

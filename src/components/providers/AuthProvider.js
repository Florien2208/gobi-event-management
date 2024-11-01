// components/providers/AuthProvider.js
"use client";

import { SessionProvider } from "next-auth/react";

function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export default AuthProvider;

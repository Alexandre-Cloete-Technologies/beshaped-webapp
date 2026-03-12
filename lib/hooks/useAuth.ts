"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

export const useAuth = () => useAuthState(auth);

"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuthGuard } from "./AuthGuard";

const PUBLIC_PATHS = ["/", "/login"];

type ConditionalAuthGuardProps = {
  children: ReactNode;
};

export const ConditionalAuthGuard = ({ children }: ConditionalAuthGuardProps) => {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname ?? "/");

  if (isPublic) {
    return <>{children}</>;
  }

  return <AuthGuard>{children}</AuthGuard>;
};

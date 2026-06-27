import React from "react";
import { redirect } from "next/navigation";

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }

  return <>{children}</>;
}


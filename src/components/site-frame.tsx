"use client";
import { usePathname } from "next/navigation";
export function SiteFrame({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  const admin = /^\/(en|es|pt)\/admin(?:\/|$)/.test(usePathname());
  return (
    <>
      {!admin && header}
      {children}
      {!admin && footer}
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function crumbsFor(pathname: string): {
  parent?: { href: string; label: string };
  page: string;
} {
  if (pathname.startsWith("/chatbots/") && pathname !== "/chatbots") {
    return { parent: { href: "/chatbots", label: "Chatbots" }, page: "Builder" };
  }
  if (pathname === "/chatbots") return { page: "Chatbots" };
  if (pathname === "/knowledge") return { page: "Knowledge" };
  if (pathname === "/analytics") return { page: "Analytics" };
  if (pathname === "/conversations") return { page: "Conversations" };
  if (pathname === "/settings/team") {
    return { parent: { href: "/settings", label: "Settings" }, page: "Team" };
  }
  if (pathname === "/settings/billing") {
    return { parent: { href: "/settings", label: "Settings" }, page: "Billing" };
  }
  if (pathname === "/settings") {
    return {
      parent: { href: "/settings", label: "Settings" },
      page: "Organization",
    };
  }
  return { page: "Studio" };
}

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const { parent, page } = crumbsFor(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {parent ? (
          <>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink render={<Link href={parent.href} />}>
                {parent.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
          </>
        ) : null}
        <BreadcrumbItem>
          <BreadcrumbPage>{page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

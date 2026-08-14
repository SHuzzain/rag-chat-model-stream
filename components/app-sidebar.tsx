"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

import {
  BarChart3Icon,
  BookOpenIcon,
  BotIcon,
  HomeIcon,
  MessageSquareIcon,
  Settings2Icon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export type ShellUser = {
  name: string;
  email: string;
  avatar: string;
};

export type ShellTeam = {
  id: string;
  name: string;
  plan: string;
};

function isPathActive(pathname: string, href: string) {
  if (href === "/settings") return pathname === "/settings";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({
  user,
  teams,
  activeTeamId,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: ShellUser;
  teams: ShellTeam[];
  activeTeamId?: string;
}) {
  const pathname = usePathname();

  const navMain = [
    {
      title: "Home",
      url: "/dashboard",
      icon: <HomeIcon />,
      isActive: isPathActive(pathname, "/"),
    },
    {
      title: "Build",
      url: "/chatbots",
      icon: <BotIcon />,
      isActive:
        isPathActive(pathname, "/chatbots") || isPathActive(pathname, "/c"),
      items: [
        { title: "Chatbots", url: "/chatbots" },
        { title: "Playground", url: "/c" },
      ],
    },
    {
      title: "Context",
      url: "/knowledge",
      icon: <BookOpenIcon />,
      isActive: isPathActive(pathname, "/knowledge"),
      items: [{ title: "Knowledge", url: "/knowledge" }],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings2Icon />,
      isActive: isPathActive(pathname, "/settings"),
      items: [
        { title: "Organization", url: "/settings" },
        { title: "Team", url: "/settings/team" },
        { title: "Billing", url: "/settings/billing" },
      ],
    },
  ];

  const monitor = [
    {
      name: "Analytics",
      url: "/analytics",
      icon: <BarChart3Icon />,
    },
    {
      name: "Conversations",
      url: "/conversations",
      icon: <MessageSquareIcon />,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} activeTeamId={activeTeamId} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} pathname={pathname} />
        <NavProjects projects={monitor} label="Monitor" pathname={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

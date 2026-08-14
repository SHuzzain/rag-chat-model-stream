"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronRightIcon } from "lucide-react";

function isPathActive(pathname: string, href: string) {
  if (href === "/settings") return pathname === "/settings";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavMain({
  items,
  pathname,
}: {
  items: {
    title: string;
    url: string;
    icon?: ReactNode;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          item.items?.length ?
            <NavItemCollapsible key={item.title} item={item} pathname={pathname} /> :
            <NavItemNonCollapsible key={item.title} item={item} pathname={pathname} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}


interface NavItemCollapsibleProps {
  item: {
    title: string;
    url: string;
    icon?: ReactNode;
    isActive?: boolean;
    items?: { title: string; url: string }[];
  };
  pathname: string;
}

const NavItemCollapsible = ({ item, pathname }: NavItemCollapsibleProps) => {
  return (
    <Collapsible
      key={item.title}
      defaultOpen={item.isActive}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={<SidebarMenuButton tooltip={item.title} />}
      >
        {item.icon}
        <span>{item.title}</span>
        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items?.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton
                render={<Link href={subItem.url} />}
                isActive={isPathActive(pathname, subItem.url)}
              >
                <span>{subItem.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
};



const NavItemNonCollapsible = ({ item, pathname }: NavItemCollapsibleProps) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={item.title} render={<Link href={item.url} />} isActive={isPathActive(pathname, item.url)}>
        {item.icon}
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
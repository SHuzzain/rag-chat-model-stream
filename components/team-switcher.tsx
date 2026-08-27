"use client";

import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { setActiveOrganizationAction } from "@/feature/org/actions/org.actions";
import { useUserOrganizations } from "@/feature/org/queries/org.queries";
import { ChevronsUpDownIcon, GalleryVerticalEndIcon, PlusIcon } from "lucide-react";

export function TeamSwitcher({
  teams,
  activeTeamId,
}: {
  teams: {
    id: string;
    name: string;
    plan: string;
  }[];
  activeTeamId?: string;
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { data: orgs } = useUserOrganizations();
  const listed = Array.isArray(orgs) ? orgs : [];
  const resolvedTeams = listed.length
    ? listed.map((item) => ({
        id: item.id,
        name: item.name,
        plan: item.slug || "Workspace",
      }))
    : teams;
  const activeTeam =
    resolvedTeams.find((team) => team.id === activeTeamId) ?? resolvedTeams[0];

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <GalleryVerticalEndIcon />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeTeam.name}</span>
              <span className="truncate text-xs">{activeTeam.plan}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Teams
              </DropdownMenuLabel>
              {resolvedTeams.map((team, index) => (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => {
                    if (team.id === activeTeam.id) return;
                    void setActiveOrganizationAction(team.id);
                  }}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <GalleryVerticalEndIcon />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => router.push("/onboarding")}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <PlusIcon className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add team
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

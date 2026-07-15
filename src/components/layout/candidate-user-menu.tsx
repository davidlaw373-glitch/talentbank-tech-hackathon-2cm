"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CandidateUserMenuProps {
  name: string;
  initials: string;
}

export function CandidateUserMenu({ name, initials }: CandidateUserMenuProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label={`Open ${name}'s account menu`}
          className="flex h-auto items-center gap-3 rounded-md px-3 py-2"
        >
          <Badge variant="secondary" aria-hidden>
            {initials}
          </Badge>
          <span className="text-left">
            <span className="block text-sm font-medium leading-tight">
              {name}
            </span>
            <small className="block leading-tight">Candidate</small>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/candidate/profile")}>
          <UserRound aria-hidden />
          Profile
        </DropdownMenuItem>
        {/* Settings page is not implemented yet — placeholder item. */}
        <DropdownMenuItem disabled>
          <Settings aria-hidden />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/")}>
          <LogOut aria-hidden />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

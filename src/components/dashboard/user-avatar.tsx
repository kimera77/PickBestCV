"use client";

import { useAuth } from "@/lib/auth/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircleUser } from "lucide-react";

export function UserAvatar() {
  const { user } = useAuth();

  return (
    <Avatar className="h-9 w-9">
      <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? ''} />
      <AvatarFallback>
        <CircleUser className="h-9 w-9 opacity-75" />
      </AvatarFallback>
    </Avatar>
  );
}

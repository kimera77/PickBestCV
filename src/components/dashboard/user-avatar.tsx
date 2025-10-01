"use client";

import { useAuth } from "@/lib/auth/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircleUser } from "lucide-react";

export function UserAvatar() {
  const { user } = useAuth();

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? ''} />
      <AvatarFallback>
        <CircleUser className="h-8 w-8 p-0.5 opacity-80" />
      </AvatarFallback>
    </Avatar>
  );
}

"use client";

import { useAuth } from "@/lib/auth/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircleUser } from "lucide-react";

export function UserAvatar() {
  const { user } = useAuth();

  return (
    <Avatar>
      <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? ''} />
      <AvatarFallback>
        <CircleUser className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  );
}

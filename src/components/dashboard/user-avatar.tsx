"use client";

import { useAuth } from "@/lib/auth/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getInitials = (name: string | null | undefined) => {
  if (!name) return "";
  const names = name.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};

export function UserAvatar() {
  const { user } = useAuth();

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? ''} />
      <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
    </Avatar>
  );
}

import React, { memo, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface AvatarWrapperProps {
  name: string;
  image?: string;
  size?: number;
}

function AvatarWrapperComponent({ name, image, size = 8 }: AvatarWrapperProps) {
  const avatarClass = useMemo(() => `size-${size}`, [size]);

  const initials = useMemo(() => {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
  }, [name]);

  return (
    <Avatar className={avatarClass}>
      {image ? (
        <AvatarImage src={image} alt={name} />
      ) : null}
      <AvatarFallback className="bg-gradient">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export const AvatarWrapper = memo(AvatarWrapperComponent);
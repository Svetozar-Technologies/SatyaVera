interface GandhiAvatarProps {
  size?: "sm" | "md" | "lg";
}

export function GandhiAvatar({ size = "md" }: GandhiAvatarProps) {
  const sizeClass = size === "lg" ? "lg" : size === "sm" ? "sm" : "";
  return <div className={`gandhi-avatar ${sizeClass}`} aria-label="GandhiAI" />;
}

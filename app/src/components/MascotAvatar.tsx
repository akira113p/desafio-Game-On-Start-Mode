"use client";

interface MascotAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  floating?: boolean;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-28 h-28",
};

export default function MascotAvatar({
  size = "md",
  className = "",
  floating = false,
}: MascotAvatarProps) {
  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-accent-light to-primary-light flex items-center justify-center overflow-hidden ${floating ? "animate-float" : ""} ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Body */}
        <ellipse cx="50" cy="58" rx="28" ry="30" fill="white" stroke="#3B82F6" strokeWidth="1.5" />
        {/* Head */}
        <circle cx="50" cy="35" r="22" fill="white" stroke="#3B82F6" strokeWidth="1.5" />
        {/* Visor */}
        <ellipse cx="50" cy="33" rx="17" ry="12" fill="#1E3A5F" />
        {/* Eyes */}
        <path d="M41 31 Q43 28 45 31" stroke="#60D5FA" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M55 31 Q57 28 59 31" stroke="#60D5FA" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Cap */}
        <path d="M28 30 Q30 15 50 13 Q70 15 72 30" fill="#F97316" stroke="#EA580C" strokeWidth="1" />
        <rect x="25" y="28" width="50" height="5" rx="2" fill="white" stroke="#F97316" strokeWidth="0.5" />
        {/* Headphones */}
        <circle cx="28" cy="35" r="5" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
        <circle cx="72" cy="35" r="5" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
        {/* Badge */}
        <rect x="38" y="60" width="24" height="16" rx="3" fill="white" stroke="#3B82F6" strokeWidth="1" />
        <rect x="40" y="58" width="20" height="4" rx="1" fill="#3B82F6" />
        {/* Tie */}
        <polygon points="50,52 46,60 50,64 54,60" fill="#F97316" />
        {/* Arms */}
        <ellipse cx="24" cy="55" rx="6" ry="10" fill="white" stroke="#3B82F6" strokeWidth="1" />
        <ellipse cx="76" cy="50" rx="6" ry="10" fill="white" stroke="#3B82F6" strokeWidth="1" transform="rotate(-15 76 50)" />
        {/* Feet */}
        <ellipse cx="40" cy="86" rx="10" ry="5" fill="white" stroke="#3B82F6" strokeWidth="1" />
        <ellipse cx="60" cy="86" rx="10" ry="5" fill="white" stroke="#3B82F6" strokeWidth="1" />
      </svg>
    </div>
  );
}

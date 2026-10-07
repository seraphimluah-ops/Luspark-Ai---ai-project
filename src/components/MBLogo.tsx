import React from 'react';

interface MBLogoProps {
  className?: string;
  size?: number;
}

export const MBLogo: React.FC<MBLogoProps> = ({ className = 'h-7 w-7', size = 28 }) => {
  const gradId = 'mb_brand_gradient';
  const glowId = 'mb_glow_filter';

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id={gradId} x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="35%" stopColor="#6366F1" />
            <stop offset="70%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id={`${gradId}_accent`} x1="20" y1="20" x2="50" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hex-Rounded Dynamic Frame */}
        <rect
          x="4"
          y="4"
          width="56"
          height="56"
          rx="18"
          fill="#131418"
          stroke={`url(#${gradId})`}
          strokeWidth="2"
        />

        {/* Subtle Ambient Core Glow */}
        <circle cx="32" cy="32" r="18" fill={`url(#${gradId})`} opacity="0.12" filter={`url(#${glowId})`} />

        {/* Integrated 'M' & 'B' Vector Glyphs */}
        <g stroke={`url(#${gradId})`} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* 'M' Stem 1 */}
          <path d="M16 46V20L25 33L32 23" />
          
          {/* 'M' Stem 2 & 'B' Spine Conjunction */}
          <path d="M32 23V46" />

          {/* 'B' Upper Loop */}
          <path d="M32 22H41C44.3 22 47 24.7 47 28C47 31.3 44.3 34 41 34H32" />

          {/* 'B' Lower Loop */}
          <path d="M32 34H42C45.3 34 48 36.7 48 40C48 43.3 45.3 46 42 46H32" />
        </g>

        {/* Brilliant Diamond Sparkle Accent on top right of M */}
        <path
          d="M48 14C48 16.5 49.5 18 52 18C49.5 18 48 19.5 48 22C48 19.5 46.5 18 44 18C46.5 18 48 16.5 48 14Z"
          fill="#FFFFFF"
        />

        {/* Central Luminous Dot */}
        <circle cx="32" cy="33.5" r="1.75" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

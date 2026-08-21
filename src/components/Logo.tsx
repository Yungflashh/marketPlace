import React, { useId } from 'react';

interface Props {
  className?: string;
  size?: number;
}

const Logo: React.FC<Props> = ({ className = '', size = 24 }) => {
  const gradId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#877AFF" />
          <stop offset="1" stopColor="#5A4FE0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${gradId})`} />
      <circle cx="32" cy="27" r="9" fill="#0B0B10" fillOpacity="0.92" />
      <path d="M32 34 L32 46" stroke="#0B0B10" strokeOpacity="0.92" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
};

export default Logo;

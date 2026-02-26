import React from 'react';

const Avatar = ({ name, role, size = 'md' }) => {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  const px = sizes[size];

  const roleStyles = {
    admin: {
      bgFrom: '#a78bfa',
      bgTo: '#7c3aed',
      suit: '#2e1065',
      shirt: '#ede9fe',
      tie: '#8b5cf6',
      tieKnot: '#7c3aed',
      tieShadow: '#6d28d9',
      radial: true,
    },
    project_manager: {
      bgFrom: '#60a5fa',
      bgTo: '#2563eb',
      suit: '#1e3a5f',
      shirt: '#dbeafe',
      tie: '#3b82f6',
      tieKnot: '#2563eb',
      tieShadow: '#1d4ed8',
      radial: true,
    },
    user: {
      bgFrom: '#f8fafc',
      bgTo: '#f8fafc',
      suit: '#1e293b',
      shirt: '#f1f5f9',
      tie: '#ffffff',
      tieKnot: '#e2e8f0',
      tieShadow: '#cbd5e1',
      radial: false,
    },
  };

  const s = roleStyles[role] || roleStyles.user;
  const gradientId = `avatar-bg-${role}-${name?.replace(/\s/g, '') || 'unknown'}`;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, borderRadius: '50%' }}
    >
      <defs>
        {s.radial ? (
          <radialGradient id={gradientId} cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor={s.bgFrom} />
            <stop offset="100%" stopColor={s.bgTo} />
          </radialGradient>
        ) : (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={s.bgFrom} />
            <stop offset="100%" stopColor={s.bgTo} />
          </linearGradient>
        )}
      </defs>

      {/* Pozadina */}
      <circle cx="50" cy="50" r="50" fill={`url(#${gradientId})`} />

      {/* Glava + telo — spojena silueta */}
      <path
        d="M50 13 C39 13 31 21 31 31 C31 39 36 46 43 48 C34 51 17 59 15 100 L85 100 C83 59 66 51 57 48 C64 46 69 39 69 31 C69 21 61 13 50 13 Z"
        fill={s.suit}
      />

      {/* Košulja — V izrez */}
      <path d="M50 48 L44 58 L50 56 L56 58 Z" fill={s.shirt} />

      {/* Kravata — telo */}
      <path d="M50 54 L46 65 L50 82 L54 65 Z" fill={s.tie} />

      {/* Kravata — čvor */}
      <path d="M46 52 L54 52 L52 56 L48 56 Z" fill={s.tieKnot} />

      {/* Kravata — senka */}
      <path d="M50 54 L48 65 L50 82 L50 54 Z" fill={s.tieShadow} opacity="0.4" />
    </svg>
  );
};

export default Avatar;
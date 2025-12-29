'use client';

interface SlabSafariLogoProps {
  className?: string;
  showTagline?: boolean;
  variant?: 'full' | 'icon' | 'text';
}

export function SlabSafariLogo({ className = '', showTagline = true, variant = 'full' }: SlabSafariLogoProps) {
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Safari Hat Icon */}
        <g>
          {/* Hat brim */}
          <ellipse cx="50" cy="65" rx="45" ry="8" fill="#D4AF37" stroke="#1B3A2F" strokeWidth="3"/>

          {/* Hat crown - outer */}
          <path
            d="M 20 65 Q 20 25, 50 20 Q 80 25, 80 65 Z"
            fill="#D4AF37"
            stroke="#1B3A2F"
            strokeWidth="3"
          />

          {/* Hat crown - inner dome */}
          <path
            d="M 30 65 Q 30 35, 50 30 Q 70 35, 70 65 Z"
            fill="#1B3A2F"
            stroke="#1B3A2F"
            strokeWidth="2"
          />

          {/* Card slot */}
          <rect x="40" y="45" width="20" height="25" fill="#D7C7A3" stroke="#1B3A2F" strokeWidth="2" rx="1"/>
        </g>
      </svg>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="text-safari-green font-bold tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <span className="text-4xl">SLAB SAFARI</span>
        </div>
        {showTagline && (
          <div className="text-safari-green text-xs tracking-wider uppercase mt-1">
            The hunt for gem mint pulls.
          </div>
        )}
      </div>
    );
  }

  // Full logo
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12"
      >
        {/* Safari Hat Icon */}
        <g>
          {/* Hat brim */}
          <ellipse cx="50" cy="65" rx="45" ry="8" fill="#D4AF37" stroke="#1B3A2F" strokeWidth="3"/>

          {/* Hat crown - outer */}
          <path
            d="M 20 65 Q 20 25, 50 20 Q 80 25, 80 65 Z"
            fill="#D4AF37"
            stroke="#1B3A2F"
            strokeWidth="3"
          />

          {/* Hat crown - inner dome */}
          <path
            d="M 30 65 Q 30 35, 50 30 Q 70 35, 70 65 Z"
            fill="#1B3A2F"
            stroke="#1B3A2F"
            strokeWidth="2"
          />

          {/* Card slot */}
          <rect x="40" y="45" width="20" height="25" fill="#D7C7A3" stroke="#1B3A2F" strokeWidth="2" rx="1"/>
        </g>
      </svg>

      <div className="flex flex-col">
        <div className="text-safari-green font-bold tracking-tight text-2xl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          SLAB SAFARI
        </div>
        {showTagline && (
          <div className="text-safari-green text-xs tracking-wider uppercase -mt-1">
            The hunt for gem mint pulls.
          </div>
        )}
      </div>
    </div>
  );
}

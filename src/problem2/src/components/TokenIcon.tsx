import { useEffect, useState } from 'react';
import type { Token } from '../types';

interface TokenIconProps {
  token: Token;
  size?: number;
}

export default function TokenIcon({ token, size = 30 }: TokenIconProps) {
  const [broken, setBroken] = useState(false);

  useEffect(() => setBroken(false), [token.iconUrl]);

  if (broken) {
    return (
      <span
        className="token-icon token-icon--fallback"
        style={{ width: size, height: size }}
        aria-hidden
      >
        {token.symbol.slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      className="token-icon"
      src={token.iconUrl}
      width={size}
      height={size}
      alt=""
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

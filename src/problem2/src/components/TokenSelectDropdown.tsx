import { useEffect, useRef, useState } from 'react';
import { formatAmount, formatUsd } from '../lib/format';
import type { Token } from '../types';
import TokenIcon from './TokenIcon';
import './TokenSelectDropdown.css';

interface TokenSelectDropdownProps {
  tokens: Token[];
  selectedSymbol?: string;
  disabledSymbol?: string;
  above?: boolean;
  onSelect: (token: Token) => void;
}

export default function TokenSelectDropdown({
  tokens,
  selectedSymbol,
  disabledSymbol,
  above = false,
  onSelect,
}: TokenSelectDropdownProps) {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filtered = query.trim()
    ? tokens.filter(
        (t) =>
          t.symbol.toLowerCase().includes(query.toLowerCase()),
      )
    : tokens;

  return (
    <div className={`token-dropdown${above ? ' token-dropdown--above' : ''}`} role="listbox" aria-label="Select token">
      <div className="token-dropdown__search">
        <svg
          className="token-dropdown__search-icon"
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
        >
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
          <path d="M15 15l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          ref={searchRef}
          type="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search token…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search tokens"
        />
      </div>

      <ul className="token-dropdown__list">
        {filtered.length === 0 && (
          <li className="token-dropdown__empty">No tokens found</li>
        )}
        {filtered.map((token) => {
          const isSelected = token.symbol === selectedSymbol;
          const isDisabled = token.symbol === disabledSymbol;
          return (
            <li key={token.symbol} role="option" aria-selected={isSelected}>
              <button
                type="button"
                className={`token-row${isSelected ? ' token-row--active' : ''}`}
                onClick={() => onSelect(token)}
              >
                <TokenIcon token={token} size={36} />
                <div className="token-row__main">
                  <div className="token-row__symbol">
                    {token.symbol}
                    {isDisabled && (
                      <span className="token-row__tag">In use</span>
                    )}
                  </div>
                  <div className="token-row__price">{formatUsd(token.price)}</div>
                </div>
                <div className="token-row__balance">{formatAmount(token.balance)}</div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

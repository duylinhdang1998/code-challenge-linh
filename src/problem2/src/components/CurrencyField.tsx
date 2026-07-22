import { useCallback, useEffect, useRef, useState } from 'react';
import { formatAmount, formatUsd } from '../lib/format';
import type { Token } from '../types';
import Icon from './Icon';
import TokenIcon from './TokenIcon';
import TokenSelectDropdown from './TokenSelectDropdown';

interface CurrencyFieldProps {
  label: string;
  token: Token | null;
  value: string;
  usdValue: number;
  tokens: Token[];
  selectedSymbol?: string;
  disabledSymbol?: string;
  showMax?: boolean;
  invalid?: boolean;
  onValueChange: (value: string) => void;
  onTokenSelect: (token: Token) => void;
  onMax?: () => void;
}

export default function CurrencyField({
  label,
  token,
  value,
  usdValue,
  tokens,
  selectedSymbol,
  disabledSymbol,
  showMax = false,
  invalid = false,
  onValueChange,
  onTokenSelect,
  onMax,
}: CurrencyFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [above, setAbove] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setAbove(spaceBelow < 380);
    }
    setIsOpen(true);
  }, [isOpen]);

  const handleSelect = useCallback(
    (selectedToken: Token) => {
      setIsOpen(false);
      onTokenSelect(selectedToken);
    },
    [onTokenSelect],
  );

  return (
    <div className={`field${invalid ? ' field--invalid' : ''}`}>
      <div className="field__head">
        <span className="field__label">{label}</span>
        {token && (
          <span className="field__balance">
            Balance: {formatAmount(token.balance)} {token.symbol}
            {showMax && (
              <button type="button" className="field__max" onClick={onMax}>
                MAX
              </button>
            )}
          </span>
        )}
      </div>

      <div className="field__body">
        <input
          className="field__input"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          placeholder="0"
          aria-label={`${label} amount`}
          aria-invalid={invalid || undefined}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
        />

        {/* Anchor wrapper — TokenSelectDropdown is absolutely positioned inside */}
        <div className="token-select-wrap" ref={wrapRef}>
          <button
            type="button"
            ref={triggerRef}
            className="token-select"
            onClick={handleToggle}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-label={token ? `Selected token: ${token.symbol}. Click to change.` : 'Select token'}
          >
            {token ? (
              <>
                <TokenIcon token={token} size={26} />
                <span className="token-select__symbol">{token.symbol}</span>
              </>
            ) : (
              <span className="token-select__symbol token-select__symbol--empty">Select</span>
            )}
            <Icon name="chevron-down" size={16} className="token-select__chevron" />
          </button>

          {isOpen && (
            <TokenSelectDropdown
              tokens={tokens}
              selectedSymbol={selectedSymbol}
              disabledSymbol={disabledSymbol}
              above={above}
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>

      <div className="field__foot">
        <span className="field__usd">{value ? formatUsd(usdValue) : '$0.00'}</span>
      </div>
    </div>
  );
}

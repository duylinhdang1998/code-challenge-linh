import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_FROM, DEFAULT_TO, SWAP_SIMULATION_MS } from '../constants';
import { formatAmount, parseAmount, sanitizeAmount } from '../lib/format';
import type { Token } from '../types';
import CurrencyField from './CurrencyField';
import Icon from './Icon';
import './SwapCard.css';

interface SwapCardProps {
  tokens: Token[];
  onReload: () => void;
}

interface SuccessInfo {
  fromAmount: string;
  fromSymbol: string;
  toAmount: string;
  toSymbol: string;
}

type SwapStatus = 'idle' | 'swapping' | 'success';

function toInputStr(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n < 0.0001) return parseFloat(n.toFixed(10)).toString();
  return parseFloat(n.toPrecision(10)).toString();
}

function resolveToken(
  tokens: Token[],
  preferSymbol: string | undefined,
  fallbackIndex: number,
): Token | null {
  if (tokens.length === 0) return null;
  const found = preferSymbol ? tokens.find((t) => t.symbol === preferSymbol) : undefined;
  return found ?? tokens[Math.min(fallbackIndex, tokens.length - 1)];
}

export default function SwapCard({ tokens, onReload }: SwapCardProps) {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [inputSide, setInputSide] = useState<'pay' | 'receive'>('pay');
  const [status, setStatus] = useState<SwapStatus>('idle');
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [flipped, setFlipped] = useState(false);

  const timer1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer1.current) clearTimeout(timer1.current);
      if (timer2.current) clearTimeout(timer2.current);
    };
  }, []);

  useEffect(() => {
    if (tokens.length === 0) return;
    setFromToken((prev) => resolveToken(tokens, prev?.symbol ?? DEFAULT_FROM, 0));
    setToToken((prev) => {
      const candidate = resolveToken(tokens, prev?.symbol ?? DEFAULT_TO, 1);
      return candidate;
    });
  }, [tokens]);

  const rate = useMemo(() => {
    if (!fromToken || !toToken || toToken.price <= 0) return 0;
    return fromToken.price / toToken.price;
  }, [fromToken, toToken]);

  const payDisplay = useMemo((): string => {
    if (inputSide === 'pay') return amount;
    const parsed = parseAmount(amount);
    if (!Number.isFinite(parsed) || parsed <= 0 || rate <= 0) return '';
    return formatAmount(parsed / rate);
  }, [inputSide, amount, rate]);

  const receiveDisplay = useMemo((): string => {
    if (inputSide === 'receive') return amount;
    const parsed = parseAmount(amount);
    if (!Number.isFinite(parsed) || parsed <= 0 || rate <= 0) return '';
    return formatAmount(parsed * rate);
  }, [inputSide, amount, rate]);

  const payUsd = useMemo((): number => {
    if (!fromToken) return 0;
    const n = parseAmount(payDisplay);
    return Number.isFinite(n) && n > 0 ? n * fromToken.price : 0;
  }, [fromToken, payDisplay]);

  const receiveUsd = useMemo((): number => {
    if (!toToken) return 0;
    const n = parseAmount(receiveDisplay);
    return Number.isFinite(n) && n > 0 ? n * toToken.price : 0;
  }, [toToken, receiveDisplay]);

  const validation = useMemo(() => {
    if (!fromToken || !toToken) {
      return { valid: false, message: 'Select a token', insufficientBalance: false };
    }
    if (fromToken.symbol === toToken.symbol) {
      return { valid: false, message: 'Select two different tokens', insufficientBalance: false };
    }
    const raw = amount.trim();
    if (!raw) {
      return { valid: false, message: 'Enter an amount', insufficientBalance: false };
    }
    const parsed = parseAmount(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return { valid: false, message: 'Enter a valid amount', insufficientBalance: false };
    }
    const payNum =
      inputSide === 'pay' ? parsed : parsed * (toToken.price / fromToken.price);
    if (payNum > fromToken.balance) {
      return {
        valid: false,
        message: `Insufficient ${fromToken.symbol} balance`,
        insufficientBalance: true,
      };
    }
    return { valid: true, message: '', insufficientBalance: false };
  }, [fromToken, toToken, amount, inputSide]);

  const buttonLabel = useMemo((): string => {
    if (status === 'swapping') return 'Swapping…';
    if (status === 'success') return 'Swap successful';
    if (!validation.valid) return validation.message;
    return `Swap ${fromToken?.symbol ?? ''} for ${toToken?.symbol ?? ''}`;
  }, [status, validation, fromToken, toToken]);

  const handlePayChange = useCallback((value: string) => {
    setAmount((prev) => sanitizeAmount(value, prev));
    setInputSide('pay');
  }, []);

  const handleReceiveChange = useCallback((value: string) => {
    setAmount((prev) => sanitizeAmount(value, prev));
    setInputSide('receive');
  }, []);

  const handleMax = useCallback(() => {
    if (!fromToken) return;
    const floored = Math.floor(fromToken.balance * 1e6) / 1e6;
    setAmount(toInputStr(floored));
    setInputSide('pay');
  }, [fromToken]);

  const handleFlip = useCallback(() => {
    setFlipped((f) => !f);

    const parsed = parseAmount(amount);
    let newAmount = amount;

    if (inputSide === 'pay' && Number.isFinite(parsed) && parsed > 0 && rate > 0) {
      newAmount = toInputStr(parsed * rate);
    }

    setFromToken(toToken);
    setToToken(fromToken);
    setAmount(newAmount);
    setInputSide('pay');
  }, [amount, inputSide, fromToken, toToken, rate]);

  const handlePayTokenSelect = useCallback(
    (token: Token) => {
      if (token.symbol === toToken?.symbol) {
        setToToken(fromToken);
        setFromToken(token);
      } else {
        setFromToken(token);
      }
    },
    [fromToken, toToken],
  );

  const handleReceiveTokenSelect = useCallback(
    (token: Token) => {
      if (token.symbol === fromToken?.symbol) {
        setFromToken(toToken);
        setToToken(token);
      } else {
        setToToken(token);
      }
    },
    [fromToken, toToken],
  );

  const handleSubmit = useCallback(() => {
    if (!validation.valid || status !== 'idle' || !fromToken || !toToken) return;

    const fAmt = payDisplay || '0';
    const tAmt = receiveDisplay || '0';
    const fSym = fromToken.symbol;
    const tSym = toToken.symbol;

    setStatus('swapping');

    timer1.current = setTimeout(() => {
      setStatus('success');
      setSuccessInfo({ fromAmount: fAmt, fromSymbol: fSym, toAmount: tAmt, toSymbol: tSym });
      setAmount('');

      timer2.current = setTimeout(() => {
        setStatus('idle');
        setSuccessInfo(null);
      }, 2600);
    }, SWAP_SIMULATION_MS);
  }, [validation, status, fromToken, toToken, payDisplay, receiveDisplay]);

  const isDisabled = status === 'swapping' || (!validation.valid && status === 'idle');

  return (
    <div className="swap-card">
      <div className="swap-card__rate">
        <span>
          {fromToken && toToken
            ? `1 ${fromToken.symbol} ≈ ${formatAmount(rate)} ${toToken.symbol}`
            : 'Select tokens to see rate'}
        </span>
        <button
          type="button"
          className="swap-card__refresh"
          onClick={onReload}
          aria-label="Refresh prices"
          title="Refresh prices"
        >
          <Icon name="refresh" size={15} />
        </button>
      </div>

      <div className="swap-card__fields">
        <CurrencyField
          label="You pay"
          token={fromToken}
          value={payDisplay}
          usdValue={payUsd}
          tokens={tokens}
          selectedSymbol={fromToken?.symbol}
          disabledSymbol={toToken?.symbol}
          showMax
          invalid={validation.insufficientBalance}
          onValueChange={handlePayChange}
          onTokenSelect={handlePayTokenSelect}
          onMax={handleMax}
        />

        <button
          type="button"
          className={`swap-card__flip${flipped ? ' swap-card__flip--rotated' : ''}`}
          onClick={handleFlip}
          aria-label="Flip tokens"
          title="Flip tokens"
        >
          <Icon name="swap" size={18} />
        </button>

        <CurrencyField
          label="You receive"
          token={toToken}
          value={receiveDisplay}
          usdValue={receiveUsd}
          tokens={tokens}
          selectedSymbol={toToken?.symbol}
          disabledSymbol={fromToken?.symbol}
          onValueChange={handleReceiveChange}
          onTokenSelect={handleReceiveTokenSelect}
        />
      </div>

      {status === 'idle' && !validation.valid && (
        <p className="swap-card__error" role="status" aria-live="polite">
          {validation.message}
        </p>
      )}

      <button
        type="button"
        className={`swap-card__submit${status === 'success' ? ' swap-card__submit--success' : ''}`}
        onClick={handleSubmit}
        disabled={isDisabled}
        aria-busy={status === 'swapping'}
        aria-live="polite"
      >
        {status === 'swapping' && <Icon name="spinner" size={18} className="spin" />}
        {status === 'success' && <Icon name="check" size={20} />}
        {buttonLabel}
      </button>

      {successInfo && (
        <div className="swap-card__success" role="status" aria-live="polite">
          <Icon name="check" size={22} className="swap-card__success-icon" />
          <div className="swap-card__success-text">
            <strong>Swap successful!</strong>
            <span>
              {successInfo.fromAmount} {successInfo.fromSymbol} &rarr;{' '}
              {successInfo.toAmount} {successInfo.toSymbol}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * refactored.tsx — clean, correct, well-typed version of WalletPage.
 *
 * ASSUMPTIONS / STUBS
 * The following types and hooks are not provided by the challenge; minimal stubs
 * are declared here so the file is internally type-consistent and illustrative.
 * In a real project these would live in their own modules.
 */

import React, { useMemo } from 'react';

// ─── Stubs for external dependencies ─────────────────────────────────────────

/** Supported blockchain identifiers — replaces `any` in the original. */
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {}

// Stub hooks — in practice these come from a wallet SDK / data layer.
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;

interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}
declare const WalletRow: React.FC<WalletRowProps>;

// Stub CSS module — `classes.row` would come from a real CSS module import.
declare const classes: { row: string };

// ─── Domain types ─────────────────────────────────────────────────────────────

interface WalletBalance {
  currency: string;
  amount: number;
  // FIX #3: `blockchain` was used in the original but missing from the interface.
  // Added here with a proper union type instead of `any`.
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// FIX #12: Empty `interface Props extends BoxProps {}` replaced with a type alias.
// An empty interface that only extends another type is a no-op lint warning.
type Props = BoxProps;

// ─── Priority lookup ──────────────────────────────────────────────────────────

// FIX #8 (part 1): Hoisted outside the component so it is never recreated on render.
// FIX #11: Uses a typed Record instead of a switch over `any`.
const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

/**
 * Returns the display priority for a blockchain.
 * Defaults to -99 for any unknown chain.
 */
function getPriority(blockchain: Blockchain): number {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? -99;
}

// ─── Component ────────────────────────────────────────────────────────────────

const WalletPage: React.FC<Props> = (props: Props) => {
  // FIX #13: `children` was destructured but never used — removed.
  const { ...rest } = props;

  const balances = useWalletBalances();
  const prices = usePrices();

  // FIX #7: `prices` was in the dependency array but never used inside the memo.
  // Removed so the memo does not recompute on every price tick.
  //
  // FIX #8 (part 2): Priority is computed once per balance via the decorated-sort
  // pattern (map → sort → map-back), eliminating O(n log n) redundant calls.
  //
  // FIX #1: `lhsPriority` (undefined variable) replaced with `balancePriority`.
  // FIX #2: Filter logic inverted — original kept `amount <= 0`; correct is `amount > 0`.
  // FIX #4: Sort comparator now returns `0` for the equal-priority case.
  const sortedBalances = useMemo((): WalletBalance[] => {
    // Decorate: attach priority to each balance so it is computed exactly once.
    return balances
      .map((balance) => ({
        balance,
        priority: getPriority(balance.blockchain),
      }))
      .filter(({ balance, priority }) =>
        // Keep only chains with a known priority AND a positive balance.
        priority > -99 && balance.amount > 0
      )
      .sort((a, b) => b.priority - a.priority) // descending priority
      .map(({ balance }) => balance);           // undecorate
  }, [balances]); // `prices` removed from deps

  // FIX #9: Memoized so it does not recompute on unrelated renders.
  // FIX #14: `toFixed(2)` — explicit decimal precision instead of bare `toFixed()`.
  const formattedBalances = useMemo(
    (): FormattedWalletBalance[] =>
      sortedBalances.map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(2),
      })),
    [sortedBalances]
  );

  // FIX #5: Rows now map over `formattedBalances` (which has `.formatted`) instead
  //         of `sortedBalances` (which does not). The original `formattedBalances`
  //         was computed but never consumed — dead code. Now it is the source of truth.
  // FIX #6: `usdValue` guarded with `?? 0` to avoid NaN when a price is missing.
  // FIX #9: Memoized to avoid rebuilding the JSX array on every render.
  // FIX #10: Stable key `balance.currency` instead of the array index, so React
  //          reconciliation is correct after reorders or removals.
  const rows = useMemo(
    () =>
      formattedBalances.map((balance: FormattedWalletBalance) => {
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
        return (
          <WalletRow
            className={classes.row}
            key={balance.currency}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        );
      }),
    [formattedBalances, prices]
  );

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;

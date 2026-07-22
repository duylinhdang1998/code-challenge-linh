import { useTokens } from './hooks/useTokens';
import ErrorCard from './components/ErrorCard';
import SwapCard from './components/SwapCard';
import SwapCardSkeleton from './components/SwapCardSkeleton';
import './App.css';

export default function App() {
  const { tokens, loading, error, reload } = useTokens();

  return (
    <>
      <div className='app-bg' aria-hidden>
        <div className='app-bg__orb app-bg__orb--a' />
        <div className='app-bg__orb app-bg__orb--b' />
        <div className='app-bg__orb app-bg__orb--c' />
      </div>

      <div className='app'>
        <header className='app__header'>
          <div className='app__brand'>
            <div className='app__brand-icon' aria-hidden>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                aria-hidden
              >
                <path
                  d='M7 4v13m0 0-3-3m3 3 3-3M17 20V7m0 0-3 3m3-3 3 3'
                  stroke='#fff'
                  strokeWidth='2.2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
            <span className='app__brand-text'>FancySwap</span>
          </div>
          <p className='app__tagline'>
            Swap any token — instantly, with live prices
          </p>
        </header>

        <main className='app__main'>
          {loading && <SwapCardSkeleton />}
          {!loading && error && <ErrorCard message={error} onRetry={reload} />}
          {!loading && !error && <SwapCard tokens={tokens} onReload={reload} />}
        </main>

        <footer className='app__footer'>
          Prices from Switcheo &bull; Demo &mdash; no real transactions
        </footer>
      </div>
    </>
  );
}

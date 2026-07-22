import './SwapCard.css';

export default function SwapCardSkeleton() {
  return (
    <div className="swap-card-skeleton" aria-busy="true" aria-label="Loading swap form">
      <div className="skeleton-line" style={{ width: '55%', height: 14 }} />
      <div className="skeleton-field" />
      <div className="skeleton-field" />
      <div className="skeleton-btn" />
    </div>
  );
}

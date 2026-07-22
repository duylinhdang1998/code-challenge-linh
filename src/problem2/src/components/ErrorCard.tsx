interface ErrorCardProps {
  message: string;
  onRetry: () => void;
}

/** Full-card error state with a retry action. */
export default function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div className="error-card" role="alert">
      <div className="error-card__icon" aria-hidden>!</div>
      <p className="error-card__title">Failed to load prices</p>
      <p className="error-card__message">{message}</p>
      <button type="button" className="error-card__retry" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

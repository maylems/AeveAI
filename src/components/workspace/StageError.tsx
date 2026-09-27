export function StageError({
  stageLabel,
  message,
  onRetry,
}: {
  stageLabel: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="stage-panel stage-panel--error">
      <h2>{stageLabel} couldn&apos;t be generated</h2>
      <p>{message}</p>
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

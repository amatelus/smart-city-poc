'use client';

import styles from './VCReceiver.module.css';

interface VCErrorDisplayProps {
  error: string;
  onReset: () => void;
}

export default function VCErrorDisplay({
  error,
  onReset,
}: VCErrorDisplayProps): React.ReactElement {
  return (
    <div className={styles.errorSection}>
      <strong>エラー:</strong> {error}
      <button onClick={onReset} className={styles.retryButton}>
        最初からやり直し
      </button>
    </div>
  );
}

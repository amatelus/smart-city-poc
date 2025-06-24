'use client';

import type { DtoId } from 'src/schemas/brandedId';
import type { DIDData } from 'src/schemas/did';
import { formatDIDId } from 'src/utils/formatDIDId';
import styles from './VCManager.module.css';

interface VCDIDSelectorProps {
  allDIDs: DIDData[];
  selectedDID: DtoId['did'] | null;
  onDIDSelect: (didId: DtoId['did'] | null) => void;
  onError: (error: string) => void;
}

export default function VCDIDSelector({
  allDIDs,
  selectedDID,
  onDIDSelect,
  onError,
}: VCDIDSelectorProps): React.ReactElement {
  return (
    <div className={styles.section}>
      <div className={styles.didSelection}>
        <label htmlFor="did-select" className={styles.selectLabel}>
          DIDを選択:
        </label>
        <select
          id="did-select"
          value={selectedDID ?? ''}
          onChange={(e) => {
            onDIDSelect(e.target.value as DtoId['did']);
            onError('');
          }}
          className={styles.didSelect}
        >
          {allDIDs.map((did) => (
            <option key={did.doc.id} value={did.doc.id}>
              {formatDIDId(did.doc.id)}
            </option>
          ))}
        </select>
        {allDIDs.length === 0 && (
          <p className={styles.noDIDs}>
            利用可能なDIDがありません。DID管理画面でDIDを作成してください。
          </p>
        )}
        {!selectedDID && allDIDs.length > 0 && (
          <p className={styles.selectPrompt}>VCを管理するDIDを選択してください。</p>
        )}
      </div>
    </div>
  );
}

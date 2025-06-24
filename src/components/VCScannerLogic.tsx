'use client';

import { sha3_256 } from 'js-sha3';
import { VCDtoSchema, VCMetadataSchema, VCPartSchema, type VCMetadata } from 'src/schemas/vc';
import { safeJsonParse } from 'src/utils/safeJsonParse';
import { saveVCToStorage } from 'src/utils/vc';

interface VCScannerLogicProps {
  vcMetadata: VCMetadata | null;
  vcParts: Map<number, string>;
  onMetadataSet: (metadata: VCMetadata) => void;
  onPartAdded: (parts: Map<number, string>) => void;
  onProgressUpdate: (current: number, total: number) => void;
  onError: (error: string) => void;
  onCompleted: () => void;
}

export const useVCScannerLogic = ({
  vcMetadata,
  vcParts,
  onMetadataSet,
  onPartAdded,
  onProgressUpdate,
  onError,
  onCompleted,
}: VCScannerLogicProps): {
  handleMetadataScan: (result: string) => void;
  handlePartScan: (result: string) => void;
  getMissingParts: () => number[];
} => {
  const handleMetadataScan = (result: string): void => {
    const metadata = VCMetadataSchema.safeParse(safeJsonParse(result)).data;

    if (!metadata) {
      onError('無効なVC メタデータです。');
      return;
    }

    onMetadataSet(metadata);
    onProgressUpdate(0, metadata.totalParts);
  };

  const handlePartScan = (result: string): void => {
    if (!vcMetadata) {
      onError('VC メタデータが読み取られていません。');
      return;
    }

    const partData = VCPartSchema.safeParse(safeJsonParse(result)).data;

    if (!partData) {
      onError('無効なVCパーツデータです。形式は [index, data] である必要があります。');
      return;
    }

    const [index, data] = partData;

    if (index >= vcMetadata.totalParts) {
      onError(`無効なパーツインデックスです。有効範囲: 0-${vcMetadata.totalParts - 1}`);
      return;
    }

    const newParts = new Map(vcParts);
    newParts.set(index, data);
    onPartAdded(newParts);
    onProgressUpdate(newParts.size, vcMetadata.totalParts);

    if (newParts.size === vcMetadata.totalParts) {
      reconstructVC(newParts, vcMetadata);
    }
  };

  const reconstructVC = (parts: Map<number, string>, metadata: VCMetadata): void => {
    const emptyIndexList = Array.from({ length: metadata.totalParts })
      .map((_, i) => (parts.get(i) === undefined ? i : null))
      .filter((i) => i !== null);

    if (emptyIndexList.length > 0) {
      onError(`パーツ ${emptyIndexList.join(', ')} が見つかりません。`);
      return;
    }

    const sortedParts = Array.from({ length: metadata.totalParts }).map((_, i) => parts.get(i));
    const reconstructedVCString = sortedParts.join('');
    const computedHash = sha3_256(reconstructedVCString);

    if (computedHash !== metadata.hash) {
      onError('VCの整合性チェックに失敗しました。ハッシュが一致しません。');
      return;
    }

    const vcData = VCDtoSchema.safeParse(safeJsonParse(reconstructedVCString)).data;

    if (!vcData) {
      onError('再構築されたVCが無効です。');
      return;
    }

    saveVCToStorage({ title: '受信VC', data: vcData });
    onCompleted();
  };

  const getMissingParts = (): number[] => {
    if (!vcMetadata) return [];
    const missing: number[] = [];
    for (let i = 0; i < vcMetadata.totalParts; i++) {
      if (!vcParts.has(i)) {
        missing.push(i);
      }
    }
    return missing;
  };

  return { handleMetadataScan, handlePartScan, getMissingParts };
};

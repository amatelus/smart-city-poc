'use client';

import { useEffect, useState } from 'react';
import type { DtoId } from 'src/schemas/brandedId';
import { loadDIDFromStorage } from 'src/utils/did';
import { loadVCsFromStorage, type VCStorage } from 'src/utils/vc';
import type { ZKPProof } from 'src/utils/zkp';
import { generateAgeProofZKP } from 'src/utils/zkp';

export const useZKPGenerator = (): {
  selectedVCId: DtoId['vc'] | null;
  nonce: string;
  isGenerating: boolean;
  zkpResult: { proof: ZKPProof; generationTime: number } | null;
  error: string;
  showQR: boolean;
  residenceVCs: VCStorage[];
  setSelectedVCId: (id: DtoId['vc']) => void;
  setNonce: (value: string) => void;
  generateZKP: () => Promise<void>;
  showQRCode: () => void;
  closeQR: () => void;
  resetForm: () => void;
} => {
  const [selectedVCId, setSelectedVCId] = useState<DtoId['vc'] | null>(null);
  const [nonce, setNonce] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [zkpResult, setZkpResult] = useState<{ proof: ZKPProof; generationTime: number } | null>(
    null,
  );
  const [error, setError] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [vcs, setVCs] = useState<VCStorage[]>([]);

  const residenceVCs = vcs.filter(
    (vc) => vc.data.type.includes('ResidentCredential') && vc.data.credentialSubject.birthDate,
  );

  useEffect(() => {
    setVCs(loadVCsFromStorage());
  }, []);

  const generateZKP = async (): Promise<void> => {
    setError('');

    if (!nonce) {
      setError('チャレンジ文字列（Nonce）を入力してください。');
      return;
    }

    const didData = loadDIDFromStorage();
    if (!didData) {
      setError('DIDが生成されていません。');
      return;
    }

    const selectedVC = vcs.find((vc) => vc.data.id === selectedVCId);
    if (!selectedVC) {
      setError('選択されたVCが見つかりません。');
      return;
    }

    const birthDate = selectedVC.data.credentialSubject.birthDate as string;
    if (!birthDate) {
      setError('選択されたVCに生年月日が含まれていません。');
      return;
    }

    setIsGenerating(true);

    await generateAgeProofZKP(birthDate, nonce, didData.doc.id)
      .then(setZkpResult)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'ZKP生成中にエラーが発生しました。'),
      );

    setIsGenerating(false);
  };

  const showQRCode = (): void => {
    setShowQR(true);
  };

  const closeQR = (): void => {
    setShowQR(false);
  };

  const resetForm = (): void => {
    setSelectedVCId(null);
    setNonce('');
    setZkpResult(null);
    setError('');
    setShowQR(false);
  };

  return {
    selectedVCId,
    nonce,
    isGenerating,
    zkpResult,
    error,
    showQR,
    residenceVCs,
    setSelectedVCId,
    setNonce,
    generateZKP,
    showQRCode,
    closeQR,
    resetForm,
  };
};

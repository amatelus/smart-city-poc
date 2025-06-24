'use client';

import { useEffect, useState } from 'react';
import type { DtoId } from 'src/schemas/brandedId';
import type { DIDData } from 'src/schemas/did';
import type { ZKPProof } from 'src/schemas/zkp';
import { loadAllDIDsFromStorage } from 'src/utils/did';
import { loadVCsFromStorage, type VCStorage } from 'src/utils/vc';
import { combineZKPWithChallenge, generateZKPBaseProof } from 'src/utils/zkp';

export const useZKPGenerator = (): {
  selectedDID: DtoId['did'] | null;
  selectedVCId: DtoId['vc'] | null;
  challenge: string;
  verifierDID: DtoId['did'] | null;
  isGenerating: boolean;
  zkpResult: { proof: ZKPProof; generationTime: number } | null;
  error: string;
  showQR: boolean;
  allDIDs: DIDData[];
  residenceVCs: VCStorage[];
  setSelectedDID: (id: DtoId['did'] | null) => void;
  setSelectedVCId: (id: DtoId['vc']) => void;
  setChallenge: (value: string) => void;
  setVerifierDID: (value: DtoId['did']) => void;
  generateZKP: () => Promise<void>;
  showQRCode: () => void;
  closeQR: () => void;
  resetForm: () => void;
} => {
  const [selectedDID, setSelectedDID] = useState<DtoId['did'] | null>(null);
  const [selectedVCId, setSelectedVCId] = useState<DtoId['vc'] | null>(null);
  const [challenge, setChallenge] = useState<string>('');
  const [verifierDID, setVerifierDID] = useState<DtoId['did'] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zkpResult, setZkpResult] = useState<{ proof: ZKPProof; generationTime: number } | null>(
    null,
  );
  const [error, setError] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [allDIDs, setAllDIDs] = useState<DIDData[]>([]);
  const [vcs, setVCs] = useState<VCStorage[]>([]);

  const residenceVCs = vcs.filter(
    (vc) => vc.data.type.includes('ResidentCredential') && vc.data.credentialSubject.birthDate,
  );

  useEffect(() => {
    const dids = loadAllDIDsFromStorage();

    if (dids.length === 0) return;

    setAllDIDs(dids);
    setSelectedDID(dids[0].doc.id);
  }, []);

  useEffect(() => {
    setVCs(selectedDID ? loadVCsFromStorage(selectedDID) : []);

    setSelectedVCId(null);
  }, [selectedDID]);

  const generateZKP = async (): Promise<void> => {
    setError('');

    if (!selectedDID) {
      setError('DIDを選択してください。');
      return;
    }

    if (!verifierDID) {
      setError('検証者のDIDを入力してください。');
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

    // Phase 1: 事前生成ZKPを作成
    await generateZKPBaseProof(birthDate, selectedDID)
      .then((baseResult) => {
        // Phase 2: challengeと組み合わせて完全なZKPを作成
        const combinedProof = combineZKPWithChallenge(baseResult.proof, challenge, verifierDID);

        setZkpResult({ proof: combinedProof, generationTime: baseResult.generationTime });
      })
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
    setSelectedDID(null);
    setSelectedVCId(null);
    setChallenge('');
    setVerifierDID(null);
    setZkpResult(null);
    setError('');
    setShowQR(false);
  };

  return {
    selectedDID,
    selectedVCId,
    challenge,
    verifierDID,
    isGenerating,
    zkpResult,
    error,
    showQR,
    allDIDs,
    residenceVCs,
    setSelectedDID,
    setSelectedVCId,
    setChallenge,
    setVerifierDID,
    generateZKP,
    showQRCode,
    closeQR,
    resetForm,
  };
};

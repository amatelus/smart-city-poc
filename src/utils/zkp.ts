import { sha3_256 } from 'js-sha3';
import type { DtoId } from 'src/schemas/brandedId';
import type { ZKPBaseProof, ZKPGenerationResult, ZKPProof } from 'src/schemas/zkp';

const simulateComputationDelay = async (complexity: number): Promise<void> => {
  const baseDelay = 1000;
  const delay = baseDelay + Math.random() * complexity * 100;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

const calculateAge = (birthDate: string, currentDate: string): number => {
  const birth = new Date(birthDate);
  const current = new Date(currentDate);
  const ageDiff = current.getTime() - birth.getTime();
  const ageDate = new Date(ageDiff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Phase 1: 事前準備 - VCからベースZKPを生成（複数検証者で再利用可能）
export const generateZKPBaseProof = async (
  birthDate: string,
  proverDID: DtoId['did'],
): Promise<ZKPGenerationResult> => {
  const startTime = performance.now();
  const currentDate = new Date().toISOString().split('T')[0];
  const age = calculateAge(birthDate, currentDate);

  if (age < 20) {
    throw new Error('年齢が20歳未満のため、ZKP証明を生成できません。');
  }

  await simulateComputationDelay(20);

  // 事前生成でベースZKPを作成（実際のZKPでは回路計算）
  const nullifierSecret = sha3_256(`nullifier_secret_${proverDID}_${Date.now()}`);
  const merkleProof = sha3_256(`merkle_proof_${proverDID}_${Date.now()}`);
  const zkpProof = sha3_256(`zkp_proof_${birthDate}_${proverDID}_${Date.now()}`);

  const currentTimestamp = Date.now();
  const expiresAt = new Date(currentTimestamp + 24 * 60 * 60 * 1000).toISOString(); // 24時間後

  const endTime = performance.now();
  const generationTime = endTime - startTime;

  return {
    proof: {
      version: 1,
      proofType: 'age_over_20',
      nullifierSecret,
      merkleProof,
      proof: zkpProof,
      publicInputs: {
        ageThreshold: 20,
        currentTimestamp,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        proverDID,
        expiresAt,
      },
    },
    generationTime,
  };
};

// Phase 2: 検証時 - 事前生成ZKPにchallengeを組み合わせて完全なZKPを作成
export const combineZKPWithChallenge = (
  baseProof: ZKPBaseProof,
  challenge: string,
  verifierDID: DtoId['did'],
): ZKPProof => {
  // challengeとnullifierSecretからnullifier hashを生成（リプレイ攻撃防止）
  const nullifierHash = sha3_256(`${baseProof.nullifierSecret}_${challenge}_${verifierDID}`);

  return {
    baseProof,
    challenge,
    nullifierHash,
    verifierInfo: {
      verifierDID,
      challengeTimestamp: Date.now(),
    },
  };
};

export const formatZKPForQR = (zkpProof: ZKPProof): string => {
  const qrData = {
    v: zkpProof.baseProof.version,
    type: zkpProof.baseProof.proofType,
    nullifier: zkpProof.nullifierHash,
    merkle: zkpProof.baseProof.merkleProof,
    challenge: zkpProof.challenge,
    proof: zkpProof.baseProof.proof,
    inputs: zkpProof.baseProof.publicInputs,
    meta: {
      ts: zkpProof.baseProof.metadata.generatedAt,
      prover: zkpProof.baseProof.metadata.proverDID,
      expires: zkpProof.baseProof.metadata.expiresAt,
    },
  };

  return JSON.stringify(qrData);
};

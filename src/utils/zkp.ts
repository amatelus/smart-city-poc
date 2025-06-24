import { sha3_256 } from 'js-sha3';
import type { DtoId } from 'src/schemas/brandedId';

export interface ZKPProof {
  version: number;
  proofType: 'age_over_20';
  nonce: string;
  proof: string;
  publicInputs: {
    currentDate: string;
    minAge: number;
    nonce: string;
  };
  metadata: {
    generatedAt: string;
    did: string;
  };
}

export interface ZKPGenerationResult {
  proof: ZKPProof;
  generationTime: number;
}

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

const generateMockProof = (
  birthDate: string,
  currentDate: string,
  nonce: string,
  did: string,
): string => {
  const proofInputs = {
    birthDateHash: sha3_256(birthDate),
    currentDate,
    nonce,
    did,
    timestamp: Date.now(),
  };

  return sha3_256(JSON.stringify(proofInputs));
};

export const generateAgeProofZKP = async (
  birthDate: string,
  nonce: string,
  did: DtoId['did'],
): Promise<ZKPGenerationResult> => {
  const startTime = performance.now();

  const currentDate = new Date().toISOString().split('T')[0];
  const age = calculateAge(birthDate, currentDate);

  if (age < 20) {
    throw new Error('年齢が20歳未満のため、証明を生成できません。');
  }

  await simulateComputationDelay(20);

  const proof = generateMockProof(birthDate, currentDate, nonce, did);

  const zkpProof: ZKPProof = {
    version: 1,
    proofType: 'age_over_20',
    nonce,
    proof,
    publicInputs: {
      currentDate,
      minAge: 20,
      nonce,
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      did,
    },
  };

  const endTime = performance.now();
  const generationTime = endTime - startTime;

  return {
    proof: zkpProof,
    generationTime,
  };
};

export const formatZKPForQR = (zkpProof: ZKPProof): string => {
  const qrData = {
    v: zkpProof.version,
    type: zkpProof.proofType,
    proof: zkpProof.proof,
    inputs: zkpProof.publicInputs,
    meta: {
      ts: zkpProof.metadata.generatedAt,
      did: zkpProof.metadata.did,
    },
  };

  return JSON.stringify(qrData);
};

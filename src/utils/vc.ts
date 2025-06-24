import { randomUUID } from 'crypto';
import type { DtoId } from 'src/schemas/brandedId';
import { brandedId } from 'src/schemas/brandedId';
import type { VCDto, VCStorage } from 'src/schemas/vc';
import { VCStorageSchema } from 'src/schemas/vc';
import { z } from 'zod/v4';
import { safeJsonParse } from './safeJsonParse';
export type { VCStorage };

const STORAGE_KEY = 'amatelus-vcs-by-did';

export const saveVCToStorage = (vc: VCStorage): void => {
  const targetDID = vc.data.credentialSubject.id;
  const allVCsByDID = loadAllVCsByDIDFromStorage();

  if (!allVCsByDID[targetDID]) {
    allVCsByDID[targetDID] = [];
  }

  const existingIndex = allVCsByDID[targetDID].findIndex(
    (existingVC) => existingVC.data.id === vc.data.id,
  );

  if (existingIndex >= 0) {
    allVCsByDID[targetDID][existingIndex] = vc;
  } else {
    allVCsByDID[targetDID].push(vc);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(allVCsByDID));
};

export const loadAllVCsByDIDFromStorage = (): Record<DtoId['did'], VCStorage[] | undefined> => {
  return (
    z
      .record(z.string(), z.array(VCStorageSchema))
      .safeParse(safeJsonParse(localStorage.getItem(STORAGE_KEY))).data ?? {}
  );
};

export const loadVCsFromStorage = (didId: DtoId['did']): VCStorage[] => {
  return loadAllVCsByDIDFromStorage()[didId] || [];
};

export const removeVCFromStorage = (id: DtoId['vc']): void => {
  const allVCsByDID = loadAllVCsByDIDFromStorage();

  for (const [did, vcs] of Object.entries(allVCsByDID)) {
    allVCsByDID[brandedId.did.dto.parse(did)] = vcs?.filter((vc) => vc.data.id !== id);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(allVCsByDID));
};

export const createSampleResidentVC = (holderDid: DtoId['did']): VCDto => {
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/security/data-integrity/v1',
      'https://w3id.org/security/suites/eddsa-2022/v1',
    ],
    id: brandedId.vc.dto.parse(`urn:uuid:${randomUUID()}`),
    type: ['VerifiableCredential', 'ResidentCredential'],
    issuer: brandedId.did.dto.parse('did:amatelus:local-government-sample'),
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: holderDid,
      name: 'サンプル 太郎',
      birthDate: '1990-05-15',
      address: '東京都渋谷区1-1-1',
      nationality: 'JP',
      residenceStatus: 'resident',
    },
    proof: {
      type: 'DataIntegrityProof',
      cryptosuite: 'eddsa-rdfc-2022',
      created: new Date().toISOString(),
      verificationMethod: '#key-1',
      proofPurpose: 'assertionMethod',
      jws: 'samplejws',
    },
  };
};

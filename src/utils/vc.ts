import { randomUUID } from 'crypto';
import type { DtoId } from 'src/schemas/brandedId';
import { brandedId } from 'src/schemas/brandedId';
import type { VCDto, VCStorage } from 'src/schemas/vc';
import { VCStorageSchema } from 'src/schemas/vc';
import { z } from 'zod/v4';

export const saveVCToStorage = (vc: VCStorage): void => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('amatelus-vcs');
    const vcs = stored ? (z.array(VCStorageSchema).safeParse(JSON.parse(stored)).data ?? []) : [];

    vcs.push(vc);

    localStorage.setItem('amatelus-vcs', JSON.stringify(vcs));
  }
};

export const loadVCsFromStorage = (): VCStorage[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('amatelus-vcs');
    if (stored) {
      return z.array(VCStorageSchema).safeParse(JSON.parse(stored)).data ?? [];
    }
  }
  return [];
};

export const removeVCFromStorage = (id: DtoId['vc']): void => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('amatelus-vcs');
    if (stored) {
      const vcs = z.array(VCStorageSchema).safeParse(JSON.parse(stored)).data ?? [];
      const filtered = vcs.filter((vc) => vc.data.id !== id);
      localStorage.setItem('amatelus-vcs', JSON.stringify(filtered));
    }
  }
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

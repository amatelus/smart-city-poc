import { sha3_512 } from 'js-sha3';
import { brandedId } from 'src/schemas/brandedId';
import { DIDDataSchema, type DIDData, type DIDDocTemplate1 } from 'src/schemas/did';
import nacl from 'tweetnacl';
import { z } from 'zod/v4';
import { safeJsonParse } from './safeJsonParse';

const STORAGE_KEY = 'amatelus-dids';

export const generateDID = (): DIDData => {
  const keyPair = nacl.sign.keyPair();
  const privateKey = Buffer.from(keyPair.secretKey).toString('base64');
  const publicKey = Buffer.from(keyPair.publicKey).toString('base64');

  const tempDidDocument: DIDDocTemplate1 = {
    '@context': ['https://www.w3.org/ns/did/v1'],
    verificationMethod: [
      { type: 'Ed25519VerificationKey2020', publicKeyMultibase: `z${publicKey}` },
    ],
    authentication: ['#key-1'],
    assertionMethod: ['#key-1'],
  };

  const hash = sha3_512(JSON.stringify(tempDidDocument));
  const did = brandedId.did.dto.parse(`did:amatelus:${hash}`);

  return {
    privateKey,
    publicKey,
    doc: {
      ...tempDidDocument,
      id: did,
      verificationMethod: [
        { ...tempDidDocument.verificationMethod[0], id: `${did}#key-1`, controller: did },
      ],
    },
  };
};

export const saveDIDToStorage = (didData: DIDData): void => {
  const storedDIDs = loadAllDIDsFromStorage();
  const updatedDIDs = [...storedDIDs.filter((d) => d.doc.id !== didData.doc.id), didData];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDIDs));
};

export const loadAllDIDsFromStorage = (): DIDData[] => {
  return (
    z.array(DIDDataSchema).safeParse(safeJsonParse(localStorage.getItem(STORAGE_KEY))).data ?? []
  );
};

export const removeDIDFromStorage = (didId: string): void => {
  const storedDIDs = loadAllDIDsFromStorage();
  const filteredDIDs = storedDIDs.filter((did) => did.doc.id !== didId);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDIDs));
};

export const signMessage = (message: string, privateKey: string): string => {
  const messageBytes = new TextEncoder().encode(message);
  const privateKeyBytes = Buffer.from(privateKey, 'base64');
  const signature = nacl.sign.detached(messageBytes, privateKeyBytes);
  return Buffer.from(signature).toString('base64');
};

export const verifySignature = (message: string, signature: string, publicKey: string): boolean => {
  const messageBytes = new TextEncoder().encode(message);
  const signatureBytes = Buffer.from(signature, 'base64');
  const publicKeyBytes = Buffer.from(publicKey, 'base64');
  return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
};

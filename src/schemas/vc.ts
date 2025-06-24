import { z } from 'zod/v4';
import { brandedId } from './brandedId';

export const VCDtoSchema = z
  .object({
    '@context': z
      .tuple([
        z.literal('https://www.w3.org/2018/credentials/v1'),
        z.literal('https://w3id.org/security/data-integrity/v1'),
        z.literal('https://w3id.org/security/suites/eddsa-2022/v1'),
      ])
      .rest(z.url())
      .readonly(),
    id: brandedId.vc.dto,
    type: z
      .tuple([z.literal('VerifiableCredential'), z.string()])
      .rest(z.string())
      .readonly(),
    issuer: brandedId.did.dto,
    issuanceDate: z.string(),
    credentialSubject: z
      .object({ id: brandedId.did.dto })
      .readonly()
      .and(z.record(z.string(), z.any()).readonly()),
    proof: z
      .object({
        type: z.literal('DataIntegrityProof'),
        cryptosuite: z.literal('eddsa-rdfc-2022'),
        created: z.string(),
        verificationMethod: z.literal('#key-1'),
        proofPurpose: z.literal('assertionMethod'),
        jws: z.string(),
      })
      .readonly(),
  })
  .readonly();

export type VCDto = z.infer<typeof VCDtoSchema>;

export const VCStorageSchema = z.object({ title: z.string(), data: VCDtoSchema }).readonly();

export type VCStorage = z.infer<typeof VCStorageSchema>;

export const VCMetadataSchema = z
  .object({ totalParts: z.number().int().positive(), hash: z.string() })
  .readonly();

export type VCMetadata = z.infer<typeof VCMetadataSchema>;

export const VCPartSchema = z.tuple([z.number().int().nonnegative(), z.string()]);

export type VCPart = z.infer<typeof VCPartSchema>;

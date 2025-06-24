import { z } from 'zod/v4';
import { brandedId } from './brandedId';

export const DIDDocTemplate1Schema = z
  .object({
    '@context': z.tuple([z.literal('https://www.w3.org/ns/did/v1')]).readonly(),
    verificationMethod: z
      .tuple([
        z
          .object({
            type: z.literal('Ed25519VerificationKey2020'),
            publicKeyMultibase: z.templateLiteral(['z', z.string()]),
          })
          .readonly(),
      ])
      .readonly(),
    authentication: z.tuple([z.literal('#key-1')]).readonly(),
    assertionMethod: z.tuple([z.literal('#key-1')]).readonly(),
  })
  .readonly();

export type DIDDocTemplate1 = z.infer<typeof DIDDocTemplate1Schema>;

export const DIDDocDtoSchema = z
  .object({
    '@context': z.tuple([z.literal('https://www.w3.org/ns/did/v1')]).readonly(),
    id: brandedId.did.dto,
    verificationMethod: z
      .tuple([
        z
          .object({
            id: z.templateLiteral([z.string(), '#key-1']),
            type: z.literal('Ed25519VerificationKey2020'),
            controller: brandedId.did.dto,
            publicKeyMultibase: z.templateLiteral(['z', z.string()]),
          })
          .readonly(),
      ])
      .readonly(),
    authentication: z.tuple([z.literal('#key-1')]).readonly(),
    assertionMethod: z.tuple([z.literal('#key-1')]).readonly(),
  })
  .readonly();

export type DIDDocDto = z.infer<typeof DIDDocDtoSchema>;

export const DIDDataSchema = z
  .object({ privateKey: z.string(), publicKey: z.string(), doc: DIDDocDtoSchema })
  .readonly();

export type DIDData = z.infer<typeof DIDDataSchema>;

import { z } from 'zod/v4';
import { brandedId } from './brandedId';

export const ZKPProofSchema = z
  .object({
    version: z.number().int().positive(),
    proofType: z.enum(['age_over_20']),
    nonce: z.string(),
    proof: z.string(),
    publicInputs: z
      .object({
        currentDate: z.string(),
        minAge: z.number().int().nonnegative(),
        nonce: z.string(),
      })
      .readonly(),
    metadata: z.object({ generatedAt: z.string(), did: brandedId.did.dto }).readonly(),
  })
  .readonly();

export type ZKPProof = z.infer<typeof ZKPProofSchema>;

export const ZKPGenerationResultSchema = z
  .object({ proof: ZKPProofSchema, generationTime: z.number() })
  .readonly();

export type ZKPGenerationResult = z.infer<typeof ZKPGenerationResultSchema>;

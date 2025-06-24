import { z } from 'zod/v4';
import { brandedId } from './brandedId';

export const ZKPBaseProofSchema = z
  .object({
    version: z.number().int().positive(),
    proofType: z.enum(['age_over_20']),
    nullifierSecret: z.string(),
    merkleProof: z.string(),
    proof: z.string(), // 実際のZKP証明データ
    publicInputs: z
      .object({
        ageThreshold: z.number().int().positive(),
        currentTimestamp: z.number().int().positive(),
      })
      .readonly(),
    metadata: z
      .object({
        generatedAt: z.string(),
        proverDID: brandedId.did.dto, // 証明者のDID
        expiresAt: z.string(), // 証明の有効期限
      })
      .readonly(),
  })
  .readonly();

export type ZKPBaseProof = z.infer<typeof ZKPBaseProofSchema>;

// 検証時に使用される完全なZKP（BaseProof + Nonce組み合わせ）
export const ZKPProofSchema = z
  .object({
    baseProof: ZKPBaseProofSchema,
    challenge: z.string(), // 検証者からのchallenge（Nonce）
    nullifierHash: z.string(), // challenge + nullifierSecretから生成
    verifierInfo: z
      .object({
        verifierDID: brandedId.did.dto,
        challengeTimestamp: z.number().int().positive(),
      })
      .readonly(),
  })
  .readonly();

export type ZKPProof = z.infer<typeof ZKPProofSchema>;

export const ZKPGenerationResultSchema = z
  .object({ proof: ZKPBaseProofSchema, generationTime: z.number() })
  .readonly();

export type ZKPGenerationResult = z.infer<typeof ZKPGenerationResultSchema>;

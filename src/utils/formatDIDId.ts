import type { DtoId } from 'src/schemas/brandedId';

export const formatDIDId = (didId: DtoId['did']): string => {
  return `...${didId.slice(-8)}`;
};

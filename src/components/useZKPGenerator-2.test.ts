import { renderHook } from '@testing-library/react';
import { generateDID, saveDIDToStorage } from 'src/utils/did';
import { createSampleResidentVC, saveVCToStorage } from 'src/utils/vc';
import { beforeAll, expect, it } from 'vitest';
import { useZKPGenerator } from './useZKPGenerator';

const testHolderDid = generateDID();
const sampleVC = createSampleResidentVC(testHolderDid.doc.id);

beforeAll(() => {
  saveDIDToStorage(testHolderDid);
  saveVCToStorage({ title: 'Test VC', data: sampleVC });
});

it('should filter residenceVCs correctly', () => {
  const { result } = renderHook(() => useZKPGenerator());

  expect(result.current.residenceVCs).toHaveLength(1);
  expect(result.current.residenceVCs[0].title).toBe('Test VC');
});

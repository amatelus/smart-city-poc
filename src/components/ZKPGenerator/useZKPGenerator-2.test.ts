import { act, renderHook } from '@testing-library/react';
import { generateDID, saveDIDToStorage } from 'src/utils/did';
import { createSampleResidentVC, saveVCToStorage } from 'src/utils/vc';
import { beforeEach, expect, it } from 'vitest';
import { useZKPGenerator } from './useZKPGenerator';

const testHolderDid = generateDID();
const sampleVC = createSampleResidentVC(testHolderDid.doc.id);

beforeEach(() => {
  localStorage.clear();
  saveDIDToStorage(testHolderDid);
  saveVCToStorage({ title: 'Test VC', data: sampleVC });
});

it('residenceVCが正しくフィルタリングされる', () => {
  const { result } = renderHook(() => useZKPGenerator());

  expect(result.current.residenceVCs).toHaveLength(1);
  expect(result.current.residenceVCs[0].title).toBe('Test VC');
});

it('未成年のZKP生成エラーが処理される', async () => {
  const today = new Date();
  const underageBirthDate = new Date(today.getFullYear() - 19, today.getMonth(), today.getDate());
  const underageVC = createSampleResidentVC(testHolderDid.doc.id);
  const modifiedVC = {
    ...underageVC,
    credentialSubject: {
      ...underageVC.credentialSubject,
      birthDate: underageBirthDate.toISOString().split('T')[0],
    },
  };

  localStorage.clear();
  saveDIDToStorage(testHolderDid);
  saveVCToStorage({ title: 'Underage VC', data: modifiedVC });

  const { result } = renderHook(() => useZKPGenerator());

  act(() => {
    result.current.setSelectedDID(testHolderDid.doc.id);
  });

  act(() => {
    const availableVC = result.current.residenceVCs.find((vc) => vc.data.id === modifiedVC.id)!;
    result.current.setSelectedVCId(availableVC.data.id);
    result.current.setNonce('test-nonce');
  });

  await act(async () => {
    await result.current.generateZKP();
  });

  expect(result.current.error).toBe('年齢が20歳未満のため、証明を生成できません。');
  expect(result.current.zkpResult).toBeNull();
  expect(result.current.isGenerating).toBe(false);
});

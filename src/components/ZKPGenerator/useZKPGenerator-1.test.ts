import { act, renderHook } from '@testing-library/react';
import type { DtoId } from 'src/schemas/brandedId';
import { brandedId } from 'src/schemas/brandedId';
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

it('デフォルト値で初期化される', () => {
  const { result } = renderHook(() => useZKPGenerator());

  expect(result.current.selectedDID).toBe(testHolderDid.doc.id);
  expect(result.current.selectedVCId).toBeNull();
  expect(result.current.challenge).toBe('');
  expect(result.current.isGenerating).toBe(false);
  expect(result.current.zkpResult).toBeNull();
  expect(result.current.error).toBe('');
  expect(result.current.showQR).toBe(false);
  expect(result.current.allDIDs).toHaveLength(1);
  expect(result.current.residenceVCs).toHaveLength(1);
});

it('selectedDIDとselectedVCIdが更新される', () => {
  const { result } = renderHook(() => useZKPGenerator());

  act(() => {
    result.current.setSelectedDID(testHolderDid.doc.id);
  });

  expect(result.current.selectedDID).toBe(testHolderDid.doc.id);
  expect(result.current.residenceVCs).toHaveLength(1);

  act(() => {
    result.current.setSelectedVCId(sampleVC.id);
  });

  expect(result.current.selectedVCId).toBe(sampleVC.id);
});

it('challengeが更新される', () => {
  const { result } = renderHook(() => useZKPGenerator());

  act(() => {
    result.current.setChallenge('test-challenge');
  });

  expect(result.current.challenge).toBe('test-challenge');
});

it('QRコードを表示して閉じることができる', () => {
  const { result } = renderHook(() => useZKPGenerator());

  act(() => {
    result.current.showQRCode();
  });

  expect(result.current.showQR).toBe(true);

  act(() => {
    result.current.closeQR();
  });

  expect(result.current.showQR).toBe(false);
});

it('フォームがリセットされる', () => {
  const { result } = renderHook(() => useZKPGenerator());

  act(() => {
    result.current.setSelectedDID(testHolderDid.doc.id);
    result.current.setSelectedVCId(sampleVC.id);
    result.current.setChallenge('test-challenge');
    result.current.showQRCode();
  });

  act(() => {
    result.current.resetForm();
  });

  expect(result.current.selectedDID).toBeNull();
  expect(result.current.selectedVCId).toBeNull();
  expect(result.current.challenge).toBe('');
  expect(result.current.zkpResult).toBeNull();
  expect(result.current.error).toBe('');
  expect(result.current.showQR).toBe(false);
});

it('DIDが選択されていない場合にエラーが表示される', async () => {
  const { result } = renderHook(() => useZKPGenerator());

  act(() => {
    result.current.setSelectedVCId(sampleVC.id);
    result.current.setChallenge('test-challenge');
    result.current.setSelectedDID(null);
  });

  await act(async () => {
    await result.current.generateZKP();
  });

  expect(result.current.error).toBe('DIDを選択してください。');
  expect(result.current.isGenerating).toBe(false);
});

it('選択されたVCが見つからない場合にエラーが表示される', async () => {
  const { result } = renderHook(() => useZKPGenerator());
  const nonExistentVCId = brandedId.vc.dto.parse('urn:uuid:non-existent');

  act(() => {
    result.current.setSelectedDID(testHolderDid.doc.id);
    result.current.setSelectedVCId(nonExistentVCId);
    result.current.setChallenge('test-challenge');
    result.current.setVerifierDID('did:amatelus:test-verifier' as DtoId['did']);
  });

  await act(async () => {
    await result.current.generateZKP();
  });

  expect(result.current.error).toBe('選択されたVCが見つかりません。');
  expect(result.current.isGenerating).toBe(false);
});

it('ZKPが正常に生成される', async () => {
  const { result } = renderHook(() => useZKPGenerator());

  act(() => {
    result.current.setSelectedDID(testHolderDid.doc.id);
  });

  act(() => {
    const availableVC = result.current.residenceVCs[0];
    result.current.setSelectedVCId(availableVC.data.id);
    result.current.setChallenge('test-challenge');
    result.current.setVerifierDID('did:amatelus:test-verifier' as DtoId['did']);
  });

  await act(async () => {
    await result.current.generateZKP();
  });

  expect(result.current.zkpResult).not.toBeNull();
  expect(result.current.zkpResult!.proof.baseProof.version).toBe(1);
  expect(result.current.zkpResult!.proof.baseProof.proofType).toBe('age_over_20');
  expect(result.current.zkpResult!.proof.challenge).toBe('test-challenge');
  expect(result.current.zkpResult!.proof.baseProof.publicInputs.ageThreshold).toBe(20);
  expect(result.current.zkpResult!.proof.baseProof.metadata.proverDID).toBe(testHolderDid.doc.id);
  expect(result.current.error).toBe('');
  expect(result.current.isGenerating).toBe(false);
});

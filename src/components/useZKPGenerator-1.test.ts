import { act, renderHook } from '@testing-library/react';
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

it('should initialize with default values', () => {
  const { result } = renderHook(() => useZKPGenerator());

  expect(result.current.selectedVCId).toBeNull();
  expect(result.current.nonce).toBe('');
  expect(result.current.isGenerating).toBe(false);
  expect(result.current.zkpResult).toBeNull();
  expect(result.current.error).toBe('');
  expect(result.current.showQR).toBe(false);
  expect(result.current.residenceVCs).toHaveLength(1);
});

it('should update selectedVCId', () => {
  const { result } = renderHook(() => useZKPGenerator());

  act(() => {
    result.current.setSelectedVCId(sampleVC.id);
  });

  expect(result.current.selectedVCId).toBe(sampleVC.id);
});

it('should update nonce', () => {
  const { result } = renderHook(() => useZKPGenerator());

  act(() => {
    result.current.setNonce('test-nonce');
  });

  expect(result.current.nonce).toBe('test-nonce');
});

it('should show and close QR code', () => {
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

it('should reset form', () => {
  const { result } = renderHook(() => useZKPGenerator());

  // Set some values
  act(() => {
    result.current.setSelectedVCId(sampleVC.id);
    result.current.setNonce('test-nonce');
    result.current.showQRCode();
  });

  // Reset form
  act(() => {
    result.current.resetForm();
  });

  expect(result.current.selectedVCId).toBeNull();
  expect(result.current.nonce).toBe('');
  expect(result.current.zkpResult).toBeNull();
  expect(result.current.error).toBe('');
  expect(result.current.showQR).toBe(false);
});

it('should show error when nonce is empty', async () => {
  const { result } = renderHook(() => useZKPGenerator());

  act(() => {
    result.current.setSelectedVCId(sampleVC.id);
  });

  await act(async () => {
    await result.current.generateZKP();
  });

  expect(result.current.error).toBe('チャレンジ文字列（Nonce）を入力してください。');
  expect(result.current.isGenerating).toBe(false);
});

it('should show error when DID is not found', async () => {
  localStorage.removeItem('amatelus-did');

  const { result } = renderHook(() => useZKPGenerator());

  act(() => {
    result.current.setSelectedVCId(sampleVC.id);
    result.current.setNonce('test-nonce');
  });

  await act(async () => {
    await result.current.generateZKP();
  });

  expect(result.current.error).toBe('DIDが生成されていません。');
  expect(result.current.isGenerating).toBe(false);
});

it('should show error when selected VC is not found', async () => {
  const { result } = renderHook(() => useZKPGenerator());
  const nonExistentVCId = brandedId.vc.dto.parse('urn:uuid:non-existent');

  act(() => {
    result.current.setSelectedVCId(nonExistentVCId);
    result.current.setNonce('test-nonce');
  });

  await act(async () => {
    await result.current.generateZKP();
  });

  expect(result.current.error).toBe('選択されたVCが見つかりません。');
  expect(result.current.isGenerating).toBe(false);
});

it('should generate ZKP successfully', async () => {
  const { result } = renderHook(() => useZKPGenerator());

  act(() => {
    result.current.setSelectedVCId(sampleVC.id);
    result.current.setNonce('test-nonce');
  });

  await act(async () => {
    await result.current.generateZKP();
  });

  expect(result.current.zkpResult).not.toBeNull();
  expect(result.current.zkpResult!.proof.version).toBe(1);
  expect(result.current.zkpResult!.proof.proofType).toBe('age_over_20');
  expect(result.current.zkpResult!.proof.nonce).toBe('test-nonce');
  expect(result.current.zkpResult!.proof.publicInputs.minAge).toBe(20);
  expect(result.current.zkpResult!.proof.metadata.did).toBe(testHolderDid.doc.id);
  expect(result.current.error).toBe('');
  expect(result.current.isGenerating).toBe(false);
});

it('should handle ZKP generation error for underage', async () => {
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
    result.current.setSelectedVCId(modifiedVC.id);
    result.current.setNonce('test-nonce');
  });

  await act(async () => {
    await result.current.generateZKP();
  });

  expect(result.current.error).toBe('年齢が20歳未満のため、証明を生成できません。');
  expect(result.current.zkpResult).toBeNull();
  expect(result.current.isGenerating).toBe(false);
});

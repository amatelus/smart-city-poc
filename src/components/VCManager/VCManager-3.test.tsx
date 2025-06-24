import { act, fireEvent, render, screen } from '@testing-library/react';
import type { DtoId } from 'src/schemas/brandedId';
import type { DIDData } from 'src/schemas/did';
import type { VCStorage } from 'src/schemas/vc';
import { generateDID, saveDIDToStorage } from 'src/utils/did';
import { beforeEach, expect, it, vi } from 'vitest';
import VCManager from './VCManager';

vi.mock('./VCAddModal', () => ({
  default: vi.fn(
    ({
      onClose,
      onError,
      onVcJsonInputChange,
      selectedDID,
    }: {
      onClose: () => void;
      onError: (msg: string) => void;
      onVcJsonInputChange: (json: string) => void;
      selectedDID: DtoId['did'];
    }) => (
      <div data-testid="vc-add-modal">
        <button data-testid="add-modal-close" onClick={onClose}>
          モーダル閉じる
        </button>
        <button data-testid="add-modal-error" onClick={() => onError('テストエラー')}>
          エラー発生
        </button>
        <button data-testid="add-modal-input" onClick={() => onVcJsonInputChange('test input')}>
          入力変更
        </button>
        <div data-testid="selected-did">{selectedDID}</div>
      </div>
    ),
  ),
}));

vi.mock('./VCDetailModal', () => ({
  default: vi.fn(({ onClose, selectedVC }: { onClose: () => void; selectedVC: VCStorage }) => (
    <div data-testid="vc-detail-modal">
      <button data-testid="detail-modal-close" onClick={onClose}>
        詳細モーダル閉じる
      </button>
      <div data-testid="selected-vc-title">{selectedVC.title}</div>
    </div>
  )),
}));

vi.mock('./VCDIDSelector', () => ({
  default: vi.fn(
    ({
      allDIDs,
      selectedDID,
      onDIDSelect,
      onError,
    }: {
      allDIDs: DIDData[];
      selectedDID: DtoId['did'];
      onDIDSelect: (did: DtoId['did'] | null) => void;
      onError: (msg: string) => void;
    }) => (
      <div data-testid="vc-did-selector">
        <button data-testid="select-did" onClick={() => onDIDSelect(allDIDs[0]?.doc.id ?? null)}>
          DID選択
        </button>
        <button data-testid="selector-error" onClick={() => onError('セレクターエラー')}>
          セレクターエラー
        </button>
        <div data-testid="current-selected-did">{selectedDID || 'なし'}</div>
      </div>
    ),
  ),
}));

const testDID1 = generateDID();

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

it('VC追加モーダルから入力が変更される', () => {
  saveDIDToStorage(testDID1);

  render(<VCManager />);

  const selectButton = screen.getByTestId('select-did');

  act(() => {
    fireEvent.click(selectButton);
  });

  const addButton = screen.getByText('VC追加');

  act(() => {
    fireEvent.click(addButton);
  });

  const inputButton = screen.getByTestId('add-modal-input');

  act(() => {
    fireEvent.click(inputButton);
  });

  expect(screen.getByTestId('vc-add-modal')).toBeInTheDocument();
});

it('選択されたDIDがVC追加モーダルに渡される', () => {
  saveDIDToStorage(testDID1);

  render(<VCManager />);

  const selectButton = screen.getByTestId('select-did');

  act(() => {
    fireEvent.click(selectButton);
  });

  const addButton = screen.getByText('VC追加');

  act(() => {
    fireEvent.click(addButton);
  });

  expect(screen.getByTestId('selected-did')).toHaveTextContent(testDID1.doc.id);
});

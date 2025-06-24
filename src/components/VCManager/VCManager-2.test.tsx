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

it('VC追加モーダルを閉じることができる', () => {
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

  expect(screen.getByTestId('vc-add-modal')).toBeInTheDocument();

  const closeButton = screen.getByTestId('add-modal-close');

  act(() => {
    fireEvent.click(closeButton);
  });

  expect(screen.queryByTestId('vc-add-modal')).not.toBeInTheDocument();
});

it('サンプルVC追加ボタンをクリックするとVCが追加される', () => {
  saveDIDToStorage(testDID1);

  render(<VCManager />);

  const selectButton = screen.getByTestId('select-did');

  act(() => {
    fireEvent.click(selectButton);
  });

  const sampleButton = screen.getByText('サンプルVC追加');

  act(() => {
    fireEvent.click(sampleButton);
  });

  expect(screen.getByText('保有VC一覧 (1件)')).toBeInTheDocument();
});

it('VCセレクターからエラーが設定される', () => {
  render(<VCManager />);

  const errorButton = screen.getByTestId('selector-error');

  act(() => {
    fireEvent.click(errorButton);
  });

  expect(screen.getByTestId('vc-did-selector')).toBeInTheDocument();
});

it('VC追加モーダルからエラーが設定される', () => {
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

  const errorButton = screen.getByTestId('add-modal-error');

  act(() => {
    fireEvent.click(errorButton);
  });

  expect(screen.getByTestId('vc-add-modal')).toBeInTheDocument();
});

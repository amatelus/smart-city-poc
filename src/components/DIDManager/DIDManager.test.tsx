import { act, fireEvent, render, screen } from '@testing-library/react';
import { generateDID, saveDIDToStorage } from 'src/utils/did';
import { beforeEach, expect, it, vi } from 'vitest';
import DIDManager from './DIDManager';

const testDID1 = generateDID();
const testDID2 = generateDID();

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.stubGlobal('confirm', vi.fn());
});

it('DIDマネージャーのタイトルが表示される', () => {
  saveDIDToStorage(testDID1);

  render(<DIDManager />);

  expect(screen.getByText('DID管理')).toBeInTheDocument();
});

it('マウント時に既存のDIDが読み込まれる', () => {
  saveDIDToStorage(testDID1);
  saveDIDToStorage(testDID2);

  render(<DIDManager />);

  expect(screen.getByText('DID一覧 (2件)')).toBeInTheDocument();
});

it('DIDが存在しない場合に自動的に新しいDIDが生成される', () => {
  render(<DIDManager />);

  expect(screen.getByText(/DID一覧 \(1件\)/)).toBeInTheDocument();
});

it('ボタンクリック時に新しいDIDが生成される', () => {
  saveDIDToStorage(testDID1);

  render(<DIDManager />);

  expect(screen.getByText('DID一覧 (1件)')).toBeInTheDocument();

  act(() => {
    fireEvent.click(screen.getByText('新しいDIDを生成'));
  });

  expect(screen.getByText('DID一覧 (2件)')).toBeInTheDocument();
});

it('DIDクリック時にDID詳細が表示される', () => {
  saveDIDToStorage(testDID1);

  render(<DIDManager />);

  const didElement = screen.getByText(/\.\.\..*/);

  act(() => {
    fireEvent.click(didElement.parentElement!.parentElement!);
  });

  expect(screen.getByText(/DID詳細:/)).toBeInTheDocument();
  expect(screen.getByText(testDID1.doc.id)).toBeInTheDocument();
  expect(screen.getByText(testDID1.publicKey)).toBeInTheDocument();
});

it('閉じるボタンクリック時にDID詳細モーダルが閉じる', () => {
  saveDIDToStorage(testDID1);

  render(<DIDManager />);

  const didElement = screen.getByText(/\.\.\..*/);

  act(() => {
    fireEvent.click(didElement.parentElement!.parentElement!);
  });

  expect(screen.getByText(/DID詳細:/)).toBeInTheDocument();

  act(() => {
    fireEvent.click(screen.getByText('✕'));
  });

  expect(screen.queryByText(/DID詳細:/)).not.toBeInTheDocument();
});

it('削除ボタンクリックして確認した場合にDIDが削除される', () => {
  saveDIDToStorage(testDID1);
  saveDIDToStorage(testDID2);

  const mockConfirm = vi.mocked(confirm);
  mockConfirm.mockReturnValue(true);

  render(<DIDManager />);

  expect(screen.getByText('DID一覧 (2件)')).toBeInTheDocument();

  const deleteButtons = screen.getAllByText('削除');

  act(() => {
    fireEvent.click(deleteButtons[0]);
  });

  expect(mockConfirm).toHaveBeenCalled();
  expect(screen.getByText('DID一覧 (1件)')).toBeInTheDocument();
});

it('削除がキャンセルされた場合にDIDが削除されない', () => {
  saveDIDToStorage(testDID1);
  saveDIDToStorage(testDID2);

  const mockConfirm = vi.mocked(confirm);
  mockConfirm.mockReturnValue(false);

  render(<DIDManager />);

  expect(screen.getByText('DID一覧 (2件)')).toBeInTheDocument();

  const deleteButtons = screen.getAllByText('削除');

  act(() => {
    fireEvent.click(deleteButtons[0]);
  });

  expect(mockConfirm).toHaveBeenCalled();
  expect(screen.getByText('DID一覧 (2件)')).toBeInTheDocument();
});

it('DIDが1つしかない場合に削除ボタンが無効化される', () => {
  saveDIDToStorage(testDID1);

  render(<DIDManager />);

  const deleteButton = screen.getByText('削除');
  expect(deleteButton).toBeDisabled();
});

it('新規開始時に空の状態を表示してDIDを自動生成する', () => {
  render(<DIDManager />);

  expect(screen.getByText(/DID一覧 \(1件\)/)).toBeInTheDocument();
});

it('選択されたDIDが削除された時にそのDIDのモーダルが閉じる', () => {
  saveDIDToStorage(testDID1);
  saveDIDToStorage(testDID2);

  const mockConfirm = vi.mocked(confirm);
  mockConfirm.mockReturnValue(true);

  render(<DIDManager />);

  const didElements = screen.getAllByText(/\.\.\..*/);

  act(() => {
    fireEvent.click(didElements[0].parentElement!.parentElement!);
  });

  expect(screen.getByText(/DID詳細:/)).toBeInTheDocument();

  const deleteButtons = screen.getAllByText('削除');
  act(() => {
    fireEvent.click(deleteButtons[0]);
  });

  expect(mockConfirm).toHaveBeenCalled();
  expect(screen.queryByText(/DID詳細:/)).not.toBeInTheDocument();
  expect(screen.getByText('DID一覧 (1件)')).toBeInTheDocument();
});

import { act, fireEvent, render, screen } from '@testing-library/react';
import type { DtoId } from 'src/schemas/brandedId';
import type { ZKPProof } from 'src/schemas/zkp';
import { formatZKPForQR } from 'src/utils/zkp';
import { beforeEach, expect, it, vi } from 'vitest';
import ZKPQRModal from './ZKPQRModal';

vi.mock('qrcode.react', () => ({
  QRCodeSVG: vi.fn(
    ({
      value,
      size,
      level,
      includeMargin,
    }: {
      value: string;
      size: number;
      level: string;
      includeMargin: boolean;
    }) => (
      <div
        data-testid="qr-code-svg"
        data-value={value}
        data-size={size}
        data-level={level}
        data-include-margin={includeMargin}
      >
        QR Code: {value}
      </div>
    ),
  ),
}));

vi.mock('src/utils/zkp', () => ({
  formatZKPForQR: vi.fn(),
}));

const mockZKPProof: ZKPProof = {
  baseProof: {
    version: 1,
    proofType: 'age_over_20',
    nullifierSecret: 'test-nullifier-secret-123',
    merkleProof: 'test-merkle-proof-987654321fedcba',
    proof: 'test-zkp-proof-data',
    publicInputs: {
      ageThreshold: 20,
      currentTimestamp: Date.now(),
    },
    metadata: {
      generatedAt: '2024-01-01T12:00:00.000Z',
      proverDID: 'did:amatelus:test-prover' as DtoId['did'],
      expiresAt: '2024-01-01T12:05:00.000Z',
    },
  },
  challenge: 'test-challenge-12345',
  nullifierHash: 'test-nullifier-hash-123456789abcdef',
  verifierInfo: {
    verifierDID: 'did:amatelus:test-verifier' as DtoId['did'],
    challengeTimestamp: Date.now(),
  },
};

const mockProps = {
  zkpProof: mockZKPProof,
  onClose: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(formatZKPForQR).mockImplementation((proof) => {
    // Create a simple mock that returns a predictable value based on the proof
    const merkleProof = proof.baseProof.merkleProof;
    return `formatted-zkp-${merkleProof.slice(-15)}`;
  });
});

it('すべての必要な情報が表示される', () => {
  render(<ZKPQRModal {...mockProps} />);

  expect(screen.getByText('ZKP証明QRコード')).toBeInTheDocument();
  expect(screen.getByText('証明内容:')).toBeInTheDocument();
  expect(screen.getByText('有効期限:')).toBeInTheDocument();
  expect(screen.getByTestId('qr-code-svg')).toBeInTheDocument();
  expect(screen.getByText('✕')).toBeInTheDocument();
});

it('onCloseハンドラーが複数回呼び出される', () => {
  render(<ZKPQRModal {...mockProps} />);

  const closeButton = screen.getByText('✕');

  act(() => {
    fireEvent.click(closeButton);
    fireEvent.click(closeButton);
    fireEvent.click(closeButton);
  });

  expect(mockProps.onClose).toHaveBeenCalledTimes(3);
});

it('モーダルの構造が正しく表示される', () => {
  const { container } = render(<ZKPQRModal {...mockProps} />);

  const modal = container.querySelector('[class*="qrModal"]');
  const qrContainer = container.querySelector('[class*="qrContainer"]');
  const qrHeader = container.querySelector('[class*="qrHeader"]');
  const qrCodeWrapper = container.querySelector('[class*="qrCodeWrapper"]');
  const qrInfo = container.querySelector('[class*="qrInfo"]');

  expect(modal).toBeInTheDocument();
  expect(qrContainer).toBeInTheDocument();
  expect(qrHeader).toBeInTheDocument();
  expect(qrCodeWrapper).toBeInTheDocument();
  expect(qrInfo).toBeInTheDocument();
});

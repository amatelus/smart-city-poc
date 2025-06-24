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

it('モーダルが正しく表示される', () => {
  render(<ZKPQRModal {...mockProps} />);

  expect(screen.getByText('ZKP証明QRコード')).toBeInTheDocument();
  expect(screen.getByText('✕')).toBeInTheDocument();
});

it('QRコードが正しいプロパティで表示される', () => {
  render(<ZKPQRModal {...mockProps} />);

  const qrCode = screen.getByTestId('qr-code-svg');
  expect(qrCode).toBeInTheDocument();
  expect(qrCode).toHaveAttribute('data-value', 'formatted-zkp-987654321fedcba');
  expect(qrCode).toHaveAttribute('data-size', '300');
  expect(qrCode).toHaveAttribute('data-level', 'M');
  expect(qrCode).toHaveAttribute('data-include-margin', 'true');
});

it('証明内容が正しく表示される', () => {
  render(<ZKPQRModal {...mockProps} />);

  expect(screen.getByText('証明内容:')).toBeInTheDocument();
  expect(screen.getByText('20歳以上であることの証明')).toBeInTheDocument();
});

it('有効期限情報が表示される', () => {
  render(<ZKPQRModal {...mockProps} />);

  expect(screen.getByText('有効期限:')).toBeInTheDocument();
  expect(screen.getByText('生成から5分間')).toBeInTheDocument();
});

it('使用説明が表示される', () => {
  render(<ZKPQRModal {...mockProps} />);

  expect(
    screen.getByText(
      '検証者にこのQRコードをスキャンしてもらい、ZKP証明を検証してもらってください。',
    ),
  ).toBeInTheDocument();
});

it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
  render(<ZKPQRModal {...mockProps} />);

  const closeButton = screen.getByText('✕');

  act(() => {
    fireEvent.click(closeButton);
  });

  expect(mockProps.onClose).toHaveBeenCalledTimes(1);
});

it('異なるZKPProofでQRコードが更新される', () => {
  const differentProof: ZKPProof = {
    baseProof: {
      version: 1,
      proofType: 'age_over_20',
      nullifierSecret: 'different-nullifier-secret',
      merkleProof: 'different-merkle-proof-abcdef123',
      proof: 'different-zkp-proof-data',
      publicInputs: {
        ageThreshold: 20,
        currentTimestamp: Date.now(),
      },
      metadata: {
        generatedAt: '2024-01-01T13:00:00.000Z',
        proverDID: 'did:amatelus:different-prover' as DtoId['did'],
        expiresAt: '2024-01-01T13:05:00.000Z',
      },
    },
    challenge: 'different-challenge',
    nullifierHash: 'different-nullifier-hash',
    verifierInfo: {
      verifierDID: 'did:amatelus:different-verifier' as DtoId['did'],
      challengeTimestamp: Date.now(),
    },
  };

  const { rerender } = render(<ZKPQRModal {...mockProps} />);

  let qrCode = screen.getByTestId('qr-code-svg');
  expect(qrCode).toHaveAttribute('data-value', 'formatted-zkp-987654321fedcba');

  rerender(<ZKPQRModal {...mockProps} zkpProof={differentProof} />);

  qrCode = screen.getByTestId('qr-code-svg');
  expect(qrCode).toHaveAttribute('data-value', 'formatted-zkp-proof-abcdef123');
});

it('QRコードのサイズとレベルが固定値で設定される', () => {
  render(<ZKPQRModal {...mockProps} />);

  const qrCode = screen.getByTestId('qr-code-svg');
  expect(qrCode).toHaveAttribute('data-size', '300');
  expect(qrCode).toHaveAttribute('data-level', 'M');
  expect(qrCode).toHaveAttribute('data-include-margin', 'true');
});

it('formatZKPForQRが正しいZKPProofで呼ばれる', () => {
  render(<ZKPQRModal {...mockProps} />);

  expect(vi.mocked(formatZKPForQR)).toHaveBeenCalledWith(mockZKPProof);
  expect(vi.mocked(formatZKPForQR)).toHaveBeenCalledTimes(1);
});

import { render } from '@testing-library/react';
import { PendingCommunityTransactions } from 'components/PendingCommunityTransactions/PendingCommunityTransactions';
import { ethers } from 'ethers';
import { PendingChanges } from 'lib/communityNFT/multisig';

const address = ethers.Wallet.createRandom().address;

const mockMultiSigChanges: { [key: number]: PendingChanges[] } = {
  63: [
    {
      account: address,
      id: 'COMMUNITY',
      ipfsLink: 'some-ipfs-link',
      value: 2,
      type: 'CATEGORY',
    },
  ],
  64: [
    {
      account: address,
      id: '8',
      ipfsLink: 'some-ipfs-link',
      value: 1,
      type: 'ACCESSORY',
    },
  ],
};

describe('PendingCommunityTransactions', () => {
  it('renders pending txs from multi sig', async () => {
    const { getByText, getAllByText } = render(
      <PendingCommunityTransactions multiSigChanges={mockMultiSigChanges} />,
    );

    getByText('Pending Transaction #63');
    getByText('Pending Transaction #64');
    getAllByText(`account: ${address}`);
    getByText('id: COMMUNITY');
    getByText('id: 8');
    getByText('value: 2');
    getByText('value: 1');
  });
});

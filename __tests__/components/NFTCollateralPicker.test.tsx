import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NFTCollateralPicker } from 'components/NFTCollateralPicker/NFTCollateralPicker';
import { useDialogState, DialogDisclosure } from 'reakit/Dialog';
import { useNFTs } from 'hooks/useNFTs';
import { CombinedError } from 'urql';
import { NFTEntity } from 'types/NFT';
import { ethers } from 'ethers';

jest.mock('hooks/useNFTs', () => ({
  ...jest.requireActual('hooks/useNFTs'),
  useNFTs: jest.fn(),
}));

const mockUseNFTs = useNFTs as jest.MockedFunction<typeof useNFTs>;
const handleSetSelectedNFT = jest.fn();

const nfts: NFTEntity[] = [
  {
    approvals: [
      {
        approved: {
          id: '0x0b871556a94b2e7bc258dc28dd734ede42050e24',
        },
        id: '9661366-26',
      },
    ],
    id: '0x9ec7ff8964afba6d8c43dc340a2e6c6c3156eXXX-0x7',
    identifier: ethers.BigNumber.from('7'),
    registry: {
      name: 'Monarchs',
      symbol: 'MNR',
    },
    uri: 'ipfs://QmXuEFJVjQrHX7GRWY2WnbUP59re3WsyDLZoKqXvRPSxBY/7',
  },
  {
    approvals: [],
    id: '0x9ec7ff8964afba6d8c43dc340a2e6c6c3156eXXX-0x2',
    identifier: ethers.BigNumber.from('2'),
    registry: {
      name: 'Monarchs',
      symbol: 'MNR',
    },
    uri: 'ipfs://QmXuEFJVjQrHX7GRWY2WnbUP59re3WsyDLZoKqXvRPSxBY/7',
  },
  {
    approvals: [],
    id: '0x9ec7ff8964afba6d8c43dc340a2e6c6c3156eYYY-0x8',
    identifier: ethers.BigNumber.from('8'),
    registry: {
      name: 'Serfs',
      symbol: 'SRF',
    },
    uri: 'ipfs://QmXuEFJVjQrHX7GRWY2WnbUP59re3WsyDLZoKqXvRPSxBY/8',
  },
  {
    approvals: [],
    id: '0x9ec7ff8964afba6d8c43dc340a2e6c6c3156eYYY-0x9',
    identifier: ethers.BigNumber.from('9'),
    registry: {
      name: 'Serfs',
      symbol: 'SRF',
    },
    uri: 'ipfs://QmXuEFJVjQrHX7GRWY2WnbUP59re3WsyDLZoKqXvRPSxBY/8',
  },
];

const Picker = () => {
  const dialog = useDialogState({ visible: true });
  return (
    <>
      <DialogDisclosure {...dialog}>relaunch modal</DialogDisclosure>
      <NFTCollateralPicker
        dialog={dialog}
        handleSetSelectedNFT={handleSetSelectedNFT}
        connectedWallet="0xaddress"
      />
    </>
  );
};

describe('NFTCollateralPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders an initial loading state', () => {
    mockUseNFTs.mockReturnValue({ fetching: true, nfts: [], error: undefined });
    const { getByText } = render(<Picker />);
    getByText('loading your NFTs...');
  });

  it('renders an error state', () => {
    mockUseNFTs.mockReturnValue({
      fetching: false,
      nfts: [],
      error: new CombinedError({ graphQLErrors: ['welp'] }),
    });
    const { getByText } = render(<Picker />);
    getByText('oops, we could not load your NFTs');
  });

  it('handles when a user has no NFTs', () => {
    mockUseNFTs.mockReturnValue({
      fetching: false,
      nfts: [],
      error: undefined,
    });
    const { getByText } = render(<Picker />);

    // we have 2 groups of NFTs
    getByText("🤔 Uh-oh, looks like this address doesn't have any NFTs.");
  });

  it('renders a list of grouped NFTs for selection', () => {
    mockUseNFTs.mockReturnValue({ fetching: false, nfts, error: undefined });
    const { getByText } = render(<Picker />);

    // we have 2 groups of NFTs
    getByText('monarchs');
    getByText('serfs');
  });

  it('expands groups of NFTs on click', () => {
    mockUseNFTs.mockReturnValue({ fetching: false, nfts, error: undefined });
    const { getByText, container } = render(<Picker />);

    // we haven't expanded any groups yet
    expect(container.querySelector('.nft-list')).not.toBeInTheDocument();

    const serfsButton = getByText('serfs');
    userEvent.click(serfsButton);

    // clicking expanded it
    expect(container.querySelector('.nft-list')).toBeInTheDocument();
  });

  it('sets the selected NFT and hides the dialog on click', () => {
    mockUseNFTs.mockReturnValue({ fetching: false, nfts, error: undefined });
    const { getByText, container, getByRole } = render(<Picker />);

    // this works here because the dialog is visible
    getByRole('dialog');

    // drill down into the list and pick an NFT
    const serfsButton = getByText('serfs');
    userEvent.click(serfsButton);
    const list = container.querySelector('.nft-list');
    const nft = list?.querySelector('.nft');

    // ensure that this function is actually called as a result of clicking the NFT
    expect(handleSetSelectedNFT).not.toHaveBeenCalled();
    userEvent.click(nft!);
    expect(handleSetSelectedNFT).toHaveBeenCalled();

    // this now throws because the dialog has been hidden
    expect(() => getByRole('dialog')).toThrow();
  });
});

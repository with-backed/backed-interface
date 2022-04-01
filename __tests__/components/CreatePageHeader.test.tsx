import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthorizeNFTButton } from 'components/CreatePageHeader/AuthorizeNFTButton';
import { ethers } from 'ethers';
import { nftEntity } from 'lib/mockData';
import { isNFTApprovedForCollateral } from 'lib/eip721Subraph';
import { web3Erc721Contract } from 'lib/contracts';

jest.mock('lib/contracts');
jest.mock('lib/eip721Subraph');
jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useSigner: jest.fn().mockReturnValue([{ data: jest.fn() }]),
}));

const mockedIsNFTApprovedForCollateral =
  isNFTApprovedForCollateral as jest.MockedFunction<
    typeof isNFTApprovedForCollateral
  >;

const mockedErc721Contract = web3Erc721Contract as jest.MockedFunction<
  typeof web3Erc721Contract
>;

describe('CreatePageHeader', () => {
  describe('AuthorizeNFTButton', () => {
    const onAlreadyApproved = jest.fn();
    const onApproved = jest.fn();
    const onError = jest.fn();
    const onSubmit = jest.fn();
    const wait = jest.fn();
    beforeEach(() => {
      jest.clearAllMocks();
      mockedIsNFTApprovedForCollateral.mockReturnValue(false);
      mockedErc721Contract.mockReturnValue({
        approve: jest.fn().mockResolvedValue({
          hash: '0xtx',
          wait,
        }),
      } as any);
    });

    it('renders', () => {
      const { getByText } = render(
        <AuthorizeNFTButton
          onAlreadyApproved={onAlreadyApproved}
          onApproved={onApproved}
          onError={onError}
          onSubmit={onSubmit}
          collateralAddress="0xwhatever"
          collateralTokenID={ethers.BigNumber.from(1)}
          disabled={false}
          nft={null}
        />,
      );

      getByText('Authorize NFT');

      expect(onAlreadyApproved).not.toHaveBeenCalled();
      expect(onApproved).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('bails early when an NFT is already approved', () => {
      mockedIsNFTApprovedForCollateral.mockReturnValue(true);
      const { getByText } = render(
        <AuthorizeNFTButton
          onAlreadyApproved={onAlreadyApproved}
          onApproved={onApproved}
          onError={onError}
          onSubmit={onSubmit}
          collateralAddress="0xwhatever"
          collateralTokenID={ethers.BigNumber.from(1)}
          disabled={false}
          nft={nftEntity}
        />,
      );

      expect(onAlreadyApproved).toHaveBeenCalled();

      getByText('Authorize NFT');
    });

    it('calls the contract to authorize custody of NFT (success)', async () => {
      wait.mockResolvedValue(true);
      const { getByText } = render(
        <AuthorizeNFTButton
          onAlreadyApproved={onAlreadyApproved}
          onApproved={onApproved}
          onError={onError}
          onSubmit={onSubmit}
          collateralAddress="0xwhatever"
          collateralTokenID={ethers.BigNumber.from(1)}
          disabled={false}
          nft={nftEntity}
        />,
      );

      const button = getByText('Authorize NFT');

      await act(() => userEvent.click(button));

      await waitFor(() => expect(onSubmit).toHaveBeenCalled());
      await waitFor(() => expect(onApproved).toHaveBeenCalled());

      expect(onAlreadyApproved).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it('calls the contract to authorize custody of NFT (failure)', async () => {
      wait.mockRejectedValue('fail');
      const { getByText } = render(
        <AuthorizeNFTButton
          onAlreadyApproved={onAlreadyApproved}
          onApproved={onApproved}
          onError={onError}
          onSubmit={onSubmit}
          collateralAddress="0xwhatever"
          collateralTokenID={ethers.BigNumber.from(1)}
          disabled={false}
          nft={nftEntity}
        />,
      );

      const button = getByText('Authorize NFT');

      await act(() => userEvent.click(button));

      await waitFor(() => expect(onSubmit).toHaveBeenCalled());
      await waitFor(() => expect(onError).toHaveBeenCalled());

      expect(onAlreadyApproved).not.toHaveBeenCalled();
      expect(onApproved).not.toHaveBeenCalled();
    });
  });
});

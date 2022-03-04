import React, { useEffect } from 'react';
import { DialogDisclosureButton, WalletButton } from 'components/Button';
import { Modal } from 'components/Modal';
import { useDialogState } from 'reakit/Dialog';
import { FormWrapper } from 'components/layouts/FormWrapper';
import { ConnectedWalletMenu } from './ConnectedWalletMenu';
import { useAccount, useConnect } from 'wagmi';

export const ConnectWallet = () => {
  const [{ data: accountData }] = useAccount();
  const [{ data: connectData }, connect] = useConnect();
  const dialog = useDialogState();

  const address = accountData?.address;

  useEffect(() => {
    if (Boolean(address)) {
      dialog.setVisible(false);
    }
  }, [address, dialog]);

  console.log({
    accountData,
    address,
  });

  return (
    <>
      {!address && (
        <DialogDisclosureButton {...dialog}>Connect</DialogDisclosureButton>
      )}
      {!!address && <ConnectedWalletMenu />}
      <Modal
        dialog={dialog}
        width="narrow"
        heading="✨ 🔑️ Connect Wallet ⚙️ ✨">
        <FormWrapper>
          {connectData.connectors.map((connector) => (
            <WalletButton
              key={connector.id}
              disabled={!connector.ready}
              onClick={() => connect(connector)}
              wallet={connector.id}
            />
          ))}
          <p>
            By connecting a wallet, you agree to NFT Pawn Shop&apos;s Terms of
            Service and acknowledge that you have read and understand the NFT
            Pawn Shop protocol disclaimer.
          </p>
        </FormWrapper>
      </Modal>
    </>
  );
};

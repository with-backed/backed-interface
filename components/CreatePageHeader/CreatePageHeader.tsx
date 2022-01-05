import { Button, CompletedButton } from 'components/Button';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { Fallback } from 'components/Media/Fallback';
import { useWeb3 } from 'hooks/useWeb3';
import React, { useMemo } from 'react';
import styles from './CreatePageHeader.module.css';

enum State {
  NotConnected = 0,
  NeedsToSelect,
  NeedsToAuthorize,
  AuthorizationInProgress,
  Form,
  Ready,
  Submitting,
}

const explainers = {
  [State.NotConnected]: ExplainerNotConnected,
  [State.NeedsToSelect]: ExplainerNeedsToSelect,
  [State.NeedsToAuthorize]: ExplainerNeedsToAuthorize,
  [State.AuthorizationInProgress]: ExplainerAuthorizationInProgress,
  [State.Form]: ExplainerForm,
  [State.Ready]: ExplainerReady,
  [State.Submitting]: ExplainerSubmitting,
};

export function CreatePageHeader() {
  const { account } = useWeb3();

  const state = useMemo(() => {
    return State.NotConnected;
  }, []);

  const Explainer = useMemo(() => explainers[state], [state]);

  return (
    <div className={styles['create-page-header']}>
      <ThreeColumn>
        <Fallback />
        <div className={styles['button-container']}>
          <SelectNFTButton state={state} />
          <AuthorizeNFTButton state={state} />
          <MintBorrowerTicketButton state={state} />
        </div>
        <Explainer />
      </ThreeColumn>
    </div>
  );
}

type ButtonProps = {
  state: State;
};
function SelectNFTButton({ state }: ButtonProps) {
  const text = useMemo(() => 'Select an NFT', []);
  const isDisabled = state === State.NotConnected;
  const isDone = state > State.NeedsToSelect;

  if (isDisabled) {
    return <Button disabled>{text}</Button>;
  }
  if (isDone) {
    return <CompletedButton buttonText={text} success />;
  }

  return <Button>{text}</Button>;
}

function AuthorizeNFTButton({ state }: ButtonProps) {
  const text = useMemo(() => 'Authorize NFT', []);
  const isDisabled = state < State.NeedsToAuthorize;
  const isDone = state > State.NeedsToAuthorize;

  if (isDisabled) {
    return <Button disabled>{text}</Button>;
  }
  if (isDone) {
    return <CompletedButton buttonText={text} success />;
  }

  return <Button>{text}</Button>;
}

function MintBorrowerTicketButton({ state }: ButtonProps) {
  const text = useMemo(() => 'Mint Borrower Ticket', []);
  const isDisabled = state < State.Ready;

  if (isDisabled) {
    return <Button disabled>{text}</Button>;
  }

  return <Button>{text}</Button>;
}

function ExplainerNotConnected() {
  return (
    <div className={styles.explainer}>
      First, connect your wallet!
      <br />← Then follow these steps to create a loan and make it available to
      lenders.
    </div>
  );
}

function ExplainerNeedsToSelect() {
  return (
    <div className={styles.explainer}>
      ← Start creating a loan by selecting an NFT to use as collateral. It will
      be locked up by the contract for the duration of the loan.
    </div>
  );
}

function ExplainerNeedsToAuthorize() {
  return (
    <div className={styles.explainer}>
      ← This allows the Pawn Shop to hold your NFT until you repay any loan you
      receive, and to trasnfer it to the lender if you choose not to repay.
    </div>
  );
}

function ExplainerAuthorizationInProgress() {
  return <div className={styles.explainer}>← This can take a few minutes.</div>;
}

function ExplainerForm() {
  return (
    <div className={styles.explainer}>
      ← Set your loan terms. Any lender who wishes can meet these terms, and you
      will automatically receive the loan amount minus a 1% origination fee.
    </div>
  );
}

function ExplainerReady() {
  return (
    <div className={styles.explainer}>
      ← This is the last step of creating a loan. You will be issued an NFT
      representing your rights and obligations as a borrower. This cannot be
      undone without closing the loan and repaying any loan amount you’ve
      received and interest accrued.
    </div>
  );
}

function ExplainerSubmitting() {
  return (
    <div className={styles.explainer}>← This can take a few more minutes.</div>
  );
}

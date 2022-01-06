import React from 'react';
import styles from './CreatePageHeader.module.css';
import { State } from './State';

export const explainers = {
  [State.NotConnected]: ExplainerNotConnected,
  [State.NeedsToSelect]: ExplainerNeedsToSelect,
  [State.NeedsToAuthorize]: ExplainerNeedsToAuthorize,
  [State.AuthorizationInProgress]: ExplainerAuthorizationInProgress,
  [State.Form]: ExplainerForm,
  [State.Ready]: ExplainerReady,
  [State.Submitting]: ExplainerSubmitting,
};

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

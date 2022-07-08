import { Loan } from 'types/Loan';
import React, { useEffect, useState } from 'react';
import { getAccountLoanAssetAllowance } from 'lib/account';
import { LoanFormAwaiting } from './LoanFormAwaiting';
import { useTimestamp } from 'hooks/useTimestamp';
import { LoanFormBetterTerms } from './LoanFormBetterTerms';
import { LoanFormRepay } from './LoanFormRepay';
import { LoanFormEarlyClosure } from './LoanFormEarlyClosure';
import { LoanFormSeizeCollateral } from './LoanFormSeizeCollateral';
import styles from './LoanForm.module.css';
import { Button } from 'components/Button';
import { useLoanViewerRole } from 'hooks/useLoanViewerRole';
import { LoanFormDisclosure } from './LoanFormDisclosure';
import { useAccount } from 'wagmi';
import { LoanOfferBetterTermsDisclosure } from 'components/LoanForm/LoanOfferBetterTermsDisclosure';
import { useConfig } from 'hooks/useConfig';
import { SupportedNetwork } from 'lib/config';
import { BETTER_TERMS_LABEL, LEND_LABEL } from './strings';
import { useBalance } from 'hooks/useBalance';

type LoanFormProps = {
  loan: Loan;
  refresh: () => void;
};
export function LoanForm({ loan, refresh }: LoanFormProps) {
  const { address } = useAccount();
  const { jsonRpcProvider, network } = useConfig();
  const timestamp = useTimestamp();
  const balance = useBalance(loan.loanAssetContractAddress);
  const [needsAllowance, setNeedsAllowance] = useState(true);
  const role = useLoanViewerRole(loan, address);
  const viewerIsBorrower = role === 'borrower';
  const viewerIsLender = role === 'lender';

  useEffect(() => {
    if (address) {
      getAccountLoanAssetAllowance(
        address,
        loan.loanAssetContractAddress,
        jsonRpcProvider,
        network as SupportedNetwork,
      ).then((allowanceAmount) => {
        setNeedsAllowance(allowanceAmount.lt(loan.loanAmount));
      });
    }
  }, [
    address,
    jsonRpcProvider,
    loan.loanAssetContractAddress,
    loan.loanAssetDecimals,
    loan.loanAmount,
    network,
  ]);

  if (loan.closed) {
    return null;
  }

  if (!address) {
    return (
      <div className={styles.wrapper}>
        <Button disabled>
          {loan.lender ? BETTER_TERMS_LABEL : LEND_LABEL}
        </Button>
      </div>
    );
  }

  if (
    !loan.lastAccumulatedTimestamp.eq(0) &&
    loan.lastAccumulatedTimestamp
      .add(loan.durationSeconds)
      .lte(timestamp || 0) &&
    viewerIsLender
  ) {
    if (viewerIsLender) {
      return (
        <div className={styles.wrapper}>
          <LoanFormSeizeCollateral loan={loan} refresh={refresh} />
        </div>
      );
    }
    return null;
  }

  if (loan.lastAccumulatedTimestamp.eq(0) && viewerIsBorrower) {
    return (
      <div className={styles.wrapper}>
        <LoanFormEarlyClosure loan={loan} refresh={refresh} />
      </div>
    );
  }

  if (loan.lastAccumulatedTimestamp.eq(0)) {
    return (
      <LoanFormDisclosure title={LEND_LABEL} className={styles.wrapper}>
        <div className={styles['form-wrapper']}>
          <LoanFormAwaiting
            balance={balance}
            loan={loan}
            needsAllowance={needsAllowance}
            setNeedsAllowance={setNeedsAllowance}
            refresh={refresh}
          />
        </div>
      </LoanFormDisclosure>
    );
  }

  if (viewerIsBorrower) {
    return (
      <LoanFormDisclosure
        title={'Repay loan & Claim NFT'}
        className={styles.wrapper}>
        <div className={styles['form-wrapper']}>
          <LoanFormRepay
            loan={loan}
            balance={balance}
            needsAllowance={needsAllowance}
            setNeedsAllowance={setNeedsAllowance}
            refresh={refresh}
          />
        </div>
      </LoanFormDisclosure>
    );
  }

  if (viewerIsLender) {
    return (
      <LoanOfferBetterTermsDisclosure
        textWrapperClassName={styles['disclosure-text-wrapper']}
        disclosureTextClassName={styles['disclosure-text']}>
        <div className={styles['form-wrapper']}>
          <LoanFormBetterTerms
            balance={balance}
            loan={loan}
            needsAllowance={needsAllowance}
            setNeedsAllowance={setNeedsAllowance}
            refresh={refresh}
          />
        </div>
      </LoanOfferBetterTermsDisclosure>
    );
  }

  return (
    <LoanFormDisclosure title={BETTER_TERMS_LABEL} className={styles.wrapper}>
      <div className={styles['form-wrapper']}>
        <LoanFormBetterTerms
          balance={balance}
          loan={loan}
          needsAllowance={needsAllowance}
          setNeedsAllowance={setNeedsAllowance}
          refresh={refresh}
        />
      </div>
    </LoanFormDisclosure>
  );
}

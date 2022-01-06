import { Button, CompletedButton, TransactionButton } from 'components/Button';
import { ethers } from 'ethers';
import { ErrorMessage, Field, Formik } from 'formik';
import { useWeb3 } from 'hooks/useWeb3';
import {
  jsonRpcERC20Contract,
  jsonRpcLoanFacilitator,
  web3LoanFacilitator,
} from 'lib/contracts';
import { getLoanAssets, LoanAsset } from 'lib/loanAssets';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import styles from './CreatePageHeader.module.css';
import { State } from './State';

type CreatePageFormProps = {
  collateralAddress: string;
  collateralTokenID: ethers.BigNumber;
  state: State;
};

export function CreatePageForm({
  collateralAddress,
  collateralTokenID,
  state,
}: CreatePageFormProps) {
  const { account } = useWeb3();
  const buttonText = useMemo(() => 'Mint Borrower Ticket', []);
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);
  const [loanAssetOptions, setLoanAssetOptions] = useState<LoanAsset[]>([]);

  const wait = useCallback(async () => {
    const contract = jsonRpcLoanFacilitator();
    const filter = contract.filters.CreateLoan(null, account, null, null, null);
    contract.once(filter, (id) => {
      setWaitingForTx(false);
      window.location.assign(`/loans/${id.toString()}`);
    });
  }, [account]);

  const mint = useCallback(
    async ({
      loanAssetContractAddress,
      loanAmount,
      interestRate,
      duration,
    }) => {
      const assetContract = jsonRpcERC20Contract(loanAssetContractAddress);
      const loanAssetDecimals = await assetContract.decimals();

      const contract = web3LoanFacilitator();
      const t = await contract.createLoan(
        collateralTokenID,
        collateralAddress,
        interestRate,
        ethers.utils.parseUnits(loanAmount.toString(), loanAssetDecimals),
        loanAssetContractAddress,
        duration,
        // If they've gotten this far, they must have an account.
        account!,
      );
      setTxHash(t.hash);
      setWaitingForTx(true);
      t.wait()
        .then(() => {
          wait();
          setWaitingForTx(true);
        })
        .catch((err) => {
          setWaitingForTx(false);
          console.error(err);
        });
    },
    [account, collateralAddress, collateralTokenID, wait],
  );

  const loadAssets = useCallback(async () => {
    const assets = await getLoanAssets();
    setLoanAssetOptions(assets);
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  if (state < State.Form) {
    return <Button disabled>{buttonText}</Button>;
  }

  return (
    <Formik
      initialValues={{}}
      validationSchema={Yup.object({
        loanAssetContractAddress: Yup.string(),
        loanAmount: Yup.number(),
        interestRate: Yup.number(),
        duration: Yup.number(),
      })}
      isInitialValid={false}
      onSubmit={mint}>
      {(formik) => (
        <form className={styles.form} onSubmit={formik.handleSubmit}>
          <label htmlFor="loanAssetContractAddress">
            <span>Loan Denomination</span>
            <Field name="loanAssetContractAddress" as="select">
              {loanAssetOptions.map(({ symbol, address }) => {
                return (
                  <option value={address} key={address}>
                    {symbol}
                  </option>
                );
              })}
            </Field>
          </label>

          <label htmlFor="loanAmount">
            <span>Minimum Loan Amount</span>
            <Field name="loanAmount" />
          </label>
          <ErrorMessage name="loanAmount" />

          <label htmlFor="interestRate">
            <span>Maximum Interest Rate</span>
            <Field name="interestRate" placeholder="0%" />
          </label>
          <ErrorMessage name="interestRate" />

          <label htmlFor="duration">
            <span>Minimum Duration</span>
            <Field name="duration" placeholder="0 Days" />
          </label>
          <ErrorMessage name="loanAmount" />

          <TransactionButton
            text={buttonText}
            type="submit"
            txHash={txHash}
            isPending={waitingForTx}
            disabled={!formik.isValid}
          />
        </form>
      )}
    </Formik>
  );
}

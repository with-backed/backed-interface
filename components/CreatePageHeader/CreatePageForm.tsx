import { Button, CompletedButton, TransactionButton } from 'components/Button';
import { Input } from 'components/Input';
import { Select } from 'components/Select';
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
import { OptionsOrGroups } from 'react-select';
import * as Yup from 'yup';
import styles from './CreatePageHeader.module.css';
import { State } from './State';

const SECONDS_IN_A_DAY = 60 * 60 * 24;
const SECONDS_IN_A_YEAR = 31_536_000;
const INTEREST_RATE_PERCENT_DECIMALS = 8;
const MIN_RATE = 1 / 10 ** INTEREST_RATE_PERCENT_DECIMALS;

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
      const assetContract = jsonRpcERC20Contract(
        loanAssetContractAddress.value,
      );
      const loanAssetDecimals = await assetContract.decimals();
      const durationInSeconds = Math.ceil(duration * SECONDS_IN_A_DAY);
      const interestRatePerSecond = ethers.BigNumber.from(
        Math.floor(interestRate * 10 ** INTEREST_RATE_PERCENT_DECIMALS),
      ).div(SECONDS_IN_A_YEAR);

      const contract = web3LoanFacilitator();
      const t = await contract.createLoan(
        collateralTokenID,
        collateralAddress,
        interestRatePerSecond,
        ethers.utils.parseUnits(loanAmount.toString(), loanAssetDecimals),
        loanAssetContractAddress.value,
        durationInSeconds,
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

  const initialLoanAssetContractAddress = useMemo(() => {
    if (loanAssetOptions.length > 0) {
      const { address, symbol } = loanAssetOptions[0];
      return { value: address, label: symbol };
    }
    return undefined;
  }, [loanAssetOptions]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  if (state < State.Form) {
    return <Button disabled>{buttonText}</Button>;
  }

  return (
    <Formik
      initialValues={{
        loanAssetContractAddress: initialLoanAssetContractAddress,
        loanAmount: 0,
        interestRate: 0,
        duration: 0,
      }}
      validationSchema={Yup.object({
        loanAssetContractAddress: Yup.object({
          value: Yup.string(),
          address: Yup.string(),
        }),
        loanAmount: Yup.number().moreThan(0),
        interestRate: Yup.number().min(MIN_RATE),
        duration: Yup.number().moreThan(0),
      })}
      isInitialValid={false}
      onSubmit={mint}>
      {(formik) => (
        <form className={styles.form} onSubmit={formik.handleSubmit}>
          <label htmlFor="loanAssetContractAddress">
            <span>Loan Denomination</span>
            <Field
              name="loanAssetContractAddress"
              as={Select}
              options={loanAssetOptions.map(({ symbol, address }) => ({
                value: address,
                label: symbol,
              }))}
              onChange={(option: { [key: string]: string }) =>
                formik.setFieldValue('loanAssetContractAddress', option)
              }
            />
          </label>

          <label htmlFor="loanAmount">
            <span>Minimum Loan Amount</span>
            <Field
              name="loanAmount"
              type="number"
              placeholder="0"
              as={Input}
              color="dark"
              unit={formik.values.loanAssetContractAddress?.label}
            />
          </label>
          <ErrorMessage name="loanAmount" />

          <label htmlFor="interestRate">
            <span>Maximum Interest Rate</span>
            <Field
              name="interestRate"
              type="number"
              placeholder={`0`}
              as={Input}
              color="dark"
              unit="%"
            />
          </label>
          <ErrorMessage name="interestRate" />

          <label htmlFor="duration">
            <span>Minimum Duration</span>
            <Field
              name="duration"
              type="number"
              placeholder="0"
              as={Input}
              color="dark"
              unit="Days"
            />
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

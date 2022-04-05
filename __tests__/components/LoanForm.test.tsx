import { loanWithLenderAccruing } from 'lib/mockData';
import { hasTenPercentImprovement } from 'components/LoanForm/LoanFormBetterTerms/LoanFormBetterTerms';
import { secondsToDays } from 'lib/duration';
import { formatUnits } from 'ethers/lib/utils';

const currentTermsInInputFormat = {
  duration: secondsToDays(loanWithLenderAccruing.durationSeconds.toNumber()),
  interestRate: loanWithLenderAccruing.perAnumInterestRate.toNumber() / 10.0,
  loan: loanWithLenderAccruing,
  loanAmount: parseFloat(
    formatUnits(
      loanWithLenderAccruing.loanAmount.toString(),
      loanWithLenderAccruing.loanAssetDecimals,
    ),
  ),
};

describe('LoanForm', () => {
  describe('LoanFormBetterTerms', () => {
    describe('hasTenPercentImprovement', () => {
      it('returns false for identical loan terms', () => {
        const duration = '3';
        const interestRate = '10';
        const loanAmount = '10';

        expect(
          hasTenPercentImprovement({
            duration,
            interestRate,
            loan: loanWithLenderAccruing,
            loanAmount,
          }),
        ).toBeFalsy();
      });

      it('returns false for worse loan terms', () => {
        const duration = '2';
        const interestRate = '40.7304';
        const loanAmount = '5';

        expect(
          hasTenPercentImprovement({
            duration,
            interestRate,
            loan: loanWithLenderAccruing,
            loanAmount,
          }),
        ).toBeFalsy();
      });

      it('returns false for unparseable loan terms', () => {
        const duration = '';
        const interestRate = '';
        const loanAmount = 'qqq';

        expect(
          hasTenPercentImprovement({
            duration,
            interestRate,
            loan: loanWithLenderAccruing,
            loanAmount,
          }),
        ).toBeFalsy();
      });

      it('returns false for almost-improved-enough loan terms', () => {
        const improvedDuration = loanWithLenderAccruing.durationSeconds
          .add(loanWithLenderAccruing.durationSeconds.div(10))
          .sub(1); // not improved enough

        expect(
          hasTenPercentImprovement({
            duration: secondsToDays(improvedDuration.toNumber()).toString(),
            interestRate: currentTermsInInputFormat.interestRate.toString(),
            loan: loanWithLenderAccruing,
            loanAmount: currentTermsInInputFormat.loanAmount.toString(),
          }),
        ).toBeFalsy();
      });

      it('returns true when at least one loan term is improved', () => {
        const improvedRate =
          currentTermsInInputFormat.interestRate -
          currentTermsInInputFormat.interestRate / 10;
        const improvedDuration =
          currentTermsInInputFormat.duration +
          currentTermsInInputFormat.duration / 10;
        const improvedAmount =
          currentTermsInInputFormat.loanAmount +
          currentTermsInInputFormat.loanAmount / 10;

        expect(
          hasTenPercentImprovement({
            duration: currentTermsInInputFormat.duration.toString(),
            interestRate: improvedRate.toString(),
            loan: loanWithLenderAccruing,
            loanAmount: currentTermsInInputFormat.loanAmount.toString(),
          }),
        ).toBeTruthy();

        expect(
          hasTenPercentImprovement({
            duration: improvedDuration.toString(),
            interestRate: loanWithLenderAccruing.perAnumInterestRate.toString(),
            loan: loanWithLenderAccruing,
            loanAmount: currentTermsInInputFormat.loanAmount.toString(),
          }),
        ).toBeTruthy();

        expect(
          hasTenPercentImprovement({
            duration: currentTermsInInputFormat.duration.toString(),
            interestRate: loanWithLenderAccruing.perAnumInterestRate.toString(),
            loan: loanWithLenderAccruing,
            loanAmount: improvedAmount.toString(),
          }),
        ).toBeTruthy();
      });
    });
  });
});

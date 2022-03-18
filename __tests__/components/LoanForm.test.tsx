import { loanWithLenderAccruing } from 'lib/mockData';
import { hasTenPercentImprovement } from 'components/LoanForm/LoanFormBetterTerms/LoanFormBetterTerms';

describe('LoanForm', () => {
  describe('LoanFormBetterTerms', () => {
    describe('hasTenPercentImprovement', () => {
      it('returns false for identical loan terms', () => {
        const duration = '3';
        const interestRate = '4.7304';
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
        const duration = '3.2';
        const interestRate = '4.4304';
        const loanAmount = '10.9';

        expect(
          hasTenPercentImprovement({
            duration,
            interestRate,
            loan: loanWithLenderAccruing,
            loanAmount,
          }),
        ).toBeFalsy();
      });

      it('returns true when at least one loan term is improved', () => {
        const duration = '3';
        const interestRate = '4.7304';
        const loanAmount = '10';

        expect(
          hasTenPercentImprovement({
            duration: '3.3',
            interestRate,
            loan: loanWithLenderAccruing,
            loanAmount,
          }),
        ).toBeTruthy();

        expect(
          hasTenPercentImprovement({
            duration,
            interestRate: '4.0',
            loan: loanWithLenderAccruing,
            loanAmount,
          }),
        ).toBeTruthy();

        expect(
          hasTenPercentImprovement({
            duration,
            interestRate,
            loan: loanWithLenderAccruing,
            loanAmount: '11',
          }),
        ).toBeTruthy();
      });
    });
  });
});

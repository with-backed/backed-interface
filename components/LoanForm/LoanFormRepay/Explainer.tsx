import { Explainer as ExplainerWrapper } from 'components/Explainer';

type ExplainerProps = {
  top: number;
};

export const Explainer = ({ top }: ExplainerProps) => {
  return (
    <ExplainerWrapper top={top}>
      <Repay />
    </ExplainerWrapper>
  );
};

function Repay() {
  return (
    <div>
      ”Repay and claim” will pay this amount, close the loan, and transfer the
      collateral to your wallet.
    </div>
  );
}

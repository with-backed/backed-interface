import { Explainer as ExplainerWrapper } from 'components/Explainer';

type ExplainerProps = {
  top: number;
};

export const Explainer = ({ top }: ExplainerProps) => {
  return (
    <ExplainerWrapper top={top}>
      <SeizeNFT />
    </ExplainerWrapper>
  );
};

function SeizeNFT() {
  return (
    <div>
      Because the Borrower has not repaid the loan, as the Lender you have the
      opportunity to seize the collateral NFT. If you choose to wait, the
      Borrower could still repay, and another Lender could still buy you out.
      Seizing the NFT will close the loan.
    </div>
  );
}

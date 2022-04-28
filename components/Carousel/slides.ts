import borrower from './images/borrower.png';
import contract from './images/contract.png';
import mintBorrow from './images/mint-borrow.png';
import potentialLenders from './images/potential-lenders.png';
import depositRequested from './images/deposit-requested.png';
import transferLoanPrincipal from './images/transfer-loan-principal.png';
import loanMatures from './images/loan-matures.png';
import otherLenders from './images/other-lenders.png';
import toBuyOut from './images/to-buy-out.png';
import buyOut from './images/buy-out.png';
import durationRestart from './images/duration-restart.png';
import repay from './images/repay.png';
import fundsSent from './images/funds-sent.png';
import notRepay from './images/not-repay.png';
import continuedAvailability from './images/continued-availability.png';
import perpetualBuyouts from './images/perpetual-buyouts.png';

type Slide = {
  image: string | StaticImageData;
  text: string;
};

export const slides: Slide[] = [
  {
    image: borrower,
    text: 'To create a loan, a borrower first selects an NFT of theirs to use as collateral.',
  },
  {
    image: contract,
    text: 'The borrower gives the Backed contract permission to hold the NFT until the loan is closed, and sets the loan terms they want: amount, duration, and interest rate.',
  },
  {
    image: mintBorrow,
    text: 'Backed mints a new NFT, the Borrower Ticket, to record the terms of the contract and provide a receipt to the Borrower.',
  },
  {
    image: potentialLenders,
    text: 'The loan offering is public! Potential lenders can now see the collateral and the terms.',
  },
  {
    image: depositRequested,
    text: 'If a potential lender likes the terms and collateral, they can deposit the requested loan amount.',
  },
  {
    image: transferLoanPrincipal,
    text: 'The Backed Contract transfers the loan principal to the Borrower (minus a 1% fee) and simultaneously mints a Lender Ticket NFT to the Lender as a receipt.',
  },
  {
    image: loanMatures,
    text: 'The loan is now active! As the loan matures, the Backed Contract keeps track of accrued interest owed by the Borrower.',
  },
  {
    image: otherLenders,
    text: 'Active loans are visible to other Lenders, who may “buy out” the loan by offering better terms to the Borrower, such as a lower interest rate or a longer duration.',
  },
  {
    image: toBuyOut,
    text: 'To buy out the loan, a new lender deposits the full principal as well as the amount of interest that has accrued so far.',
  },
  {
    image: buyOut,
    text: 'The Backed Contract pays out the original lender (the loan principal plus interest for the time they held the loan) and transfers the Lender Ticket to the new Lender.',
  },
  {
    image: durationRestart,
    text: 'The duration of the loan restarts from zero, and the Backed Contract keeps track of interest as it accrues to the new Lender.',
  },
  {
    image: repay,
    text: 'At the end of the loan term, the Borrower may repay the loan principal and interest accrued across all Lenders.',
  },
  {
    image: fundsSent,
    text: 'All funds are sent to the current Lender, the collateral NFT can be reclaimed by the Borrower, and the loan is closed.',
  },
  {
    image: notRepay,
    text: 'Alternatively, the Borrower may choose NOT to repay the loan. In this case, the Current Lender may seize the NFT and the loan is closed.',
  },
  {
    image: continuedAvailability,
    text: 'But as long as the collateral NFT is not collected by the Borrower (through repayment) or the Lender (if the loan is past due), the loan continues to be availble to other Lenders.',
  },
  {
    image: perpetualBuyouts,
    text: 'In this way, the loan my be perpetually bought out by lender after lender, each offering better terms than the last, until optimal loan terms are discovered.',
  },
];

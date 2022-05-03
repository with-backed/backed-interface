type Slide = {
  image: string;
  text: string;
};

export const slides: Slide[] = [
  {
    image: '/carousel-images/borrower.png',
    text: 'To create a loan, a borrower first selects an NFT of theirs to use as collateral.',
  },
  {
    image: '/carousel-images/contract.png',
    text: 'The borrower gives the Backed contract permission to hold the NFT until the loan is closed, and sets the loan terms they want: amount, duration, and interest rate.',
  },
  {
    image: '/carousel-images/mint-borrow.png',
    text: 'Backed mints a new NFT, the Borrower Ticket, to record the terms of the contract and provide a receipt to the Borrower.',
  },
  {
    image: '/carousel-images/potential-lenders.png',
    text: 'The loan offering is public! Potential lenders can now see the collateral and the terms.',
  },
  {
    image: '/carousel-images/deposit-requested.png',
    text: 'If a potential lender likes the terms and collateral, they can deposit the requested loan amount.',
  },
  {
    image: '/carousel-images/transfer-loan-principal.png',
    text: 'The Backed Contract transfers the loan principal to the Borrower (minus a 1% fee) and simultaneously mints a Lender Ticket NFT to the Lender as a receipt.',
  },
  {
    image: '/carousel-images/loan-matures.png',
    text: 'The loan is now active! As the loan matures, the Backed Contract keeps track of accrued interest owed by the Borrower.',
  },
  {
    image: '/carousel-images/other-lenders.png',
    text: 'Active loans are visible to other Lenders, who may “buy out” the loan by offering better terms to the Borrower, such as a lower interest rate or a longer duration.',
  },
  {
    image: '/carousel-images/to-buy-out.png',
    text: 'To buy out the loan, a new lender deposits the full principal as well as the amount of interest that has accrued so far.',
  },
  {
    image: '/carousel-images/buy-out.png',
    text: 'The Backed Contract pays out the original lender (the loan principal plus interest for the time they held the loan) and transfers the Lender Ticket to the new Lender.',
  },
  {
    image: '/carousel-images/duration-restart.png',
    text: 'The duration of the loan restarts from zero, and the Backed Contract keeps track of interest as it accrues to the new Lender.',
  },
  {
    image: '/carousel-images/repay.png',
    text: 'At the end of the loan term, the Borrower may repay the loan principal and interest accrued across all Lenders.',
  },
  {
    image: '/carousel-images/funds-sent.png',
    text: 'All funds are sent to the current Lender, the collateral NFT can be reclaimed by the Borrower, and the loan is closed.',
  },
  {
    image: '/carousel-images/not-repay.png',
    text: 'Alternatively, the Borrower may choose NOT to repay the loan. In this case, the Current Lender may seize the NFT and the loan is closed.',
  },
  {
    image: '/carousel-images/continued-availability.png',
    text: 'But as long as the collateral NFT is not collected by the Borrower (through repayment) or the Lender (if the loan is past due), the loan continues to be available to other Lenders.',
  },
  {
    image: '/carousel-images/perpetual-buyouts.png',
    text: 'In this way, the loan my be perpetually bought out by lender after lender, each offering better terms than the last, until optimal loan terms are discovered.',
  },
];

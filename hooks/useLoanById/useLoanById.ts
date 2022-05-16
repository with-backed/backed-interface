import { ethers } from 'ethers';
import { useConfig } from 'hooks/useConfig';
import { SupportedNetwork } from 'lib/config';
import { loanById } from 'lib/loans/loanById';
import { useEffect, useState } from 'react';
import { Loan } from 'types/Loan';

export function useLoanById(loanId: ethers.BigNumber) {
  const { jsonRpcProvider, network, nftBackedLoansSubgraph } = useConfig();
  const [loan, setLoan] = useState<Loan | null>(null);

  useEffect(() => {
    loanById(
      loanId.toString(),
      nftBackedLoansSubgraph,
      jsonRpcProvider,
      network as SupportedNetwork,
    ).then(setLoan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return loan;
}

import { SNS } from 'aws-sdk';
import { Loan } from 'types/generated/graphql/nftLoans';

const snsConfig = {
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
};

//TODO(adamgobes): fill this out with actual pushing of message to SNS -- to be implemented in follow up PR
export function pushEventForProcessing(_involvedAddress: string, _loan: Loan) {}

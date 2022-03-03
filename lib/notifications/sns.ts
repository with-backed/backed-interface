import { SNS } from 'aws-sdk';

const snsConfig = {
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
};

export function pushToTopic(topicUrl: string) {
  const sns = new SNS(snsConfig);
  sns.publish();
}

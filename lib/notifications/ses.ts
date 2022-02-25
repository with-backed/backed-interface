import aws from 'aws-sdk';

const sesConfig = {
  region: 'us-east-1', // Change it to match your region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
};

export async function executeEmailSendWithSes(
  params: aws.SES.Types.SendEmailRequest,
): Promise<void> {
  const res = await new aws.SES(sesConfig).sendEmail(params).promise();
  if (!!res.$response.error) {
    console.error(res.$response.error);
  }
}

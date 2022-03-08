import aws from 'aws-sdk';

const sesConfig = {
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AMAZON_WEB_SERVICES_ACCESS_KEY!,
    secretAccessKey: process.env.AMAZON_WEB_SERVICES_SECRET_KEY!,
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

import aws from 'aws-sdk';
import { awsConfig } from 'lib/aws/config';

export async function executeEmailSendWithSes(
  params: aws.SES.Types.SendEmailRequest,
): Promise<void> {
  const res = await new aws.SES(awsConfig).sendEmail(params).promise();
  if (!!res.$response.error) {
    console.error(res.$response.error);
  }
}

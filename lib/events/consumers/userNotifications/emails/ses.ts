import aws from 'aws-sdk';
import { awsConfig } from 'lib/aws/config';

const baseParams: aws.SES.Types.SendEmailRequest = {
  Source: process.env.BACKED_NOTIFICATIONS_EMAIL_ADDRESS!,
  Destination: {
    ToAddresses: [],
  },
  ReplyToAddresses: [process.env.BACKED_NOTIFICATIONS_EMAIL_ADDRESS!],
  Message: {
    Body: {
      Html: {
        Charset: 'UTF-8',
        Data: '',
      },
    },
    Subject: {
      Charset: 'UTF-8',
      Data: '',
    },
  },
};

export async function executeEmailSendWithSes(
  html: string,
  subject: string,
  toAddress: string,
): Promise<aws.AWSError | null> {
  const params: aws.SES.Types.SendEmailRequest = {
    ...baseParams,
    Destination: {
      ToAddresses: [toAddress],
    },
  };
  params.Message.Body.Html!.Data = html;
  params.Message.Subject.Data = subject;

  const res = await new aws.SES(awsConfig).sendEmail(params).promise();

  return res.$response.error || null;
}

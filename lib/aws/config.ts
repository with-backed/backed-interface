export const awsConfig = {
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AMAZON_WEB_SERVICES_ACCESS_KEY!,
    secretAccessKey: process.env.AMAZON_WEB_SERVICES_SECRET_KEY!,
  },
};

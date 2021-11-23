declare module '@pinata/ipfs-gateway-tools/dist/node' {
  export default class IPFSGatewayTools {
    containsCID(url: string): { containsCid: boolean; cid?: string };
    convertToDesiredGateway(
      sourceUrl: string,
      desiredGatewayPrefix: string,
    ): string;
  }
}

import { ethers, Wallet } from 'ethers';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient from '@gnosis.pm/safe-service-client';
import Safe from '@gnosis.pm/safe-core-sdk';
import CommunityNFTABI from 'abis/CommunityNFT.json';

export type PendingChanges = {
  type: 'CATEGORY' | 'ACCESSORY';
  id: string;
  account: string;
  value: number;
  ipfsLink: string;
};

export async function getPendingMultiSigChanges(): Promise<{
  [key: number]: PendingChanges[];
}> {
  const safeAddress = process.env.COMMUNITY_NFT_MULTISIG!;
  const { safeService, safeSdk } = await initGnosisSdk(safeAddress);

  const pendingTransactions = await safeService.getPendingTransactions(
    safeAddress,
  );

  const iface = new ethers.utils.Interface(CommunityNFTABI.abi);

  const nonceToData: { [key: number]: PendingChanges[] } = {};

  pendingTransactions.results.forEach((result) => {
    let decodedFunctionData;
    try {
      decodedFunctionData = iface.decodeFunctionData(
        'changeCategoryScores(tuple(address addr, string categoryId, int256 value, string ipfsLink)[])',
        result.data!,
      ).changes;
      nonceToData[result.nonce] = decodedFunctionData.map((change: any) => ({
        type: 'CATEGORY',
        id: change.categoryId,
        account: change.user,
        value: change.value,
        ipfsLink: change.ipfsLink,
      }));
    } catch {
      decodedFunctionData = iface.decodeFunctionData(
        'changeAccessoryLocks(tuple(address addr, bool unlock, uint256 accessoryId, string ipfsLink)[])',
        result.data!,
      ).changes;
      nonceToData[result.nonce] = decodedFunctionData.map((change: any) => ({
        type: 'ACCESSORY',
        id: change.accessoryId.toString(),
        account: change.user,
        value: change.unlock ? 1 : 0,
        ipfsLink: change.ipfsLink,
      }));
    }
  });

  return nonceToData;
}

async function initGnosisSdk(safeAddress: string) {
  const ethAdapter = new EthersAdapter({
    ethers,
    signer: new Wallet(process.env.GNOSIS_SAFE_OWNER_PK!, getAlchemyProvider()),
  });
  const txServiceUrl = process.env.GNOSIS_TX_SERVICE_URL!;
  const safeService = new SafeServiceClient({
    txServiceUrl,
    ethAdapter,
  });

  const safeSdk = await Safe.create({ ethAdapter, safeAddress });

  return {
    safeService,
    safeSdk,
  };
}

export function getAlchemyProvider() {
  return new ethers.providers.AlchemyProvider(
    10,
    '_K-HnfZvE5ChalM8ys4TQEkmsWn8CPTU',
  );
}

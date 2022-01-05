/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from 'ethers';
import { Provider, TransactionRequest } from '@ethersproject/providers';
import type { MockPUNK, MockPUNKInterface } from '../MockPUNK';

const _abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'approved',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'ApprovalForAll',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'getApproved',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'isApprovedForAll',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'mintTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'ownerOf',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const _bytecode =
  '0x60806040526103e86006553480156200001757600080fd5b506040518060400160405280600b81526020017f43727970746f50756e6b730000000000000000000000000000000000000000008152506040518060400160405280600581526020017f50554e4b5300000000000000000000000000000000000000000000000000000081525081600090805190602001906200009c929190620000be565b508060019080519060200190620000b5929190620000be565b505050620001d3565b828054620000cc906200016e565b90600052602060002090601f016020900481019282620000f057600085556200013c565b82601f106200010b57805160ff19168380011785556200013c565b828001600101855582156200013c579182015b828111156200013b5782518255916020019190600101906200011e565b5b5090506200014b91906200014f565b5090565b5b808211156200016a57600081600090555060010162000150565b5090565b600060028204905060018216806200018757607f821691505b602082108114156200019e576200019d620001a4565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b61279180620001e36000396000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c80636352211e11610097578063a22cb46511610066578063a22cb46514610270578063b88d4fde1461028c578063c87b56dd146102a8578063e985e9c5146102d8576100f5565b80636352211e146101d657806370a0823114610206578063755edd171461023657806395d89b4114610252576100f5565b8063095ea7b3116100d3578063095ea7b3146101785780631249c58b1461019457806323b872dd1461019e57806342842e0e146101ba576100f5565b806301ffc9a7146100fa57806306fdde031461012a578063081812fc14610148575b600080fd5b610114600480360381019061010f9190611913565b610308565b6040516101219190611cdf565b60405180910390f35b6101326103ea565b60405161013f9190611cfa565b60405180910390f35b610162600480360381019061015d919061196d565b61047c565b60405161016f9190611c78565b60405180910390f35b610192600480360381019061018d91906118d3565b610501565b005b61019c610619565b005b6101b860048036038101906101b391906117bd565b610624565b005b6101d460048036038101906101cf91906117bd565b610684565b005b6101f060048036038101906101eb919061196d565b6106a4565b6040516101fd9190611c78565b60405180910390f35b610220600480360381019061021b9190611750565b610756565b60405161022d9190611edc565b60405180910390f35b610250600480360381019061024b9190611750565b61080e565b005b61025a610841565b6040516102679190611cfa565b60405180910390f35b61028a60048036038101906102859190611893565b6108d3565b005b6102a660048036038101906102a19190611810565b610a54565b005b6102c260048036038101906102bd919061196d565b610ab6565b6040516102cf9190611cfa565b60405180910390f35b6102f260048036038101906102ed919061177d565b610b5d565b6040516102ff9190611cdf565b60405180910390f35b60007f80ac58cd000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614806103d357507f5b5e139f000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b806103e357506103e282610bf1565b5b9050919050565b6060600080546103f990612101565b80601f016020809104026020016040519081016040528092919081815260200182805461042590612101565b80156104725780601f1061044757610100808354040283529160200191610472565b820191906000526020600020905b81548152906001019060200180831161045557829003601f168201915b5050505050905090565b600061048782610c5b565b6104c6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104bd90611e3c565b60405180910390fd5b6004600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b600061050c826106a4565b90508073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141561057d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161057490611e9c565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff1661059c610cc7565b73ffffffffffffffffffffffffffffffffffffffff1614806105cb57506105ca816105c5610cc7565b610b5d565b5b61060a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161060190611dbc565b60405180910390fd5b6106148383610ccf565b505050565b6106223361080e565b565b61063561062f610cc7565b82610d88565b610674576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161066b90611ebc565b60405180910390fd5b61067f838383610e66565b505050565b61069f83838360405180602001604052806000815250610a54565b505050565b6000806002600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16141561074d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161074490611dfc565b60405180910390fd5b80915050919050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156107c7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107be90611ddc565b60405180910390fd5b600360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b61083e816006600081548092919061082590612164565b91905055604051806020016040528060008152506110c2565b50565b60606001805461085090612101565b80601f016020809104026020016040519081016040528092919081815260200182805461087c90612101565b80156108c95780601f1061089e576101008083540402835291602001916108c9565b820191906000526020600020905b8154815290600101906020018083116108ac57829003601f168201915b5050505050905090565b6108db610cc7565b73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610949576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161094090611d7c565b60405180910390fd5b8060056000610956610cc7565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff16610a03610cc7565b73ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051610a489190611cdf565b60405180910390a35050565b610a65610a5f610cc7565b83610d88565b610aa4576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a9b90611ebc565b60405180910390fd5b610ab08484848461111d565b50505050565b6060610ac182610c5b565b610b00576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610af790611e7c565b60405180910390fd5b6000610b0a611179565b90506000815111610b2a5760405180602001604052806000815250610b55565b80610b3484611199565b604051602001610b45929190611c54565b6040516020818303038152906040525b915050919050565b6000600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b60007f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149050919050565b60008073ffffffffffffffffffffffffffffffffffffffff166002600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614159050919050565b600033905090565b816004600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff16610d42836106a4565b73ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b6000610d9382610c5b565b610dd2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610dc990611d9c565b60405180910390fd5b6000610ddd836106a4565b90508073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161480610e4c57508373ffffffffffffffffffffffffffffffffffffffff16610e348461047c565b73ffffffffffffffffffffffffffffffffffffffff16145b80610e5d5750610e5c8185610b5d565b5b91505092915050565b8273ffffffffffffffffffffffffffffffffffffffff16610e86826106a4565b73ffffffffffffffffffffffffffffffffffffffff1614610edc576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ed390611e5c565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610f4c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f4390611d5c565b60405180910390fd5b610f578383836112fa565b610f62600082610ccf565b6001600360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610fb29190612017565b925050819055506001600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546110099190611f90565b92505081905550816002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4505050565b6110cc83836112ff565b6110d960008484846114cd565b611118576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161110f90611d1c565b60405180910390fd5b505050565b611128848484610e66565b611134848484846114cd565b611173576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161116a90611d1c565b60405180910390fd5b50505050565b606060405180606001604052806031815260200161272b60319139905090565b606060008214156111e1576040518060400160405280600181526020017f300000000000000000000000000000000000000000000000000000000000000081525090506112f5565b600082905060005b600082146112135780806111fc90612164565b915050600a8261120c9190611fe6565b91506111e9565b60008167ffffffffffffffff81111561122f5761122e61229a565b5b6040519080825280601f01601f1916602001820160405280156112615781602001600182028036833780820191505090505b5090505b600085146112ee5760018261127a9190612017565b9150600a8561128991906121ad565b60306112959190611f90565b60f81b8183815181106112ab576112aa61226b565b5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600a856112e79190611fe6565b9450611265565b8093505050505b919050565b505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561136f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161136690611e1c565b60405180910390fd5b61137881610c5b565b156113b8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016113af90611d3c565b60405180910390fd5b6113c4600083836112fa565b6001600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546114149190611f90565b92505081905550816002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a45050565b60006114ee8473ffffffffffffffffffffffffffffffffffffffff16611664565b15611657578373ffffffffffffffffffffffffffffffffffffffff1663150b7a02611517610cc7565b8786866040518563ffffffff1660e01b81526004016115399493929190611c93565b602060405180830381600087803b15801561155357600080fd5b505af192505050801561158457506040513d601f19601f820116820180604052508101906115819190611940565b60015b611607573d80600081146115b4576040519150601f19603f3d011682016040523d82523d6000602084013e6115b9565b606091505b506000815114156115ff576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016115f690611d1c565b60405180910390fd5b805181602001fd5b63150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161491505061165c565b600190505b949350505050565b600080823b905060008111915050919050565b600061168a61168584611f1c565b611ef7565b9050828152602081018484840111156116a6576116a56122ce565b5b6116b18482856120bf565b509392505050565b6000813590506116c8816126ce565b92915050565b6000813590506116dd816126e5565b92915050565b6000813590506116f2816126fc565b92915050565b600081519050611707816126fc565b92915050565b600082601f830112611722576117216122c9565b5b8135611732848260208601611677565b91505092915050565b60008135905061174a81612713565b92915050565b600060208284031215611766576117656122d8565b5b6000611774848285016116b9565b91505092915050565b60008060408385031215611794576117936122d8565b5b60006117a2858286016116b9565b92505060206117b3858286016116b9565b9150509250929050565b6000806000606084860312156117d6576117d56122d8565b5b60006117e4868287016116b9565b93505060206117f5868287016116b9565b92505060406118068682870161173b565b9150509250925092565b6000806000806080858703121561182a576118296122d8565b5b6000611838878288016116b9565b9450506020611849878288016116b9565b935050604061185a8782880161173b565b925050606085013567ffffffffffffffff81111561187b5761187a6122d3565b5b6118878782880161170d565b91505092959194509250565b600080604083850312156118aa576118a96122d8565b5b60006118b8858286016116b9565b92505060206118c9858286016116ce565b9150509250929050565b600080604083850312156118ea576118e96122d8565b5b60006118f8858286016116b9565b92505060206119098582860161173b565b9150509250929050565b600060208284031215611929576119286122d8565b5b6000611937848285016116e3565b91505092915050565b600060208284031215611956576119556122d8565b5b6000611964848285016116f8565b91505092915050565b600060208284031215611983576119826122d8565b5b60006119918482850161173b565b91505092915050565b6119a38161204b565b82525050565b6119b28161205d565b82525050565b60006119c382611f4d565b6119cd8185611f63565b93506119dd8185602086016120ce565b6119e6816122dd565b840191505092915050565b60006119fc82611f58565b611a068185611f74565b9350611a168185602086016120ce565b611a1f816122dd565b840191505092915050565b6000611a3582611f58565b611a3f8185611f85565b9350611a4f8185602086016120ce565b80840191505092915050565b6000611a68603283611f74565b9150611a73826122ee565b604082019050919050565b6000611a8b601c83611f74565b9150611a968261233d565b602082019050919050565b6000611aae602483611f74565b9150611ab982612366565b604082019050919050565b6000611ad1601983611f74565b9150611adc826123b5565b602082019050919050565b6000611af4602c83611f74565b9150611aff826123de565b604082019050919050565b6000611b17603883611f74565b9150611b228261242d565b604082019050919050565b6000611b3a602a83611f74565b9150611b458261247c565b604082019050919050565b6000611b5d602983611f74565b9150611b68826124cb565b604082019050919050565b6000611b80602083611f74565b9150611b8b8261251a565b602082019050919050565b6000611ba3602c83611f74565b9150611bae82612543565b604082019050919050565b6000611bc6602983611f74565b9150611bd182612592565b604082019050919050565b6000611be9602f83611f74565b9150611bf4826125e1565b604082019050919050565b6000611c0c602183611f74565b9150611c1782612630565b604082019050919050565b6000611c2f603183611f74565b9150611c3a8261267f565b604082019050919050565b611c4e816120b5565b82525050565b6000611c608285611a2a565b9150611c6c8284611a2a565b91508190509392505050565b6000602082019050611c8d600083018461199a565b92915050565b6000608082019050611ca8600083018761199a565b611cb5602083018661199a565b611cc26040830185611c45565b8181036060830152611cd481846119b8565b905095945050505050565b6000602082019050611cf460008301846119a9565b92915050565b60006020820190508181036000830152611d1481846119f1565b905092915050565b60006020820190508181036000830152611d3581611a5b565b9050919050565b60006020820190508181036000830152611d5581611a7e565b9050919050565b60006020820190508181036000830152611d7581611aa1565b9050919050565b60006020820190508181036000830152611d9581611ac4565b9050919050565b60006020820190508181036000830152611db581611ae7565b9050919050565b60006020820190508181036000830152611dd581611b0a565b9050919050565b60006020820190508181036000830152611df581611b2d565b9050919050565b60006020820190508181036000830152611e1581611b50565b9050919050565b60006020820190508181036000830152611e3581611b73565b9050919050565b60006020820190508181036000830152611e5581611b96565b9050919050565b60006020820190508181036000830152611e7581611bb9565b9050919050565b60006020820190508181036000830152611e9581611bdc565b9050919050565b60006020820190508181036000830152611eb581611bff565b9050919050565b60006020820190508181036000830152611ed581611c22565b9050919050565b6000602082019050611ef16000830184611c45565b92915050565b6000611f01611f12565b9050611f0d8282612133565b919050565b6000604051905090565b600067ffffffffffffffff821115611f3757611f3661229a565b5b611f40826122dd565b9050602081019050919050565b600081519050919050565b600081519050919050565b600082825260208201905092915050565b600082825260208201905092915050565b600081905092915050565b6000611f9b826120b5565b9150611fa6836120b5565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115611fdb57611fda6121de565b5b828201905092915050565b6000611ff1826120b5565b9150611ffc836120b5565b92508261200c5761200b61220d565b5b828204905092915050565b6000612022826120b5565b915061202d836120b5565b9250828210156120405761203f6121de565b5b828203905092915050565b600061205682612095565b9050919050565b60008115159050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b82818337600083830152505050565b60005b838110156120ec5780820151818401526020810190506120d1565b838111156120fb576000848401525b50505050565b6000600282049050600182168061211957607f821691505b6020821081141561212d5761212c61223c565b5b50919050565b61213c826122dd565b810181811067ffffffffffffffff8211171561215b5761215a61229a565b5b80604052505050565b600061216f826120b5565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8214156121a2576121a16121de565b5b600182019050919050565b60006121b8826120b5565b91506121c3836120b5565b9250826121d3576121d261220d565b5b828206905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560008201527f63656976657220696d706c656d656e7465720000000000000000000000000000602082015250565b7f4552433732313a20746f6b656e20616c7265616479206d696e74656400000000600082015250565b7f4552433732313a207472616e7366657220746f20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b7f4552433732313a20617070726f766520746f2063616c6c657200000000000000600082015250565b7f4552433732313a206f70657261746f7220717565727920666f72206e6f6e657860008201527f697374656e7420746f6b656e0000000000000000000000000000000000000000602082015250565b7f4552433732313a20617070726f76652063616c6c6572206973206e6f74206f7760008201527f6e6572206e6f7220617070726f76656420666f7220616c6c0000000000000000602082015250565b7f4552433732313a2062616c616e636520717565727920666f7220746865207a6560008201527f726f206164647265737300000000000000000000000000000000000000000000602082015250565b7f4552433732313a206f776e657220717565727920666f72206e6f6e657869737460008201527f656e7420746f6b656e0000000000000000000000000000000000000000000000602082015250565b7f4552433732313a206d696e7420746f20746865207a65726f2061646472657373600082015250565b7f4552433732313a20617070726f76656420717565727920666f72206e6f6e657860008201527f697374656e7420746f6b656e0000000000000000000000000000000000000000602082015250565b7f4552433732313a207472616e73666572206f6620746f6b656e2074686174206960008201527f73206e6f74206f776e0000000000000000000000000000000000000000000000602082015250565b7f4552433732314d657461646174613a2055524920717565727920666f72206e6f60008201527f6e6578697374656e7420746f6b656e0000000000000000000000000000000000602082015250565b7f4552433732313a20617070726f76616c20746f2063757272656e74206f776e6560008201527f7200000000000000000000000000000000000000000000000000000000000000602082015250565b7f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60008201527f776e6572206e6f7220617070726f766564000000000000000000000000000000602082015250565b6126d78161204b565b81146126e257600080fd5b50565b6126ee8161205d565b81146126f957600080fd5b50565b61270581612069565b811461271057600080fd5b50565b61271c816120b5565b811461272757600080fd5b5056fe68747470733a2f2f7772617070656470756e6b732e636f6d3a333030302f6170692f70756e6b732f6d657461646174612fa26469706673582212208abceedbedbe5fbd5db84708838f3be546b329b8a514ed0b6543d4d9a94b7e6764736f6c63430008060033';

export class MockPUNK__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<MockPUNK> {
    return super.deploy(overrides || {}) as Promise<MockPUNK>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): MockPUNK {
    return super.attach(address) as MockPUNK;
  }
  connect(signer: Signer): MockPUNK__factory {
    return super.connect(signer) as MockPUNK__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockPUNKInterface {
    return new utils.Interface(_abi) as MockPUNKInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider,
  ): MockPUNK {
    return new Contract(address, _abi, signerOrProvider) as MockPUNK;
  }
}
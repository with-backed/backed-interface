const localLoanAssetsURI = '/loanAssets/local.json'
const rinkebyLoanAssetsURI = '/loanAssets/rinkeby.json'
const mainnetLoanAssetsURI = 'https://tokens.coingecko.com/uniswap/all.json'

export interface LoanAsset {
    address: string;
    symbol: string;
}

export const getLoanAssets = async () => {
    switch(process.env.NEXT_PUBLIC_ENV) {
        case 'local':
            return await loadJson(localLoanAssetsURI)
            break;
        case 'rinkeby':
            return await loadJson(rinkebyLoanAssetsURI)
            break;
        case 'mainnet':
            return await loadJson(mainnetLoanAssetsURI)
            break;
    }
}

const loadJson = async (uri: string) => {
    const response = await fetch(uri)
    const json = await response.json()
    return json['tokens']
}
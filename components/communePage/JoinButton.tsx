import { ethers, BigNumber } from "ethers";
import { Button } from 'semantic-ui-react'

export default function JoinButton({account, communeContract, communeID, setIsLoading, didJoin}) {
  const join = async () => {
    communeContract.joinCommune(BigInt(communeID)).then((receipt) => {
        setIsLoading(true)
        waitForJoin()
      })
      .catch(err => {
        console.log(err)
      })
  }

  const waitForJoin = () => {
    
    const filter = communeContract.filters.AddCommuneMember(account, BigNumber.from(communeID))

    communeContract.once(filter, (account, commune) => {
      console.log("in add commune member filter")
      didJoin()
      setIsLoading(false)
    });
  }

  return(
     <Button basic color="blue" onClick={join}> join commune </Button> 
    )

}
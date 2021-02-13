import { ethers, BigNumber } from "ethers";
import { Button, Modal, Input } from 'semantic-ui-react'
import React, { useState } from 'react';

export default function RemoveMemberButton({communeContract, communeID, setIsLoading, didRemoveMember}) {
  const [open, setOpen] = React.useState(false)
  const [address, setAddress] = React.useState("")
  const [isAddress, setIsAddress] = React.useState(true)
  const [isCommuneMember, setIsCommuneMember] = React.useState(true)
  
  const removeMember = async () => {
    if(!ethers.utils.isAddress(address)){
      setIsAddress(false)
      return
    }
    const isMember = await communeContract.isCommuneMember(BigInt(communeID), address)
    if(!isMember){
      setIsCommuneMember(false)
      return
    }
    setOpen(false)
    communeContract.removeCommuneMember(address, BigInt(communeID)).then((receipt) => {
        setIsLoading(true)
        waitForRemoveMember()
      })
      .catch(err => {
        console.log(err)
      })
  }

  const waitForRemoveMember = () => {
    
    const filter = communeContract.filters.RemoveCommuneMember(address, BigNumber.from(communeID))

    communeContract.once(filter, (account, commune) => {
      didRemoveMember()
      setIsLoading(false)
      setAddress("")
    });
  }

  const handleChange = (event) => {
    setAddress(event.target.value)

  }

  const clearErrors = () => {
    setIsAddress(true)
    setIsCommuneMember(true)
  }

  return(
    <Modal
        open={open}
        trigger={<Button onClick={() => setOpen(true)}> Remove Member </Button>}
        >
          <Modal.Header>Remove Member from Commune</Modal.Header>
          <Modal.Content>
            <Input error={!isAddress || !isCommuneMember} placeholder='Address' value={address} onChange={handleChange} onFocus={clearErrors}/>
            {!isAddress ? <p> Address is invalid </p> : ""}
            {!isCommuneMember ? <p> Address is not in Commune </p> : ""}
          </Modal.Content>
          <Modal.Actions>
            <Button
              onClick={() => setOpen(false)}
              
            >
              Cancel
            </Button>
            <Button
            negative
              onClick={
                () => {
                  removeMember()
                }
              }
              positive
            >
              Remove
            </Button>
          </Modal.Actions>
        </Modal>
    )

}
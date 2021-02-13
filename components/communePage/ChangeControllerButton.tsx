import { ethers, BigNumber } from "ethers";
import { Button, Modal, Input } from 'semantic-ui-react'
import React, { useState } from 'react';

export default function ChangeControllerButtton({communeContract, communeID, setIsLoading, didUpdateController}) {
  const [open, setOpen] = React.useState(false)
  const [address, setAddress] = React.useState("")
  const [isAddress, setIsAddress] = React.useState(true)
  
  const changeController = async () => {
    if(!ethers.utils.isAddress(address)){
      setIsAddress(false)
      return
    }
    setOpen(false)
    communeContract.updateCommuneController(address, BigInt(communeID)).then((receipt) => {
        setIsLoading(true)
        waitForChangeController()
      })
      .catch(err => {
        console.log(err)
      })
  }

  const waitForChangeController = () => {
    
    const filter = communeContract.filters.UpdateCommuneController(address, BigNumber.from(communeID))

    communeContract.once(filter, (account, commune) => {
      didUpdateController()
      setIsLoading(false)
      setAddress("")
    });
  }

  const handleChange = (event) => {
    setAddress(event.target.value)

  }

  const clearErrors = () => {
    setIsAddress(true)
  }

  return(
    <Modal
        open={open}
        trigger={<Button onClick={() => setOpen(true)}> Change Controller </Button>}
        >
          <Modal.Header>Change Commune Controller </Modal.Header>
          <Modal.Content>
          <p> Changing the controller will change who is allowed to add and remove (if applicable) members from the Commune. </p>
            <Input error={!isAddress} placeholder='Address' value={address} onChange={handleChange} onFocus={clearErrors}/>
            {!isAddress ? <p> Address is invalid </p> : ""}
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
                  changeController()
                }
              }
              positive
            >
              Change
            </Button>
          </Modal.Actions>
        </Modal>
    )

}
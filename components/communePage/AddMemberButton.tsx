import { ethers, BigNumber } from "ethers";
import { Button, Modal, Input } from 'semantic-ui-react'
import React, { useState } from 'react';

export default function AddMemberButton({communeContract, communeID, setIsLoading, didAddMember}) {
  const [open, setOpen] = React.useState(false)
  const [address, setAddress] = React.useState("")
  const [isError, setError] = React.useState(false)
  
  const addMember = async () => {
    if(!ethers.utils.isAddress(address)){
      setError(true)
      return
    }
    setOpen(false)
    const t = await communeContract.addCommuneMember(address, BigInt(communeID))
    t.wait().then((receipt) => {
        setIsLoading(true)
        waitForAddMember()
        setAddress("")
      })
      .catch(err => {
        console.log(err)
      })
  }

  const waitForAddMember = () => {
    
    const filter = communeContract.filters.AddCommuneMember(address, BigNumber.from(communeID))

    communeContract.once(filter, (account, commune) => {
      console.log("in add commune member filter")
      didAddMember()
      setIsLoading(false)
      setAddress("")
    });
  }

  const handleChange = (event) => {
    setAddress(event.target.value)

  }

  const clearErrors = () => {
    setError(false)
  }

  return(
    <Modal
        open={open}
        trigger={<Button onClick={() => setOpen(true)}> Add Member </Button>}
        >
          <Modal.Header>Add Member to Commune</Modal.Header>
          <Modal.Content>
            <Input onFocus={clearErrors} error={isError} placeholder='Address' value={address} onChange={handleChange}/>
            {isError ? <p> Address is invalid </p> : ""}
          </Modal.Content>
          <Modal.Actions>
            <Button
              onClick={() => setOpen(false)}
              negative
            >
              Cancel
            </Button>
            <Button

              onClick={
                () => {
                  addMember()
                }
              }
              positive
            >
              Add
            </Button>
          </Modal.Actions>
        </Modal>
    )

}
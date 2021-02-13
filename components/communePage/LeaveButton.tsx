import { ethers, BigNumber } from "ethers";
import { Button, Modal } from 'semantic-ui-react'
import React, { useState } from 'react';

export default function LeaveButton({account, communeContract, communeID, setIsLoading, didJoin}) {
  const leave = async () => {
    communeContract.leaveCommune(BigInt(communeID)).then((receipt) => {
        setIsLoading(true)
        waitForLeave()
      })
      .catch(err => {
        console.log(err)
      })
  }

  const waitForLeave = () => {
    
    const filter = communeContract.filters.RemoveCommuneMember(account, BigNumber.from(communeID))

    communeContract.once(filter, (account, commune) => {
      console.log("in remove commune member filter")
      console.log(account)
      console.log(commune)
      didJoin()
      setIsLoading(false)
    });
  }

  const [open, setOpen] = React.useState(false)

  return(
    <Modal
      open={open}
          trigger={<Button basic color="red" onClick={() => setOpen(true)}> Leave Commune </Button>}
        >
          <Modal.Header>Are you sure you want to leave?</Modal.Header>
          <Modal.Content>
            <p>You will permanently lose access to your funds in this Commune when you leave.
            Be sure to withdraw before leaving.</p>
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
                 setOpen(false)
                  leave()
                }
              }
              positive
            >
              Leave
            </Button>
          </Modal.Actions>
        </Modal>
    )

}
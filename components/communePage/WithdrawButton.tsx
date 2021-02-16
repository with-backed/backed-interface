import { ethers, BigNumber } from "ethers";
import { Button, Modal, Input } from 'semantic-ui-react'
import React, { useState } from 'react';

export default function WithdrawButton({balance, account, communeContract, communeID, setIsLoading, didWithdraw, assetDecimals}) {
  const [open, setOpen] = React.useState(false)
  const [withdrawAmount, setWithdrawAmount] = React.useState("0")
  
  const withdraw = async () => {
    const t= await communeContract.withdraw(account, account, BigInt(communeID), BigInt(parseFloat(withdrawAmount) * Math.pow(10,assetDecimals)))
    t.wait().then((receipt) => {
        didWithdraw()
        setIsLoading(false)
      })
      .catch(err => {
        console.log(err)
      })
  }

  const waitForWithdraw = () => {
    
    const filter = communeContract.filters.Withdraw(null, account, null, BigNumber.from(communeID))

    communeContract.once(filter, (account, commune) => {
      console.log("in add commune member filter")
      didWithdraw()
      setIsLoading(false)
    });
  }

  const handleChange = (event) => {
    setWithdrawAmount(event.target.value)
  }

  return(
    <Modal
        open={open}
        trigger={<Button basic color="green" onClick={() => setOpen(true)}> Withdraw Funds </Button>}
        >
          <Modal.Header>Are you sure you want to leave?</Modal.Header>
          <Modal.Content>
            <p> Balance: {balance} </p>
            <Input error={parseFloat(withdrawAmount) > balance || parseFloat(withdrawAmount) < 0} placeholder='Amount' type='number' value={withdrawAmount} onChange={handleChange}/>
            {parseFloat(withdrawAmount) > balance ? <p> Exceeds available balance </p> : ""}
            {parseFloat(withdrawAmount) < 0 ? <p> Cannot withdraw a negative amount </p> : ""}
          </Modal.Content>
          <Modal.Actions>
            <Button
              onClick={() => setOpen(false)}
              negative
            >
              Cancel
            </Button>
            <Button

            disabled={parseFloat(withdrawAmount) > balance || parseFloat(withdrawAmount) < 0}
              onClick={
                () => {
                  setOpen(false)
                  withdraw()
                }
              }
              positive
            >
              Withdraw
            </Button>
          </Modal.Actions>
        </Modal>
    )

}
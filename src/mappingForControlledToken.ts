import { Address, BigInt, log, store } from '@graphprotocol/graph-ts'
import {ZERO_ADDRESS} from "./helpers/common"
import {
  Transfer,
} from '../generated/templates/ControlledToken/ControlledToken'

import {
  ControlledToken, ControlledTokenBalance,
} from '../generated/schema'

import {
  determineTransferType
} from './helpers/controlledTokenHelpers'


export function handleTransfer(event: Transfer): void {
  const transferType = determineTransferType(event.params) // detects if to/froom a zero address

  // Currently only handling user to user transfers here
  // as depositing handles 'Minted' and withdraw handles 'Burned'
  if (transferType != 'UserToUser') { return }

  if(event.params.to.equals(event.params.from)){
    log.warning("transfer to self! ",[])
    return
  }
  
  
  const token = ControlledToken.load(event.address.toHex()) 
  // what if token does not exist? -- logic error it seems
  // where is the token.type set? -- createControlledToken() called in SingleRandomWinner handler
  

  let controlledTokenBalance = ControlledTokenBalance.load(generateCompositeId (event.params.to, event.address)) // controlledtokenbalance id =  (address, controlledToken)
  let newAccount = false
  if(controlledTokenBalance == null) {// create case 
    newAccount=true
    controlledTokenBalance = new ControlledTokenBalance(generateCompositeId (event.params.to, event.address))
    controlledTokenBalance.balance = event.params.value
    controlledTokenBalance.controlledToken = token.id // or event.address
    controlledTokenBalance.address = event.params.to
    controlledTokenBalance.save()
  }
  else{ //update case
    controlledTokenBalance.balance = controlledTokenBalance.balance.plus(event.params.value)
  }

  // check if Transfer has depleted someones balance
  let depletedBalance = false
  if(event.params.from.notEqual(Address.fromString(ZERO_ADDRESS))){
    const transferredFrom = ControlledTokenBalance.load(generateCompositeId (event.params.from, event.address)) 
    if(transferredFrom != null){ // redundant logic check
      if(transferredFrom.balance == new BigInt(0)){
        depletedBalance = true
        store.remove("ControlledTokenBalance", transferredFrom.id)
      }
    }
  }
  
  // INCREMENT WHEN MINTED OR TRANSFERRED (BALNCE 0 TO NONZERO), DECREMENT (BALANCE TO ZERO) 

  const existingTotalSupply = token.totalSupply
  
  if(event.params.from.equals(Address.fromString(ZERO_ADDRESS))){
    // increase total supply
    token.totalSupply = existingTotalSupply.plus(event.params.value) // is this in GWEI??
  }
  if(event.params.to.equals(Address.fromString(ZERO_ADDRESS))){
    token.totalSupply = existingTotalSupply.minus(event.params.value)
  }
  
  const existingNumberOfHolders = token.numberOfHolders

  if (token.type == 'Ticket') {
    // if token mint
    if(event.params.from.equals(Address.fromString(ZERO_ADDRESS)) && newAccount){
      // if transfer is to NEW address then increment number of players
      token.numberOfHolders = existingNumberOfHolders.plus(new BigInt(1))
    }
    // if token burn
    if(event.params.to.equals(Address.fromString(ZERO_ADDRESS)) && depletedBalance){
      // if account balance depleted decrement player count
      token.numberOfHolders = existingNumberOfHolders.minus(new BigInt(1))
    } 
  }
  token.save()
}


// helper --Move to helpers
function generateCompositeId(address: Address, to: Address) : string {
  return address.toHex() + "-" + to.toHex()
}
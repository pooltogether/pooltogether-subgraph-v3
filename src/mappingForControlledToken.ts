import { Address, BigInt, log, store } from '@graphprotocol/graph-ts'
import {ONE, ZERO_ADDRESS} from "./helpers/common"
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
  
  const controlledToken = ControlledToken.load(event.address.toHex()) 
  
  let controlledTokenBalance = ControlledTokenBalance.load(generateCompositeId (event.params.to, event.address)) // controlledtokenbalance id =  (address, controlledToken)
  let newAccount = false
  
  if(controlledTokenBalance == null) {// create case 
    newAccount=true
    controlledTokenBalance = new ControlledTokenBalance(generateCompositeId (event.params.to, event.address))
    controlledTokenBalance.balance = event.params.value
    controlledTokenBalance.controlledToken = controlledToken.id // or event.address
    controlledTokenBalance.account = event.params.to.toHex()
    controlledTokenBalance.save()
  }
  else{ //update case
    controlledTokenBalance.balance = controlledTokenBalance.balance.plus(event.params.value)
  }

  // check if Transfer has depleted someones balance
  let depletedBalance = false
  if(event.params.from.notEqual(Address.fromString(ZERO_ADDRESS))){// mint event
    const transferredFrom = ControlledTokenBalance.load(generateCompositeId (event.params.from, event.address)) 
    transferredFrom.balance=transferredFrom.balance.minus(event.params.value)
    
    if(transferredFrom.balance == new BigInt(0)){
      depletedBalance = true
      store.remove("ControlledTokenBalance", transferredFrom.id)
    }
    else{
      transferredFrom.save()
    }
    
  }
  //adjust total supplied and holders
  const existingTotalSupply = controlledToken.totalSupply
  const existingNumberOfHolders = controlledToken.numberOfHolders
  if(event.params.from.equals(Address.fromString(ZERO_ADDRESS))){ // mint -increase total supply   
    controlledToken.totalSupply = existingTotalSupply.plus(event.params.value)
    if(newAccount){
      controlledToken.numberOfHolders = existingNumberOfHolders.plus(ONE)  // if transfer is to NEW address then increment number of players
    } 
  }
  if(event.params.to.equals(Address.fromString(ZERO_ADDRESS))){ // burn - decrease total supply
    controlledToken.totalSupply = existingTotalSupply.minus(event.params.value)
    if(depletedBalance){
      controlledToken.numberOfHolders = existingNumberOfHolders.minus(ONE) // if account balance depleted decrement player count
    }
  }
  controlledToken.save()
}


// helper --Move to helpers
function generateCompositeId(address: Address, to: Address) : string {
  return address.toHex() + "-" + to.toHex()
}
import { Address, log, store } from '@graphprotocol/graph-ts'
import {ONE, ZERO, ZERO_ADDRESS} from "./helpers/common"
import {
  Transfer,
} from '../generated/templates/ControlledToken/ControlledToken'

import {
  ControlledToken, ControlledTokenBalance,
} from '../generated/schema'



export function handleTransfer(event: Transfer): void {

  if(event.params.to.equals(event.params.from)){
    log.warning("transfer to self! ",[])
    return
  }
  
  const burning = event.params.to.equals(Address.fromString(ZERO_ADDRESS))
  const minting = event.params.from.equals(Address.fromString(ZERO_ADDRESS))

  const controlledToken = ControlledToken.load(event.address.toHex()) 
  const existingNumberOfHolders = controlledToken.numberOfHolders
  const existingTotalSupply = controlledToken.totalSupply
  
  if(!burning){
    let toBalance = ControlledTokenBalance.load(generateCompositeId (event.params.to, event.address)) // controlledtokenbalance id =  (address, controlledToken)
    
    if(toBalance == null) {// create case 
      toBalance = new ControlledTokenBalance(generateCompositeId (event.params.to, event.address))
      controlledToken.numberOfHolders = existingNumberOfHolders.plus(ONE)  // if transfer is to NEW address then increment number of players
  
      toBalance.balance = event.params.value
      toBalance.controlledToken = controlledToken.id // or event.address
      toBalance.account = event.params.to.toHex()
      
    }
    else{ //update case
      toBalance.balance = toBalance.balance.plus(event.params.value)
    }
    toBalance.save()
  }
  else{ // burning decrease total supply
    controlledToken.totalSupply = existingTotalSupply.minus(event.params.value)
  }

  // check if Transfer has depleted someones balance
  if(!minting){ // not a mint event
    let fromBalance = ControlledTokenBalance.load(generateCompositeId (event.params.from, event.address)) // must always exist
    fromBalance.balance=fromBalance.balance.minus(event.params.value)
    
    // if the balance of the sending account is zero then remove it
    if(fromBalance.balance.equals(ZERO)){
      controlledToken.numberOfHolders = existingNumberOfHolders.minus(ONE) // if account balance depleted decrement player count
      store.remove("ControlledTokenBalance", fromBalance.id)
    }
    else{
      fromBalance.save()
    }
    
  }
  else{ // we are minting
    controlledToken.totalSupply = existingTotalSupply.plus(event.params.value)
  }
  controlledToken.save()
}


// helper --Move to helpers
function generateCompositeId(address: Address, to: Address) : string {
  return address.toHex() + "-" + to.toHex()
}
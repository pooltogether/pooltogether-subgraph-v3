import { Address, log, store } from '@graphprotocol/graph-ts'
import {ONE, ZERO, ZERO_ADDRESS} from "./helpers/common"
import {
  Transfer,
} from '../generated/templates/ControlledToken/ControlledToken'

import {
   ControlledTokenBalance,
} from '../generated/schema'
import { loadOrCreateAccount } from './helpers/loadOrCreateAccount'
import { loadOrCreateControlledToken } from './helpers/loadOrCreateControlledToken'

export function handleTransfer(event: Transfer): void {

  if(event.params.to.equals(event.params.from)){
    log.warning("transfer to self at txId {} from {} ",[event.transaction.hash.toString(), event.params.from.toHexString()])
    return
  }

  const controlledToken = loadOrCreateControlledToken(event.address)

  const isBurning = event.params.to.equals(Address.fromString(ZERO_ADDRESS))
  if(isBurning) {
    controlledToken.totalSupply = controlledToken.totalSupply.minus(event.params.value) // decrease total supply
  }
  else{
    let toBalance = ControlledTokenBalance.load(generateCompositeId (event.params.to, event.address)) // controlledtokenbalance id =  (address, controlledToken)
    
    if(toBalance == null) {// create case 
      toBalance = new ControlledTokenBalance(generateCompositeId (event.params.to, event.address))
      controlledToken.numberOfHolders = controlledToken.numberOfHolders.plus(ONE)  // if transfer is to NEW address then increment number of players

      toBalance.balance = event.params.value
      toBalance.controlledToken = controlledToken.id // or event.address
      toBalance.account = loadOrCreateAccount(event.params.to).id
    }
    else{
      toBalance.balance = toBalance.balance.plus(event.params.value)
    }
    toBalance.save()
  }

  const isMinting = event.params.from.equals(Address.fromString(ZERO_ADDRESS))
  if (isMinting) {
    controlledToken.totalSupply = controlledToken.totalSupply.plus(event.params.value)
  } 
  else{
    const fromBalance = ControlledTokenBalance.load(generateCompositeId (event.params.from, event.address)) // must always exist
    fromBalance.balance = fromBalance.balance.minus(event.params.value)
  
    // if the balance of the sending account is zero then remove it
    if(fromBalance.balance.equals(ZERO)){
      controlledToken.numberOfHolders = controlledToken.numberOfHolders.minus(ONE) // if account balance depleted decrement player count
      store.remove("ControlledTokenBalance", fromBalance.id)
    }
    else{
      fromBalance.save()
    }
  }

  controlledToken.save()
}

// helper --Move to helpers
function generateCompositeId(address1: Address, address2: Address) : string {
  return address1.toHex() + "-" + address2.toHex()
}

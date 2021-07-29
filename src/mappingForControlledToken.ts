import { Address, log, store } from '@graphprotocol/graph-ts'
import {generateCompositeId, ONE, ZERO, ZERO_ADDRESS} from "./helpers/common"
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
    let toBalance = ControlledTokenBalance.load(generateCompositeId (event.params.to.toHexString(), event.address.toHexString())) // controlledtokenbalance id =  (address, controlledToken)
    
    if(toBalance == null) {// create case 
      toBalance = new ControlledTokenBalance(generateCompositeId (event.params.to.toHexString(), event.address.toHexString()))
      toBalance.balance = ZERO
      toBalance.controlledToken = controlledToken.id // or event.address
      toBalance.account = loadOrCreateAccount(event.params.to).id
    }

    // if a balance is going from zero to non-zero
    if (toBalance.balance.equals(ZERO) && event.params.value.gt(ZERO)) {
      controlledToken.numberOfHolders = controlledToken.numberOfHolders.plus(ONE)
    }

    toBalance.balance = toBalance.balance.plus(event.params.value)
    toBalance.save()
  }

  const isMinting = event.params.from.equals(Address.fromString(ZERO_ADDRESS))
  if (isMinting) {
    controlledToken.totalSupply = controlledToken.totalSupply.plus(event.params.value)
  } 
  else {
    let fromBalance = ControlledTokenBalance.load(generateCompositeId (event.params.from.toHexString(), event.address.toHexString())) // must always exist

    if(fromBalance == null) {// create case 
      fromBalance = new ControlledTokenBalance(generateCompositeId (event.params.from.toHexString(), event.address.toHexString()))
      fromBalance.balance = ZERO
      fromBalance.controlledToken = controlledToken.id // or event.address
      fromBalance.account = loadOrCreateAccount(event.params.from).id
    }

    if (fromBalance.balance.gt(event.params.value)) {
      fromBalance.balance = fromBalance.balance.minus(event.params.value)
    } else {
      fromBalance.balance = ZERO
    }
  
    fromBalance.save()

    // if the balance of the sending account is zero then remove it
    if(fromBalance.balance.equals(ZERO)) {
      controlledToken.numberOfHolders = controlledToken.numberOfHolders.minus(ONE) // if account balance depleted decrement player count
      store.remove("ControlledTokenBalance", fromBalance.id)
    }
  }

  controlledToken.save()
}

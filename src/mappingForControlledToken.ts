import { Address, log, store } from '@graphprotocol/graph-ts'
import {generateCompositeId, ONE, ZERO, ZERO_ADDRESS} from "./helpers/common"
import {
  Transfer,
} from '../generated/templates/ControlledToken/ControlledToken'

import {
  BurnedControlledToken,
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
    
    if(toBalance == null || toBalance.balance.equals(ZERO)) {// create case 
      toBalance = new ControlledTokenBalance(generateCompositeId (event.params.to.toHexString(), event.address.toHexString()))
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
    const fromBalance = ControlledTokenBalance.load(generateCompositeId (event.params.from.toHexString(), event.address.toHexString())) // must always exist
    fromBalance.balance = fromBalance.balance.minus(event.params.value)
 
    // Log burn event
    const burn = new BurnedControlledToken(event.transaction.hash.toHexString())
    burn.account = fromBalance.account
    burn.controlledToken = fromBalance.controlledToken
    burn.amount = event.params.value
    burn.timestamp = event.block.timestamp
    burn.save()

    // if the balance of the sending account is zero then remove it
    if (fromBalance.balance.equals(ZERO)) {
      controlledToken.numberOfHolders = controlledToken.numberOfHolders.minus(ONE) // if account balance depleted decrement player count
      store.remove("ControlledTokenBalance", fromBalance.id)      
    }
    else{
      fromBalance.save()
    }
  }

  controlledToken.save()
}

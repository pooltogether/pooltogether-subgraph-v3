import { log, Address } from '@graphprotocol/graph-ts'
import {ControlledToken, ControlledTokenBalance} from "../../generated/schema"

/*
type ControlledTokenBalance @entity {
  id: ID! # composite key of (address, controlledToken)
  address: Bytes!
  controlledToken: ControlledToken!
  balance: BigInt
}

*/

export function loadOrCreateControlledTokenBalance(
    account: Address,
    controlledTokenId: string
  ): ControlledTokenBalance {
    let controlledBalance = ControlledTokenBalance.load(generateCompositeId(account.toHex(),controlledTokenId))
    if(!controlledBalance){ // create 
      controlledBalance = new ControlledTokenBalance(generateCompositeId(account.toHex(),controlledTokenId))
      controlledBalance.controlledToken = controlledTokenId
      controlledBalance.save()
    }
    return controlledBalance as ControlledTokenBalance
  }

  function generateCompositeId(accountId : string, controlledTokenId: string){
    return accountId + "-" + controlledTokenId
  }


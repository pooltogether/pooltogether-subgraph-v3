import { log, Address } from '@graphprotocol/graph-ts'
import {ControlledToken, ControlledTokenBalance, PrizePool, PrizePoolAccount} from "../../generated/schema"
import {ZERO} from "./common"
/*
# join table 
type PrizePoolAccount @entity{
  id: ID! #composite aprizerpool id - accountid

  prizePool: PrizePool! 
  account: Account!

  # address specific fields
  timelockedBalance: BigInt!
  unlockTimestamp: BigInt!
  cumulativeWinnings: BigInt!

}
*/

export function loadOrCreatePrizePoolAccount(
    prizePool: Address,
    account: string
  ): PrizePoolAccount {
    let prizePoolAccount = PrizePoolAccount.load(generateCompositeId(prizePool.toHex(),account))
    if(!prizePoolAccount){ // create 
      prizePoolAccount = new PrizePoolAccount(generateCompositeId(prizePool.toHex(),account))
      prizePoolAccount.prizePool = prizePool.toHex()
      prizePoolAccount.account = account
      
      prizePoolAccount.unlockTimestamp=ZERO
      prizePoolAccount.cumulativeWinnings=ZERO
      prizePoolAccount.unlockTimestamp=ZERO
      
      prizePoolAccount.save()
    }
    return prizePoolAccount as PrizePoolAccount
  }

  function generateCompositeId(accountId : string, controlledTokenId: string){
    return accountId + "-" + controlledTokenId
  }


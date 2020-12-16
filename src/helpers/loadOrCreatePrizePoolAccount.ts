import { log, Address } from '@graphprotocol/graph-ts'
import {PrizePoolAccount} from "../../generated/schema"
import {generateCompositeId, ZERO} from "./common"

export function loadOrCreatePrizePoolAccount(
    prizePool: Address,
    account: string
  ): PrizePoolAccount {
    let prizePoolAccount = PrizePoolAccount.load(generateCompositeId(prizePool.toHex(),account))
    if(!prizePoolAccount){ // create 
      prizePoolAccount = new PrizePoolAccount(generateCompositeId(prizePool.toHex(),account))
      prizePoolAccount.prizePool = prizePool.toHex()
      prizePoolAccount.account = account
      
      // mock values
      prizePoolAccount.timelockedBalance = ZERO
      prizePoolAccount.unlockTimestamp = ZERO
      
      prizePoolAccount.save()
    }
    return prizePoolAccount as PrizePoolAccount
}


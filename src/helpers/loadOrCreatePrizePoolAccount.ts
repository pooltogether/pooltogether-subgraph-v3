import { log, Address } from '@graphprotocol/graph-ts'
import {PrizePoolAccount} from "../../generated/schema"
import {ZERO} from "./common"

export function loadOrCreatePrizePoolAccount(
    prizePool: Address,
    account: string
  ): PrizePoolAccount {
    let prizePoolAccount = PrizePoolAccount.load(generateCompositeId(prizePool.toHex(),account))
    if(prizePoolAccount){
      log.warning("prizepoolaccount already existed for {} ", [prizePoolAccount.id])
    }
    if(!prizePoolAccount){ // create 
      log.warning("creating PrizePoolAccount with id {} ",[generateCompositeId(prizePool.toHex(),account)])
      prizePoolAccount = new PrizePoolAccount(generateCompositeId(prizePool.toHex(),account))
      prizePoolAccount.prizePool = prizePool.toHex()
      prizePoolAccount.account = account
      
      prizePoolAccount.timelockedBalance = ZERO
      prizePoolAccount.cumulativeWinnings = ZERO
      prizePoolAccount.unlockTimestamp = ZERO
      
      prizePoolAccount.save()
    }
    return prizePoolAccount as PrizePoolAccount
  }

  function generateCompositeId(accountId : string, controlledTokenId: string) :string{
    return accountId + "-" + controlledTokenId
  }


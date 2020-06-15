import { Address, BigInt, log } from "@graphprotocol/graph-ts"
import {
  PeriodicPrizePool as PeriodicPrizePoolContract,
} from '../../generated/templates/PeriodicPrizePool/PeriodicPrizePool'
import {
  PeriodicPrizePool,
} from '../../generated/schema'

export function loadPeriodicPrizePool(
  periodicPrizePoolAddress: Address,
): PeriodicPrizePool {
  log.debug('address?, {}', [periodicPrizePoolAddress.toHexString()])
  let periodicPrizePool = PeriodicPrizePool.load(periodicPrizePoolAddress.toHex())

  

  periodicPrizePool.save()

  return periodicPrizePool as PeriodicPrizePool
}

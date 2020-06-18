import { Address, BigInt, log } from "@graphprotocol/graph-ts"
// import {
//   CompoundPeriodicPrizePool as CompoundPeriodicPrizePoolContract,
// } from '../../generated/templates/CompoundPeriodicPrizePool/CompoundPeriodicPrizePool'
import {
  PrizePool,
} from '../../generated/schema'

export function loadPrizePool(
  prizePoolAddress: Address,
): PrizePool {
  log.debug('address?, {}', [prizePoolAddress.toHexString()])
  let prizePool = PrizePool.load(prizePoolAddress.toHex())

  prizePool.save()

  return prizePool as PrizePool
}

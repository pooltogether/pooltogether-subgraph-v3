import { Address } from "@graphprotocol/graph-ts"
import {
  PrizePool,
} from '../../generated/schema'

export function loadPrizePool(
  prizePoolAddress: Address,
): PrizePool {
  let prizePool = PrizePool.load(prizePoolAddress.toHex())

  return prizePool as PrizePool
}

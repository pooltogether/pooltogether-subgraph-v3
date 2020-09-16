import { Address } from '@graphprotocol/graph-ts'

import {
  PrizeStrategy,
} from '../../generated/schema'


export function loadOrCreatePrizeStrategy(
  prizePool: Address,
  prizeStrategy: Address,
): PrizeStrategy {
  let _prizeStrategy = PrizeStrategy.load(prizeStrategy.toHex())

  if (!_prizeStrategy) {
    // Create PrizeStrategy Link
    _prizeStrategy = new PrizeStrategy(prizeStrategy.toHex())
    _prizeStrategy.prizePool = prizePool.toHex()
    _prizeStrategy.save()
  }

  return _prizeStrategy as PrizeStrategy
}

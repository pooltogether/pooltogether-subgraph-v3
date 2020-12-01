import { Address } from '@graphprotocol/graph-ts'

import {
  PrizeStrategy,
} from '../../generated/schema'

export function loadOrCreatePrizeStrategy(
  prizeStrategy: Address
): PrizeStrategy {
  let _prizeStrategy = PrizeStrategy.load(prizeStrategy.toHex())

  if (!_prizeStrategy) {
    _prizeStrategy = new PrizeStrategy(prizeStrategy.toHex())
    _prizeStrategy.save()
  }

  return _prizeStrategy as PrizeStrategy
}

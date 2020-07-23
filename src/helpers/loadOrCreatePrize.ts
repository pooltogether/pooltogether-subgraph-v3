import { Address } from '@graphprotocol/graph-ts'
import { Prize } from '../../generated/schema'

import { prizeId } from './idTemplates'

export function loadOrCreatePrize(prizeStrategyAddress: Address, currentPrizeId: string): Prize {
  const id = prizeId(
    prizeStrategyAddress.toHexString(),
    currentPrizeId
  )
  let prize = Prize.load(id)

  if (!prize) {
    prize = new Prize(id)
    prize.prizeStrategy = prizeStrategyAddress.toHex()
    // prize.save()
  }

  return prize as Prize
}

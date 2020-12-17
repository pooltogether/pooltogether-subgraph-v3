import { log } from '@graphprotocol/graph-ts'
import { Prize } from '../../generated/schema'

import { prizeId } from './idTemplates'

export function loadOrCreatePrize(prizePoolAddress: string, currentPrizeId: string): Prize {
  const id = prizeId(
    prizePoolAddress,
    currentPrizeId
  )
  let prize = Prize.load(id)

  if (!prize) {
    prize = new Prize(id)
    prize.prizePool = prizePoolAddress
    prize.save()
  }
  return prize as Prize
}

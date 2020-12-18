import { Prize } from '../../generated/schema'
import { ZERO } from './common'

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
    prize.numberOfSubWinners = ZERO
    prize.save()
  }
  return prize as Prize
}

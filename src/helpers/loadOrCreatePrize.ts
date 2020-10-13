import { Prize } from '../../generated/schema'

import { prizeId } from './idTemplates'

export function loadOrCreatePrize(_prizePoolAddress: string, _prizeId: string): Prize {
  const id = prizeId(
    _prizePoolAddress,
    _prizeId
  )
  let prize = Prize.load(id)

  if (!prize) {
    prize = new Prize(id)
    prize.prizePool = _prizePoolAddress
    prize.save()
  }

  return prize as Prize
}

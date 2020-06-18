import {
  PrizePoolCreated,
} from '../generated/PrizePoolBuilder/PrizePoolBuilder'

import { loadOrCreatePrizePool } from './helpers/loadOrCreatePrizePool'
import { loadOrCreatePrizePoolBuilder } from './helpers/loadOrCreatePrizePoolBuilder'

export function handlePrizePoolCreated(event: PrizePoolCreated): void {
  loadOrCreatePrizePoolBuilder(event.address)

  loadOrCreatePrizePool(
    event.block.number,
    event.address,
    event.params.creator,
    event.params.prizePool,
    event.params.prizeStrategy,
  )
}

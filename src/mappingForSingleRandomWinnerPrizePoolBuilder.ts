import {
  SingleRandomWinnerPrizePoolCreated,
} from '../generated/SingleRandomWinnerPrizePoolBuilder/SingleRandomWinnerPrizePoolBuilder'

import { loadOrCreatePrizePool } from './helpers/loadOrCreatePrizePool'
import { loadOrCreateSingleRandomWinnerPrizePoolBuilder } from './helpers/loadOrCreateSingleRandomWinnerPrizePoolBuilder'

export function handleSingleRandomWinnerPrizePoolCreated(event: SingleRandomWinnerPrizePoolCreated): void {
  loadOrCreateSingleRandomWinnerPrizePoolBuilder(event.address)

  loadOrCreatePrizePool(
    event.block.number,
    event.address,
    event.params.creator,
    event.params.prizePool,
    event.params.singleRandomWinnerPrizeStrategy,
  )
}

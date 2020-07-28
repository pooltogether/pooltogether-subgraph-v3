import {
  CompoundPrizePoolCreated,
} from '../generated/CompoundPrizePoolBuilder/CompoundPrizePoolBuilder'

import { loadOrCreatePrizeStrategy } from './helpers/loadOrCreatePrizeStrategy'
import { loadOrCreateCompoundPrizePoolBuilder } from './helpers/loadOrCreateCompoundPrizePoolBuilder'

export function handleCompoundPrizePoolCreated(event: CompoundPrizePoolCreated): void {
  loadOrCreateCompoundPrizePoolBuilder(event.address)

  loadOrCreatePrizeStrategy(
    event.block.number,
    event.address,
    event.params.creator,
    event.params.prizePool,
    event.params.prizeStrategy,
  )
}

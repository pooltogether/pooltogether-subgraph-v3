import {
  PrizePoolCreated,
} from '../generated/PrizePoolBuilder/PrizePoolBuilder'

import { loadOrCreatePoolManager } from './helpers/loadOrCreatePoolManager'
import { loadOrCreatePrizePoolBuilder } from './helpers/loadOrCreatePrizePoolBuilder'

export function handlePrizePoolCreated(event: PrizePoolCreated): void {
  loadOrCreatePrizePoolBuilder(event.address)

  const poolManager = loadOrCreatePoolManager(
    event.params.creator,
    event.params.moduleManager,
    event.params.prizeStrategy,
  )
}

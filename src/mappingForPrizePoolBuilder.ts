import {
  PrizePoolCreated,
} from '../generated/PrizePoolBuilder/PrizePoolBuilder'

import { loadOrCreatePrizePoolModuleManager } from './helpers/loadOrCreatePrizePoolModuleManager'
import { loadOrCreatePrizePoolBuilder } from './helpers/loadOrCreatePrizePoolBuilder'

export function handlePrizePoolCreated(event: PrizePoolCreated): void {
  loadOrCreatePrizePoolBuilder(event.address)

  const prizePoolModuleManager = loadOrCreatePrizePoolModuleManager(
    event.block.number,
    event.address,
    event.params.creator,
    event.params.moduleManager,
    event.params.prizeStrategy,
  )
}

import {
  PrizeStrategyBuilt,
} from '../generated/PrizeStrategyBuilder/PrizeStrategyBuilder'

import { loadOrCreatePrizeStrategy } from './helpers/loadOrCreatePrizeStrategy'
import { loadOrCreatePrizeStrategyBuilder } from './helpers/loadOrCreatePrizeStrategyBuilder'

export function handlePrizeStrategyBuilt(event: PrizeStrategyBuilt): void {
  loadOrCreatePrizeStrategyBuilder(event.address)

  loadOrCreatePrizeStrategy(
    event.block.number,
    event.address,
    event.params.creator,
    event.params.prizePool,
    event.params.prizeStrategy,
  )
}

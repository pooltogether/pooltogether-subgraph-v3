import {
  Initialized
} from '../generated/templates/PrizePool_v3_3_2/PrizePool_v3_3_2'

import { loadOrCreatePrizePool } from './helpers/loadOrCreatePrizePool'

export function handleInitialized(event: Initialized): void {
  const _prizePool = loadOrCreatePrizePool(event.address)
  _prizePool.reserveRegistry = event.params.reserveRegistry
  _prizePool.maxExitFeeMantissa = event.params.maxExitFeeMantissa
  _prizePool.maxTimelockDuration = event.params.maxTimelockDuration
  _prizePool.save()
}

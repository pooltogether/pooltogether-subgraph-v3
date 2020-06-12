import { log } from '@graphprotocol/graph-ts'
import {
  PrizePoolCreated,
} from '../generated/PrizePoolBuilder/PrizePoolBuilder'

import { loadOrCreatePoolManager } from './helpers/loadOrCreatePoolManager'
import { loadOrCreatePrizePoolBuilder } from './helpers/loadOrCreatePrizePoolBuilder'

export function handlePrizePoolCreated(event: PrizePoolCreated): void {
  log.info('creator: {}', [event.params.creator.toHex()])
  log.info('moduleManager: {}', [event.params.moduleManager.toHex()])
  log.info('prizeStrategy: {}', [event.params.prizeStrategy.toHex()])
  
  loadOrCreatePrizePoolBuilder(event.address)

  const poolManager = loadOrCreatePoolManager(
    event.params.creator,
    event.params.moduleManager,
    event.params.prizeStrategy,
  )
}

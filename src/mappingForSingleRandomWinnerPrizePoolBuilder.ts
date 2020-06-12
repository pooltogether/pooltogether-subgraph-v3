// import { log } from '@graphprotocol/graph-ts'
import {
  SingleRandomWinnerPrizePoolCreated,
} from '../generated/SingleRandomWinnerPrizePoolBuilder/SingleRandomWinnerPrizePoolBuilder'

import { loadOrCreatePoolManager } from './helpers/loadOrCreatePoolManager'
import { loadOrCreateSingleRandomWinnerPrizePoolBuilder } from './helpers/loadOrCreateSingleRandomWinnerPrizePoolBuilder'

export function handleSingleRandomWinnerPrizePoolCreated(event: SingleRandomWinnerPrizePoolCreated): void {
  // log.info('creator: {}', [event.params.creator.toHex()])

  loadOrCreateSingleRandomWinnerPrizePoolBuilder(event.address)

  const poolManager = loadOrCreatePoolManager(
    event.params.creator,
    event.params.moduleManager,
    event.params.singleRandomWinnerPrizeStrategy,
  )
}

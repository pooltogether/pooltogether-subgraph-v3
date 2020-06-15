// import { log } from '@graphprotocol/graph-ts'
import {
  SingleRandomWinnerPrizePoolCreated,
} from '../generated/SingleRandomWinnerPrizePoolBuilder/SingleRandomWinnerPrizePoolBuilder'

import { loadOrCreatePrizePoolModuleManager } from './helpers/loadOrCreatePrizePoolModuleManager'
import { loadOrCreateSingleRandomWinnerPrizePoolBuilder } from './helpers/loadOrCreateSingleRandomWinnerPrizePoolBuilder'

export function handleSingleRandomWinnerPrizePoolCreated(event: SingleRandomWinnerPrizePoolCreated): void {
  // log.info('creator: {}', [event.params.creator.toHex()])

  loadOrCreateSingleRandomWinnerPrizePoolBuilder(event.address)

  const prizePoolModuleManager = loadOrCreatePrizePoolModuleManager(
    event.block.number,
    event.address,
    event.params.creator,
    event.params.moduleManager,
    event.params.singleRandomWinnerPrizeStrategy,
  )
}

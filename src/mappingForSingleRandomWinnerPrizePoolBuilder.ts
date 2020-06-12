import { log } from "@graphprotocol/graph-ts"
import {
  SingleRandomWinnerPrizePoolCreated,
} from '../generated/SingleRandomWinnerPrizePoolBuilder/SingleRandomWinnerPrizePoolBuilder'
import {
  PoolModule,
} from '../generated/schema'
import { loadOrCreateSingleRandomWinnerPrizePoolBuilder } from './helpers/loadOrCreateSingleRandomWinnerPrizePoolBuilder'

export function handleSingleRandomWinnerPrizePoolCreated(event: SingleRandomWinnerPrizePoolCreated): void {
  loadOrCreateSingleRandomWinnerPrizePoolBuilder(event.address)

  log.debug('Block number: {}, block hash: {}, transaction hash: {}', [
    event.block.number.toString(), // "47596000"
    event.block.hash.toHexString(), // "0x..."
    event.transaction.hash.toHexString(), // "0x..."
  ])

  const poolModule = new PoolModule(event.params.moduleManager.toHex())

  poolModule.moduleManager = event.params.moduleManager
  poolModule.creator = event.params.creator
  poolModule.prizeStrategy = event.params.singleRandomWinnerPrizeStrategy

  poolModule.save()
}

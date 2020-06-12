import {
  PrizePoolCreated,
} from '../generated/PrizePoolBuilder/PrizePoolBuilder'
import {
  PoolModule,
  // PrizePoolBuilder,
} from '../generated/schema'
// import { loadOrCreatePrizePoolBuilder } from './helpers/loadOrCreatePrizePoolBuilder'

export function handlePrizePoolCreated(event: PrizePoolCreated): void {
  // loadOrCreatePrizePoolBuilder(event.address)

  const poolModule = new PoolModule(event.params.moduleManager.toHex())
  poolModule.moduleManager = event.params.moduleManager
  poolModule.creator = event.params.creator
  poolModule.prizeStrategy = event.params.prizeStrategy

  // poolModule.block = event.block.number

  poolModule.save()
}

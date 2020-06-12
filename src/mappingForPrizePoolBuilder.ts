import { Address, Bytes } from "@graphprotocol/graph-ts"
import {
  PrizePoolBuilder as PrizePoolBuilderContract,
  PrizePoolCreated,
} from '../generated/PrizePoolBuilder/PrizePoolBuilder'
import {
  PoolModule,
  PrizePoolBuilder,
} from '../generated/schema'
import { loadOrCreatePrizePoolBuilder } from './helpers/loadOrCreatePrizePoolBuilder'
// import { createPrizePoolBuilder } from './helpers/createPrizePoolBuilder'
// import { loadOrCreatePoolModule } from './helpers/loadOrCreatePoolModule'

export function handlePrizePoolCreated(event: PrizePoolCreated): void {
  // const prizePoolBuilder = loadOrCreatePrizePoolBuilder(event.address.toHex())
  loadOrCreatePrizePoolBuilder(event.address)

  const poolModule = new PoolModule(event.params.moduleManager.toHex())
  poolModule.moduleManager = event.params.moduleManager
  poolModule.creator = event.params.creator
  poolModule.prizeStrategy = event.params.prizeStrategy

  // poolModule.block = event.block.number

  poolModule.save()
}

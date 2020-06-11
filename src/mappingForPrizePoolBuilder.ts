import { Address, Bytes } from "@graphprotocol/graph-ts"
import {
  PrizePoolBuilder as PrizePoolBuilderContract,
  PrizePoolCreated,
} from '../generated/PrizePoolBuilder/PrizePoolBuilder'
import {
  PoolModule,
  PrizePoolBuilder,
} from '../generated/schema'
// import { createPrizePoolBuilder } from './helpers/createPrizePoolBuilder'
// import { loadOrCreatePoolModule } from './helpers/loadOrCreatePoolModule'

function loadOrCreatePrizePoolBuilder(prizePoolBuilderAddress: Address): PrizePoolBuilder {
  let prizePoolBuilder = PrizePoolBuilder.load(prizePoolBuilderAddress.toHex())

  if (!prizePoolBuilder) {
    prizePoolBuilder = new PrizePoolBuilder(prizePoolBuilderAddress.toHex())
    const boundPrizePoolBuilder = PrizePoolBuilderContract.bind(prizePoolBuilderAddress)

    prizePoolBuilder.trustedForwarder = boundPrizePoolBuilder.trustedForwarder()

    prizePoolBuilder.ownableModuleManagerFactory = boundPrizePoolBuilder.ownableModuleManagerFactory()
    prizePoolBuilder.compoundYieldServiceFactory = boundPrizePoolBuilder.compoundYieldServiceFactory()
    prizePoolBuilder.periodicPrizePoolFactory = boundPrizePoolBuilder.periodicPrizePoolFactory()
    prizePoolBuilder.ticketFactory = boundPrizePoolBuilder.ticketFactory()
    prizePoolBuilder.loyaltyFactory = boundPrizePoolBuilder.loyaltyFactory()
    prizePoolBuilder.timelockFactory = boundPrizePoolBuilder.timelockFactory()
    prizePoolBuilder.sponsorshipFactory = boundPrizePoolBuilder.sponsorshipFactory()
    
    prizePoolBuilder.rngInterface = boundPrizePoolBuilder.rng()
    prizePoolBuilder.governorInterface = boundPrizePoolBuilder.governor()
    prizePoolBuilder.save()
  }

  return prizePoolBuilder as PrizePoolBuilder
}

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

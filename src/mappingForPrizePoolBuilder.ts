import { Address } from "@graphprotocol/graph-ts"
import {
  PrizePoolBuilder as PrizePoolBuilderContract
} from '../generated/PrizePoolBuilder/PrizePoolBuilder'
import {
  PoolModule,
  PrizePoolBuilder,
} from '../generated/schema'
// import { createPrizePoolBuilder } from './helpers/createPrizePoolBuilder'
// import { loadOrCreatePoolModule } from './helpers/loadOrCreatePoolModule'

function loadOrCreatePrizePoolBuilder(prizePoolBuilderAddress: Address): PrizePoolBuilder {
  let prizePoolBuilder = PrizePoolBuilder.load(prizePoolBuilderAddress)

  if (!prizePoolBuilder) {
    prizePoolBuilder = new PrizePoolBuilder(prizePoolBuilderAddress)
    const boundPrizePoolBuilder = PrizePoolBuilderContract.bind(prizePoolBuilderAddress)

    prizePoolBuilder.trustedForwarder = boundPrizePoolBuilder.trustedForwarder

    prizePoolBuilder.ownableModuleManagerFactory = boundPrizePoolBuilder.ownableModuleManagerFactory
    prizePoolBuilder.compoundYieldServiceFactory = boundPrizePoolBuilder.compoundYieldServiceFactory
    prizePoolBuilder.periodicPrizePoolFactory = boundPrizePoolBuilder.periodicPrizePoolFactory
    prizePoolBuilder.ticketFactory = boundPrizePoolBuilder.ticketFactory
    prizePoolBuilder.loyaltyFactory = boundPrizePoolBuilder.loyaltyFactory
    prizePoolBuilder.timelockFactory = boundPrizePoolBuilder.timelockFactory
    prizePoolBuilder.sponsorshipFactory = boundPrizePoolBuilder.sponsorshipFactory
    
    prizePoolBuilder.rngInterface = boundPrizePoolBuilder.rng
    prizePoolBuilder.governorInterface = boundPrizePoolBuilder.governor
    prizePoolBuilder.save()
  }

  return prizePoolBuilder
}

export function handlePrizePoolCreated(event: PrizePoolCreated): void {
  // const prizePoolBuilder = loadOrCreatePrizePoolBuilder(event.address.toHex())
  loadOrCreatePrizePoolBuilder(event.address.toHex())

  const poolModule = new PoolModule(event.params.moduleManager.toHex())
  poolModule.moduleManager = event.params.moduleManager.toHex()
  poolModule.creator = event.params.creator.toHex()
  poolModule.prizeStrategy = event.params.prizeStrategy.toHex()

  poolModule.block = event.block.number

  poolModule.save()
}

import { Address } from "@graphprotocol/graph-ts"
import {
  PrizePoolBuilder as PrizePoolBuilderContract,
} from '../../generated/PrizePoolBuilder/PrizePoolBuilder'
import {
  PrizePoolBuilder,
} from '../../generated/schema'

export function loadOrCreatePrizePoolBuilder(prizePoolBuilderAddress: Address): PrizePoolBuilder {
  let prizePoolBuilder = PrizePoolBuilder.load(prizePoolBuilderAddress.toHex())

  if (!prizePoolBuilder) {
    prizePoolBuilder = new PrizePoolBuilder(prizePoolBuilderAddress.toHex())
    const boundPrizePoolBuilder = PrizePoolBuilderContract.bind(prizePoolBuilderAddress)

    prizePoolBuilder.trustedForwarder = boundPrizePoolBuilder.trustedForwarder()

    prizePoolBuilder.prizePoolModuleManagerFactory = boundPrizePoolBuilder.prizePoolModuleManagerFactory()
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

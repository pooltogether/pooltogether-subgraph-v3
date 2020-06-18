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

    prizePoolBuilder.compoundPeriodicPrizePoolFactory = boundPrizePoolBuilder.periodicPrizePoolFactory()
    prizePoolBuilder.controlledTokenFactory = boundPrizePoolBuilder.controlledTokenFactory()
    prizePoolBuilder.ticketFactory = boundPrizePoolBuilder.ticketFactory()

    prizePoolBuilder.rng = boundPrizePoolBuilder.rng()
    prizePoolBuilder.governor = boundPrizePoolBuilder.governor()
    
    prizePoolBuilder.save()
  }

  return prizePoolBuilder as PrizePoolBuilder
}

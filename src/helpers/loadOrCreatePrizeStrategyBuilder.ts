import { Address } from "@graphprotocol/graph-ts"
import {
  PrizeStrategyBuilder as PrizeStrategyBuilderContract,
} from '../../generated/PrizeStrategyBuilder/PrizeStrategyBuilder'
import {
  PrizeStrategyBuilder,
} from '../../generated/schema'

export function loadOrCreatePrizeStrategyBuilder(PrizeStrategyBuilderAddress: Address): PrizeStrategyBuilder {
  let PrizeStrategyBuilder = PrizeStrategyBuilder.load(PrizeStrategyBuilderAddress.toHex())

  if (!PrizeStrategyBuilder) {
    PrizeStrategyBuilder = new PrizeStrategyBuilder(PrizeStrategyBuilderAddress.toHex())
    const boundPrizeStrategyBuilder = PrizeStrategyBuilderContract.bind(PrizeStrategyBuilderAddress)

    PrizeStrategyBuilder.trustedForwarder = boundPrizeStrategyBuilder.trustedForwarder()
    PrizeStrategyBuilder.rng = boundPrizeStrategyBuilder.rng()
    PrizeStrategyBuilder.governor = boundPrizeStrategyBuilder.governor()
    
    // PrizeStrategyBuilder.compoundPeriodicPrizePoolFactory = boundPrizeStrategyBuilder.periodicPrizePoolFactory()
    // PrizeStrategyBuilder.controlledTokenFactory = boundPrizeStrategyBuilder.controlledTokenFactory()
    // PrizeStrategyBuilder.ticketFactory = boundPrizeStrategyBuilder.ticketFactory()
    
    PrizeStrategyBuilder.save()
  }

  return PrizeStrategyBuilder as PrizeStrategyBuilder
}

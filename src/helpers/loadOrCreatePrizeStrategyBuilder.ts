import { Address } from "@graphprotocol/graph-ts"
import {
  PrizeStrategyBuilder as PrizeStrategyBuilderContract,
} from '../../generated/PrizeStrategyBuilder/PrizeStrategyBuilder'
import {
  PrizeStrategyBuilder,
} from '../../generated/schema'

export function loadOrCreatePrizeStrategyBuilder(PrizeStrategyBuilderAddress: Address): PrizeStrategyBuilder {
  let _builder = PrizeStrategyBuilder.load(PrizeStrategyBuilderAddress.toHex())

  if (!_builder) {
    _builder = new PrizeStrategyBuilder(PrizeStrategyBuilderAddress.toHex())
    const boundPrizeStrategyBuilder = PrizeStrategyBuilderContract.bind(PrizeStrategyBuilderAddress)

    _builder.trustedForwarder = boundPrizeStrategyBuilder.trustedForwarder()
    _builder.rng = boundPrizeStrategyBuilder.rng()
    _builder.governor = boundPrizeStrategyBuilder.governor()
    
    _builder.save()
  }

  return _builder as PrizeStrategyBuilder
}

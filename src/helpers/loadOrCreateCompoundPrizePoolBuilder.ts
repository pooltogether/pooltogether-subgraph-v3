import { Address } from "@graphprotocol/graph-ts"
import {
  CompoundPrizePoolBuilder as CompoundPrizePoolBuilderContract,
} from '../../generated/CompoundPrizePoolBuilder/CompoundPrizePoolBuilder'
import {
  CompoundPrizePoolBuilder,
} from '../../generated/schema'

export function loadOrCreateCompoundPrizePoolBuilder(CompoundPrizePoolBuilderAddress: Address): CompoundPrizePoolBuilder {
  let _builder = CompoundPrizePoolBuilder.load(CompoundPrizePoolBuilderAddress.toHex())

  if (!_builder) {
    _builder = new CompoundPrizePoolBuilder(CompoundPrizePoolBuilderAddress.toHex())
    const boundCompoundPrizePoolBuilder = CompoundPrizePoolBuilderContract.bind(CompoundPrizePoolBuilderAddress)

    _builder.comptroller = boundCompoundPrizePoolBuilder.comptroller()
    _builder.trustedForwarder = boundCompoundPrizePoolBuilder.trustedForwarder()
    
    _builder.save()
  }

  return _builder as CompoundPrizePoolBuilder
}

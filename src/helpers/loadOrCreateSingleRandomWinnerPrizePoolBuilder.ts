import { Address } from "@graphprotocol/graph-ts"
import {
  SingleRandomWinnerPrizePoolBuilder as SingleRandomWinnerPrizePoolBuilderContract,
} from '../../generated/SingleRandomWinnerPrizePoolBuilder/SingleRandomWinnerPrizePoolBuilder'
import {
  SingleRandomWinnerPrizePoolBuilder,
} from '../../generated/schema'

import { loadOrCreatePrizePoolBuilder } from '../helpers/loadOrCreatePrizePoolBuilder'

export function loadOrCreateSingleRandomWinnerPrizePoolBuilder(singleRandomWinnerPrizePoolBuilderAddress: Address): SingleRandomWinnerPrizePoolBuilder {
  let singleRandomWinnerPrizePoolBuilder = SingleRandomWinnerPrizePoolBuilder.load(singleRandomWinnerPrizePoolBuilderAddress.toHex())

  if (!singleRandomWinnerPrizePoolBuilder) {
    singleRandomWinnerPrizePoolBuilder = new SingleRandomWinnerPrizePoolBuilder(singleRandomWinnerPrizePoolBuilderAddress.toHex())
    const boundSingleRandomWinnerPrizePoolBuilder = SingleRandomWinnerPrizePoolBuilderContract.bind(singleRandomWinnerPrizePoolBuilderAddress)

    loadOrCreatePrizePoolBuilder(boundSingleRandomWinnerPrizePoolBuilder.prizePoolBuilder())

    singleRandomWinnerPrizePoolBuilder.prizePoolBuilder = boundSingleRandomWinnerPrizePoolBuilder.prizePoolBuilder().toHex()
    singleRandomWinnerPrizePoolBuilder.prizeStrategyFactory = boundSingleRandomWinnerPrizePoolBuilder.prizeStrategyFactory()

    singleRandomWinnerPrizePoolBuilder.save()
  }

  return singleRandomWinnerPrizePoolBuilder as SingleRandomWinnerPrizePoolBuilder
}

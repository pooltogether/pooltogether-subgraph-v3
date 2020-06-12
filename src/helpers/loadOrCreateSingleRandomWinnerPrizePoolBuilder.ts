import { Address, log } from "@graphprotocol/graph-ts"
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

    log.debug('Hello, {}', [
      boundSingleRandomWinnerPrizePoolBuilder.prizePoolBuilder().toString()
    ])
    loadOrCreatePrizePoolBuilder(boundSingleRandomWinnerPrizePoolBuilder.prizePoolBuilder())

    singleRandomWinnerPrizePoolBuilder.prizePoolBuilder = boundSingleRandomWinnerPrizePoolBuilder.prizePoolBuilder()
    singleRandomWinnerPrizePoolBuilder.prizeStrategyFactory = boundSingleRandomWinnerPrizePoolBuilder.prizeStrategyFactory()

    singleRandomWinnerPrizePoolBuilder.save()
  }

  return singleRandomWinnerPrizePoolBuilder as SingleRandomWinnerPrizePoolBuilder
}

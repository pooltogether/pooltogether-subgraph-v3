import { Address } from '@graphprotocol/graph-ts'
import {
  CompoundPrizePoolCreated,
} from '../generated/CompoundPrizePoolBuilder/CompoundPrizePoolBuilder'

import { loadOrCreateComptroller } from './helpers/loadOrCreateComptroller'
import { loadOrCreateSingleRandomWinnerPrizeStrategy } from './helpers/loadOrCreateSingleRandomWinnerPrizeStrategy'
import { loadOrCreateCompoundPrizePoolBuilder } from './helpers/loadOrCreateCompoundPrizePoolBuilder'

export function handleCompoundPrizePoolCreated(event: CompoundPrizePoolCreated): void {
  const builder = loadOrCreateCompoundPrizePoolBuilder(event.address)

  const comptrollerAddress = Address.fromString(builder.comptroller)
  loadOrCreateComptroller(comptrollerAddress)

  loadOrCreateSingleRandomWinnerPrizeStrategy(
    event.block.number,
    event.address,
    event.params.creator,
    event.params.prizePool,
    event.params.prizeStrategy,
  )
}

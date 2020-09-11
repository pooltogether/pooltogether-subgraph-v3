import { Address } from '@graphprotocol/graph-ts'
import {
  CompoundPrizePoolCreated,
  SingleRandomWinnerCreated,
} from '../generated/CompoundPrizePoolBuilder/CompoundPrizePoolBuilder'

import { loadOrCreateComptroller } from './helpers/loadOrCreateComptroller'
import { loadOrCreateSingleRandomWinner } from './helpers/loadOrCreateSingleRandomWinner'
import { loadOrCreateCompoundPrizePoolBuilder } from './helpers/loadOrCreateCompoundPrizePoolBuilder'

export function handleCompoundPrizePoolCreated(event: CompoundPrizePoolCreated): void {
  const builder = loadOrCreateCompoundPrizePoolBuilder(event.address)

  const comptrollerAddress = Address.fromString(builder.comptroller)
  loadOrCreateComptroller(comptrollerAddress)

  loadOrCreateSingleRandomWinner(
    event.block.number,
    event.address,
    event.params.creator,
    event.params.prizePool,
    event.params.prizeStrategy,
  )
}

export function handleSingleRandomWinnerCreated(event: SingleRandomWinnerCreated): void {
  // no-op
}

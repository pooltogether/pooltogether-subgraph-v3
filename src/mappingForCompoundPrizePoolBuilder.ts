import { Address } from '@graphprotocol/graph-ts'

import {
  CompoundPrizePoolBuilder as CompoundPrizePoolBuilderContract,
} from '../generated/CompoundPrizePoolBuilder/CompoundPrizePoolBuilder'

import {
  CompoundPrizePoolCreated,
} from '../generated/CompoundPrizePoolBuilder/CompoundPrizePoolBuilder'

import { loadOrCreateComptroller } from './helpers/loadOrCreateComptroller'
import { loadOrCreateCompoundPrizePool } from './helpers/loadOrCreateCompoundPrizePool'


export function handleCompoundPrizePoolCreated(event: CompoundPrizePoolCreated): void {
  const compoundPrizePoolBuilderAddress = event.address
  const boundCompoundPrizePoolBuilder = CompoundPrizePoolBuilderContract.bind(compoundPrizePoolBuilderAddress)

  const comptroller = boundCompoundPrizePoolBuilder.comptroller()
  const trustedForwarder = boundCompoundPrizePoolBuilder.trustedForwarder()

  loadOrCreateComptroller(comptroller)

  loadOrCreateCompoundPrizePool(
    event.params.creator,
    event.params.prizePool,
    event.params.prizeStrategy,
    comptroller,
    trustedForwarder,
  )
}

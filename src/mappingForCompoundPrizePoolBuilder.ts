import { Address } from '@graphprotocol/graph-ts'

import {
  CompoundPrizePoolBuilder as CompoundPrizePoolBuilderContract,
} from '../generated/CompoundPrizePoolBuilder/CompoundPrizePoolBuilder'

import {
  CompoundPrizePoolCreated,
  SingleRandomWinnerCreated,
} from '../generated/CompoundPrizePoolBuilder/CompoundPrizePoolBuilder'

import { loadOrCreateComptroller } from './helpers/loadOrCreateComptroller'
import { loadOrCreateCompoundPrizePool } from './helpers/loadOrCreateCompoundPrizePool'
import { loadOrCreateSingleRandomWinner } from './helpers/loadOrCreateSingleRandomWinner'
import { createControlledToken } from './helpers/createControlledToken'


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

export function handleSingleRandomWinnerCreated(event: SingleRandomWinnerCreated): void {

  const singleRandomWinner = loadOrCreateSingleRandomWinner(
    event.params.singleRandomWinner,
  )

  const ticket = createControlledToken(
    'Ticket',
    event.params.ticket,
    Address.fromString(singleRandomWinner.prizePool),
    event.params.singleRandomWinner
  )
  const sponsorship = createControlledToken(
    'Sponsorship',
    event.params.sponsorship,
    Address.fromString(singleRandomWinner.prizePool),
    event.params.singleRandomWinner
  )

  singleRandomWinner.ticket = ticket.id
  singleRandomWinner.sponsorship = sponsorship.id

  singleRandomWinner.save()
}

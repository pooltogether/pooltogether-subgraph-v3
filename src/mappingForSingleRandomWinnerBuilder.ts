import { Address } from '@graphprotocol/graph-ts'

import {
  SingleRandomWinnerCreated,
} from '../generated/SingleRandomWinnerBuilder/SingleRandomWinnerBuilder'

import { loadOrCreateSingleRandomWinner } from './helpers/loadOrCreateSingleRandomWinner'
import { createControlledToken } from './helpers/createControlledToken'


export function handleSingleRandomWinnerCreated(event: SingleRandomWinnerCreated): void {

  const singleRandomWinner = loadOrCreateSingleRandomWinner(
    event.params.singleRandomWinner,
  )

  const ticket = createControlledToken(
    'Ticket',
    event.params.ticket,
    Address.fromString(singleRandomWinner.prizePool)
  )
  const sponsorship = createControlledToken(
    'Sponsorship',
    event.params.sponsorship,
    Address.fromString(singleRandomWinner.prizePool)
  )

  singleRandomWinner.ticket = ticket.id
  singleRandomWinner.sponsorship = sponsorship.id

  singleRandomWinner.save()
}

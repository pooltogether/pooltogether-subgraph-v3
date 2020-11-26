import { Address, ethereum } from '@graphprotocol/graph-ts'

// import {
//   SingleRandomWinnerCreated,
// } from '../generated/SingleRandomWinnerBuilder/SingleRandomWinnerBuilder'

import { loadOrCreateRandomWinners } from './helpers/loadOrCreateRandomWinners'
import { createControlledToken } from './helpers/createControlledToken'


export function handleRandomWinnersCreated(event: ethereum.Event): void {

  // const singleRandomWinner = loadOrCreateRandomWinners(
  //   event.params.singleRandomWinner,
  // )

  // const ticket = createControlledToken(
  //   'Ticket',
  //   event.params.ticket,
  //   Address.fromString(singleRandomWinner.prizePool)
  // )
  // const sponsorship = createControlledToken(
  //   'Sponsorship',
  //   event.params.sponsorship,
  //   Address.fromString(singleRandomWinner.prizePool)
  // )

  // singleRandomWinner.ticket = ticket.id
  // singleRandomWinner.sponsorship = sponsorship.id

  // singleRandomWinner.save()
}

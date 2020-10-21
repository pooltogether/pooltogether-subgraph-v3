import { Address } from '@graphprotocol/graph-ts'

import {
  Transfer,
} from '../generated/templates/ControlledToken/ControlledToken'

import {
  ControlledToken,
} from '../generated/schema'

import {
  decrementPlayerBalance,
  incrementPlayerBalance,
  decrementSponsorBalance,
  incrementSponsorBalance,
} from './helpers/prizePoolHelpers'

import {
  determineTransferType
} from './helpers/controlledTokenHelpers'

import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'
import { loadOrCreateSponsor } from './helpers/loadOrCreateSponsor'


export function handleTransfer(event: Transfer): void {
  const transferType = determineTransferType(event.params)

  // Currently only handling user to user transfers here
  // as depositing handles 'Minted' and withdraw handles 'Burned'
  if (transferType != 'UserToUser') { return }

  const token = ControlledToken.load(event.address.toHex())

  // Tickets
  if (token.type == 'Ticket') {
    const sendingPlayer = loadOrCreatePlayer(
      Address.fromString(token.prizePool),
      event.params.from
    )
    decrementPlayerBalance(sendingPlayer, event.params.value)
    sendingPlayer.save()

    const receivingPlayer = loadOrCreatePlayer(
      Address.fromString(token.prizePool),
      event.params.to
    )
    incrementPlayerBalance(receivingPlayer, event.params.value)
    receivingPlayer.save()
  }

  // Sponsorship
  if (token.type == 'Sponsorship') {
    const sendingSponsor = loadOrCreateSponsor(
      Address.fromString(token.prizePool),
      event.params.from
    )
    decrementSponsorBalance(sendingSponsor, event.params.value)
    sendingSponsor.save()

    const receivingSponsor = loadOrCreateSponsor(
      Address.fromString(token.prizePool),
      event.params.to
    )
    incrementSponsorBalance(receivingSponsor, event.params.value)
    receivingSponsor.save()
  }
}

import { Address } from '@graphprotocol/graph-ts'

import {
  Transfer,
  Transfer__Params
} from '../../generated/templates/ControlledToken/ControlledToken'

import {
  ControlledToken,
} from '../../generated/schema'

import {
  decrementPlayerBalance,
  incrementPlayerBalance,
  decrementSponsorBalance,
  incrementSponsorBalance,
} from './prizePoolHelpers'

import { loadOrCreatePlayer } from './loadOrCreatePlayer'
import { loadOrCreateSponsor } from './loadOrCreateSponsor'

import { ZERO_ADDRESS } from './common'

export function determineTransferType(params: Transfer__Params): string {
  let transferType = 'Mint'

  if (
    params.from.toHex() != ZERO_ADDRESS &&
    params.to.toHex() != ZERO_ADDRESS
  ) {
    transferType = 'UserToUser'
  } else if (params.to.toHex() == ZERO_ADDRESS) {
    transferType = 'Burn'
  }

  return transferType
}

export function userToUserTicketTransfer(_token: ControlledToken, _event: Transfer): void {
  const sendingPlayer = loadOrCreatePlayer(Address.fromString(_token.prizePool), _event.params.from)
  decrementPlayerBalance(sendingPlayer, _event.params.value)
  sendingPlayer.save()

  const receivingPlayer = loadOrCreatePlayer(Address.fromString(_token.prizePool), _event.params.to)
  incrementPlayerBalance(receivingPlayer, _event.params.value)
  receivingPlayer.save()
}

export function userToUserSponsorshipTransfer(_token: ControlledToken, _event: Transfer): void {
  const sendingSponsor = loadOrCreateSponsor(Address.fromString(_token.prizePool), _event.params.from)
  decrementSponsorBalance(sendingSponsor, _event.params.value)
  sendingSponsor.save()

  const receivingSponsor = loadOrCreateSponsor(Address.fromString(_token.prizePool), _event.params.to)
  incrementSponsorBalance(receivingSponsor, _event.params.value)
  receivingSponsor.save()
}

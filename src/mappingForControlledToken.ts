import {
  Transfer,
} from '../generated/templates/ControlledToken/ControlledToken'

import {
  ControlledToken,
} from '../generated/schema'

import {
  determineTransferType,
  userToUserTicketTransfer,
  userToUserSponsorshipTransfer,
} from './helpers/controlledTokenHelpers'

export function handleTransfer(event: Transfer): void {
  const transferType = determineTransferType(event.params)

  const token = ControlledToken.load(event.address.toHex()) as ControlledToken

  if (transferType === 'Mint') {
    token.totalSupply.plus(event.params.value)
  } else if (transferType === 'Burn') {
    token.totalSupply.minus(event.params.value)
  } else {
    if (token.type === 'Ticket') {
      userToUserTicketTransfer(token, event)
    } else if (token.type === 'Sponsorship') {
      userToUserSponsorshipTransfer(token, event)
    }
  }
}

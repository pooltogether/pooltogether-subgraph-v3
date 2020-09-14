import { Address } from '@graphprotocol/graph-ts'

import {
  Transfer,
} from '../generated/templates/ControlledToken/ControlledToken'

import {
  ControlledToken,
} from '../generated/schema'

import {
  decrementSponsorBalance,
  incrementSponsorBalance,
} from './helpers/prizePoolHelpers'

import {
  determineTransferType
} from './helpers/controlledTokenHelpers'

import { loadOrCreateSponsor } from './helpers/loadOrCreateSponsor'


export function handleTransfer(event: Transfer): void {
  const transferType = determineTransferType(event.params)

  // Currently only handling sponsor to sponsor transfers here
  // as Depositing handles 'Minted' and withdraw 'Burned'
  if (transferType !== 'UserToUser') { return }
    // log.warning('in Ticket#handleTransfer for UserToUser send', [])

  const token = ControlledToken.load(event.address.toHex())
  // const prizeStrategy = SingleRandomWinner.load(token.prizeStrategy)
  // const prizePool = PrizePool.load(token.prizePool)

  // Tickets
  // if (token.type === 'Ticket') {

  // }

  // Sponsorship
  if (token.type === 'Sponsorship') {
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

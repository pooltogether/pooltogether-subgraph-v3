import { Address, log } from '@graphprotocol/graph-ts'
import {
  Transfer,
} from '../generated/templates/Ticket/ControlledToken'
import {
  PrizeStrategy,
  PrizePool,
  Sponsorship,
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
  if (transferType == "UserToUser") {
    // log.warning('in Ticket#handleTransfer for UserToUser send', [])
    const _sponsorship = Sponsorship.load(event.address.toHex())
    const _prizeStrategy = PrizeStrategy.load(_sponsorship.prizeStrategy)
    const _prizePool = PrizePool.load(_prizeStrategy.prizePool)

    const _sendingSponsor = loadOrCreateSponsor(
      Address.fromString(_prizePool.id),
      event.params.from
    )
    decrementSponsorBalance(_sendingSponsor, event.params.value)

    _sendingSponsor.save()


    const _receivingSponsor = loadOrCreateSponsor(
      Address.fromString(_prizePool.id),
      event.params.to
    )

    incrementSponsorBalance(_receivingSponsor, event.params.value)

    _receivingSponsor.save()

    _prizePool.save()
  }

}

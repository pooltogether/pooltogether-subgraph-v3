import { Address, log } from '@graphprotocol/graph-ts'
import {
  Transfer
} from '../generated/templates/Ticket/ControlledToken'
import {
  PrizeStrategy,
  PrizePool,
  Ticket,
} from '../generated/schema'

import {
  decrementSponsorBalance,
  incrementSponsorBalance,
} from './helpers/prizePoolHelpers'
import { loadOrCreateSponsor } from './helpers/loadOrCreateSponsor'

export function handleTransfer(event: Transfer): void {
  const _ticket = Ticket.load(event.address.toHex())
  const _prizeStrategy = PrizeStrategy.load(_ticket.prizeStrategy)
  const _prizePool = PrizePool.load(_prizeStrategy.prizePool)

  log.warning("_prizePool.id: {}", [_prizePool.id])
  log.warning("event.from: {}", [event.params.from.toHex()])
  log.warning("event.to: {}", [event.params.to.toHex()])
  log.warning("event.value: {}", [event.params.value.toHex()])

  // const sendingSponsorsCachedBalance = _sendingSponsor.balance


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
  // const receivingSponsorsCachedBalance = _receivingSponsor.balance
  incrementSponsorBalance(_receivingSponsor, event.params.value)
  _receivingSponsor.save()

  // decrementSponsorCount(_prizePool as PrizePool, _sendingSponsor)
  // incrementSponsorCount(_prizePool as PrizePool, receivingSponsorsCachedBalance)

  _prizePool.save()
}

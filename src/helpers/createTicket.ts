import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Ticket,
} from '../../generated/schema'
import { Ticket as TicketTemplate } from '../../generated/templates'
import { ControlledToken as ControlledTokenContract } from '../../generated/templates/Ticket/ControlledToken'

export function createTicket(
  prizeStrategy: Address,
  ticketAddress: Address,
): Ticket {
  // Start listening for events from the dynamically generated contract
  TicketTemplate.create(ticketAddress)

  const _ticket = new Ticket(ticketAddress.toHex())
  _ticket.prizeStrategy = prizeStrategy.toHex()

  const boundTicket = ControlledTokenContract.bind(ticketAddress)
  _ticket.name = boundTicket.name()
  _ticket.symbol = boundTicket.symbol()
  _ticket.decimals = BigInt.fromI32(boundTicket.decimals())

  _ticket.save()

  return _ticket as Ticket
}

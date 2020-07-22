import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Ticket,
} from '../../generated/schema'
import { Ticket as TicketTemplate } from '../../generated/templates'
import { ControlledToken as ControlledTokenContract } from '../../generated/templates/Ticket/ControlledToken'

export function createTicket(
  prizePool: Address,
  ticketAddress: Address,
): Ticket {
  // Start listening for events from the dynamically generated contract
  TicketTemplate.create(ticketAddress)

  const ticket = new Ticket(ticketAddress.toHex())
  ticket.prizePool = prizePool.toHex()

  const boundTicket = ControlledTokenContract.bind(ticketAddress)
  ticket.name = boundTicket.name()
  ticket.symbol = boundTicket.symbol()
  ticket.decimals = BigInt.fromI32(boundTicket.decimals())

  ticket.save()

  return ticket as Ticket
}

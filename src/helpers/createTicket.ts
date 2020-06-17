import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Ticket,
} from '../../generated/schema'
import { PrizePoolModuleManager } from '../../generated/PrizePoolBuilder/PrizePoolModuleManager'
import { Ticket as TicketTemplate } from '../../generated/templates'
import { Ticket as TicketContract } from '../../generated/templates/Ticket/Ticket'

export function createTicket(
  moduleManager: Address,
  ticketAddress: Address,
): Ticket {
  // Start listening for events from the dynamically generated contract
  TicketTemplate.create(ticketAddress)

  const ticket = new Ticket(ticketAddress.toHex())
  const boundPrizePoolModuleManager = PrizePoolModuleManager.bind(moduleManager)

  ticket.prizePool = boundPrizePoolModuleManager.prizePool().toHex()
  ticket.prizePoolModuleManager = moduleManager.toHex()

  const boundTicket = TicketContract.bind(ticketAddress)
  ticket.name = boundTicket.name()
  ticket.symbol = boundTicket.symbol()
  ticket.decimals = BigInt.fromI32(boundTicket.decimals())

  ticket.save()

  return ticket as Ticket
}

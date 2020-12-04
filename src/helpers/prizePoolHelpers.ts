import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  SingleRandomWinner,
  Account,
  PrizeStrategy,
  PrizePool,
  ControlledToken,
} from '../../generated/schema'

import {
  ERC20 as ERC20Contract,
} from '../../generated/templates/PrizePool/ERC20'

import { ZERO, ONE } from './common'

export function updateTotals(_prizePool: PrizePool): void {
  const prizeStrategyId = _prizePool.prizeStrategy
  const prizeStrategy = PrizeStrategy.load(prizeStrategyId)
  const singleRandomWinner = SingleRandomWinner.load(prizeStrategy.singleRandomWinner)

  const ticketAddress = singleRandomWinner.ticket
  const ticket = ControlledToken.load(ticketAddress)
  const boundTicket = ERC20Contract.bind(Address.fromString(ticketAddress))
  ticket.totalSupply = boundTicket.totalSupply()
  ticket.save()

  const sponsorshipAddress = singleRandomWinner.sponsorship
  const sponsorship = ControlledToken.load(sponsorshipAddress)
  const boundSponsorship = ERC20Contract.bind(Address.fromString(sponsorshipAddress))
  sponsorship.totalSupply = boundSponsorship.totalSupply()
  sponsorship.save()

  _prizePool.totalSupply = ticket.totalSupply
  _prizePool.totalSponsorship = sponsorship.totalSupply
  _prizePool.save()
}



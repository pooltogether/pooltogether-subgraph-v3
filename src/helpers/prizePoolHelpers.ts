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

export function decrementPlayerCount(_prizePool: PrizePool, _player: Account): void {
  if (_player.balance.equals(ZERO)) {
    _prizePool.playerCount = _prizePool.playerCount.minus(ONE)

    _prizePool.save()
  }
}

export function incrementPlayerCount(_prizePool: PrizePool, playersCachedBalance: BigInt): void {
  if (playersCachedBalance.equals(ZERO)) {
    _prizePool.playerCount = _prizePool.playerCount.plus(ONE)

    _prizePool.save()
  }
}


// PLAYERS
export function decrementAccountBalance(_player: Account, amount: BigInt): void {
  _player.balance = _player.balance.minus(amount)
  _player.save()
}

export function incrementAccountBalance(_player: Account, amount: BigInt): void {
  _player.balance = _player.balance.plus(amount)
  _player.save()
}

export function decrementAccountTimelockedBalance(_player: Account, amount: BigInt): void {
  _player.timelockedBalance = _player.timelockedBalance.minus(amount)
  _player.save()
}

export function incrementAccountTimelockedBalance(_player: Account, amount: BigInt): void {
  _player.timelockedBalance = _player.timelockedBalance.plus(amount)
  _player.save()
}


// SPONSORS
// export function decrementSponsorBalance(_sponsor: Sponsor, amount: BigInt): void {
//   _sponsor.balance = _sponsor.balance.minus(amount)
//   _sponsor.save()
// }

// export function incrementSponsorBalance(_sponsor: Sponsor, amount: BigInt): void {
//   _sponsor.balance = _sponsor.balance.plus(amount)
//   _sponsor.save()
// }

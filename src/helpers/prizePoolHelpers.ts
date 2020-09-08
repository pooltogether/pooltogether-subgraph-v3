import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  Player,
  PrizeStrategy,
  PrizePool,
  Sponsor,
} from '../../generated/schema'
import {
  ERC20 as ERC20Contract,
} from '../../generated/templates/PrizePool/ERC20'

const ZERO = BigInt.fromI32(0)
const ONE = BigInt.fromI32(1)


// PRIZE POOLS
export function updateTotalTicketSupply(_prizePool: PrizePool): void {
  const _prizeStrategy = PrizeStrategy.load(_prizePool.prizeStrategy)

  const ticket = _prizeStrategy.ticket

  // TODO: handle edge cases like if token isn't ticket
  // event.params.token
  const boundTicket = ERC20Contract.bind(
    Address.fromString(ticket.toHexString())
  )
  _prizePool.totalSupply = boundTicket.totalSupply()

  _prizePool.save()
}

export function decrementPlayerCount(_prizePool: PrizePool, _player: Player): void {
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
export function decrementPlayerBalance(_player: Player, amount: BigInt): void {
  _player.balance = _player.balance.minus(amount)
  _player.save()
}

export function incrementPlayerBalance(_player: Player, amount: BigInt): void {
  _player.balance = _player.balance.plus(amount)
  _player.save()
}

export function decrementPlayerTimelockedBalance(_player: Player, amount: BigInt): void {
  _player.timelockedBalance = _player.timelockedBalance.minus(amount)
  _player.save()
}

export function incrementPlayerTimelockedBalance(_player: Player, amount: BigInt): void {
  _player.timelockedBalance = _player.timelockedBalance.plus(amount)
  _player.save()
}


// SPONSORS
export function decrementSponsorBalance(_sponsor: Sponsor, amount: BigInt): void {
  _sponsor.balance = _sponsor.balance.minus(amount)
  _sponsor.save()
}

export function incrementSponsorBalance(_sponsor: Sponsor, amount: BigInt): void {
  _sponsor.balance = _sponsor.balance.plus(amount)
  _sponsor.save()
}

import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts'
import {
  Player,
  PrizeStrategy,
  Prize,
  PrizePool,
} from '../generated/schema'

import {
  PrizePool as PrizePoolContract,
  TimelockDeposited,
  Deposited,
  Awarded,
  AwardedExternalERC20,
  AwardedExternalERC721,
  InstantWithdrawal,
  TimelockedWithdrawal,
  TimelockedWithdrawalSwept,
  PrizeStrategyDetached,
  OwnershipTransferred,
} from '../generated/templates/PrizePool/PrizePool'

import {
  decrementPlayerCount,
  incrementPlayerCount,
  decrementPlayerBalance,
  incrementPlayerBalance,
  decrementSponsorBalance,
  incrementSponsorBalance,
  decrementPlayerTimelockedBalance,
  incrementPlayerTimelockedBalance,
  updateTotals
} from './helpers/prizePoolHelpers'
import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'
import { loadOrCreateSponsor } from './helpers/loadOrCreateSponsor'
import { prizeId } from './helpers/idTemplates'

const ZERO = BigInt.fromI32(0)
const ONE = BigInt.fromI32(1)
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export function handleAwarded(event: Awarded): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  const _prizeStrategy = PrizeStrategy.load(_prizePool.prizeStrategy)

  const _prizeId = prizeId(
    _prizePool.prizeStrategy,
    _prizeStrategy.currentPrizeId.toString()
  )

  const _prize = Prize.load(_prizeId)
  const winner = event.params.winner.toHex()

  if (winner != ZERO_ADDRESS) {
    const winnerBytes = Bytes.fromHexString(winner) as Bytes
    _prize.winners = [winnerBytes]

    _prize.save()


    const _player = loadOrCreatePlayer(event.address, Address.fromString(winner))

    _player.cumulativeWinnings = _player.cumulativeWinnings.plus(event.params.amount)
    incrementPlayerBalance(_player, event.params.amount)

    _player.save()
  }
}

export function handleAwardedExternalERC20(event: AwardedExternalERC20): void {
  // TODO: implement this
  // This is emitted when external rewards (other tokens, etc)
  // are awarded
  log.warning('implement handleAwardedExternalERC20', [])
}

export function handleAwardedExternalERC721(event: AwardedExternalERC721): void {
  // TODO: implement this
  // This is emitted when external rewards (nfts, etc)
  // are awarded
  log.warning('implement handleAwardedExternalERC721', [])
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  // TODO: implement this
  // log.warning('implement handleOwnershipTransferred', [])
}

export function handleDeposited(event: Deposited): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  const _prizeStrategy = PrizeStrategy.load(_prizePool.prizeStrategy)

  const ticket = _prizeStrategy.ticket
  const token = event.params.token

  const ticketAddress = Address.fromString(ticket.toHexString())
  const ticketIsToken = (token.equals(ticketAddress))

  if (ticketIsToken) {
    const _player = loadOrCreatePlayer(
      Address.fromString(event.address.toHex()),
      event.params.to
    )
    
    const playersCachedBalance = _player.balance
    incrementPlayerCount(_prizePool as PrizePool, playersCachedBalance)

    updateTotals(_prizePool as PrizePool)

    // this shouldn't be necessary ... already done when creating!
    // _player.address = event.params.to
    // _player.prizePool = event.address.toHex()

    incrementPlayerBalance(_player, event.params.amount)
    // check what shares are, if still a thing?
    // _player.shares = _player.shares.plus(event.params.shares)

    _player.save()
  } else {
    const _sponsor = loadOrCreateSponsor(
      Address.fromString(event.address.toHex()),
      event.params.to
    )

    incrementSponsorBalance(_sponsor, event.params.amount)

    _sponsor.save()
  }

  _prizePool.save()
}

export function handleInstantWithdrawal(event: InstantWithdrawal): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  const _prizeStrategy = PrizeStrategy.load(_prizePool.prizeStrategy)

  const ticket = _prizeStrategy.ticket
  const sponsorship = _prizeStrategy.sponsorship
  const token = event.params.token

  const ticketAddress = Address.fromString(ticket.toHexString())
  const ticketIsToken = token.equals(ticketAddress)

  if (ticketIsToken) {
    const _player = loadOrCreatePlayer(
      Address.fromString(event.address.toHex()),
      event.params.from
    )

    decrementPlayerBalance(_player, event.params.amount)

    updateTotals(_prizePool as PrizePool)

    decrementPlayerCount(_prizePool as PrizePool, _player)

    _player.save()
  } else {
    const _sponsor = loadOrCreateSponsor(
      Address.fromString(event.address.toHex()),
      event.params.from
    )

    decrementSponsorBalance(_sponsor, event.params.amount)

    updateTotals(_prizePool as PrizePool)

    _sponsor.save()
  }

  _prizePool.save()
}

export function handleTimelockedWithdrawal(event: TimelockedWithdrawal): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  const _prizeStrategy = PrizeStrategy.load(_prizePool.prizeStrategy)

  // const timelock = Timelock.load(event.address.toHex())
  const _player = loadOrCreatePlayer(
    Address.fromString(event.address.toHex()),
    event.params.from
  )

  decrementPlayerCount(_prizePool as PrizePool, _player)
  
  decrementPlayerBalance(_player, event.params.amount)
  incrementPlayerTimelockedBalance(_player, event.params.amount)

  updateTotals(_prizePool as PrizePool)

  // This may need to be an association of many timelocked balances per player
  _player.unlockTimestamp = event.params.unlockTimestamp

  _player.save()
  _prizePool.save()
}

export function handleTimelockedWithdrawalSwept(event: TimelockedWithdrawalSwept): void {
  const _player = loadOrCreatePlayer(
    Address.fromString(event.address.toHex()),
    event.params.from
  )

  decrementPlayerTimelockedBalance(_player, event.params.amount)
  _player.unlockTimestamp = null

  _player.save()
}

// This happens when a player deposits some of their timelocked funds
// back into the pool
export function handleTimelockDeposited(event: TimelockDeposited): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  const _prizeStrategy = PrizeStrategy.load(_prizePool.prizeStrategy)

  const _player = loadOrCreatePlayer(
    Address.fromString(event.address.toHex()),
    event.params.to
  )

  const playersCachedBalance = _player.balance
  incrementPlayerCount(_prizePool as PrizePool, playersCachedBalance)

  updateTotals(_prizePool as PrizePool)

  decrementPlayerTimelockedBalance(_player, event.params.amount)
  incrementPlayerBalance(_player, event.params.amount)

  if (_player.timelockedBalance.equals(ZERO)) {
    _player.unlockTimestamp = null
  }

  _player.save()
  _prizePool.save()
}

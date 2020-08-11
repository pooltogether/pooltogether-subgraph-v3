import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import {
  Player,
  PrizeStrategy,
  Prize,
  PrizePool,
} from '../generated/schema'
import {
  ERC20 as ERC20Contract,
} from '../generated/templates/PrizePool/ERC20'

import {
  PrizePool as PrizePoolContract,
  CapturedAward,
  TimelockDeposited,
  Deposited,
  Awarded,
  AwardedExternal,
  InstantWithdrawal,
  TimelockedWithdrawal,
  TimelockedWithdrawalSwept,
  PrizeStrategyDetached,
} from '../generated/templates/PrizePool/PrizePool'

import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'
// import { loadOrCreatePrize } from './helpers/loadOrCreatePrize'
import { prizeId } from './helpers/idTemplates'

const ZERO = BigInt.fromI32(0)
const ONE = BigInt.fromI32(1)


function updateTotalTicketSupply(_prizePool: PrizePool): void {
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

function decrementPlayerCount(_prizePool: PrizePool, _player: Player): void {
  if (_player.balance.equals(ZERO)) {
    log.warning('in instantWithdrawal if!', [])
    _prizePool.playerCount = _prizePool.playerCount.minus(ONE)

    _prizePool.save()
  }
}

function incrementPlayerCount(_prizePool: PrizePool, playersCachedBalance: BigInt): void {
  if (playersCachedBalance.equals(ZERO)) {
    _prizePool.playerCount = _prizePool.playerCount.plus(ONE)

    _prizePool.save()
  }
}

function decrementPlayerBalance(_player: Player, amount: BigInt): void {
  _player.balance = _player.balance.minus(amount)
  _player.save()
}

function incrementPlayerBalance(_player: Player, amount: BigInt): void {
  _player.balance = _player.balance.plus(amount)
  _player.save()
}

function decrementPlayerTimelockedBalance(_player: Player, amount: BigInt): void {
  _player.timelockedBalance = _player.timelockedBalance.minus(amount)
  _player.save()
}

function incrementPlayerTimelockedBalance(_player: Player, amount: BigInt): void {
  _player.timelockedBalance = _player.timelockedBalance.plus(amount)
  _player.save()
}

export function handleCapturedAward(event: CapturedAward): void {
  // TODO!
  log.warning('no-op!', [])
}

export function handleAwarded(event: Awarded): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  const _prizeStrategy = PrizeStrategy.load(_prizePool.prizeStrategy)

  const _prizeId = prizeId(
    _prizePool.prizeStrategy,
    _prizeStrategy.currentPrizeId.toString()
  )

  const _prize = Prize.load(_prizeId)
  const winner = event.params.winner

  log.info('_prizeStrategy.currentPrizeId', [_prizeStrategy.currentPrizeId.toString()])
  log.info('winner', [winner.toString()])
  log.info('Address.fromI32(0)', [Address.fromI32(0).toString()])

  if (!winner.equals(Address.fromI32(0))) {
    _prize.winners = [winner.toHex()]
    _prize.save()
  }
}

export function handleAwardedExternal(event: AwardedExternal): void {
  // This is emitted when external rewards (other tokens, nfts, etc)
  // are awarded
  log.warning('implement handleAwardedExternal!', [])
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

    updateTotalTicketSupply(_prizePool as PrizePool)

    _player.address = event.params.to
    _player.prizePool = event.address.toHex()

    incrementPlayerBalance(_player, event.params.amount)
    // _player.shares = _player.shares.plus(event.params.shares)

    _player.save()
  } else if (token === _prizeStrategy.sponsorship) {
    // FILL IN SPONSORSHIP WHAT HAPPENS HERE

    // _sponsor.save()
  }

  _prizePool.save()
}

export function handleInstantWithdrawal(event: InstantWithdrawal): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  const _player = loadOrCreatePlayer(
    Address.fromString(event.address.toHex()),
    event.params.from
  )

  decrementPlayerBalance(_player, event.params.amount)
  // _player.shares = _player.shares.minus(event.params.shares)

  updateTotalTicketSupply(_prizePool as PrizePool)

  decrementPlayerCount(_prizePool as PrizePool, _player)
  log.warning('instantWithdrawal _player.balance: {}', [_player.balance.toString()])

  _prizePool.save()
  _player.save()
}

export function handleTimelockedWithdrawal(event: TimelockedWithdrawal): void {
  const _prizePool = PrizePool.load(event.address.toHex())

  // const timelock = Timelock.load(event.address.toHex())
  const _player = loadOrCreatePlayer(
    Address.fromString(event.address.toHex()),
    event.params.from
  )

  decrementPlayerCount(_prizePool as PrizePool, _player)
  
  decrementPlayerBalance(_player, event.params.amount)
  incrementPlayerTimelockedBalance(_player, event.params.amount)

  updateTotalTicketSupply(_prizePool as PrizePool)

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
  const _player = loadOrCreatePlayer(
    Address.fromString(event.address.toHex()),
    event.params.to
  )

  const playersCachedBalance = _player.balance
  incrementPlayerCount(_prizePool as PrizePool, playersCachedBalance)

  updateTotalTicketSupply(_prizePool as PrizePool)

  decrementPlayerTimelockedBalance(_player, event.params.amount)
  incrementPlayerBalance(_player, event.params.amount)

  if (_player.timelockedBalance.equals(ZERO)) {
    _player.unlockTimestamp = null
  }

  _player.save()
  _prizePool.save()
}

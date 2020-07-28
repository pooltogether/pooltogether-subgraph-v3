import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import {
  PrizeStrategy,
  PrizePool,
} from '../generated/schema'
import {
  ERC20 as ERC20Contract,
} from '../generated/templates/PrizePool/ERC20'

import {
  PrizePool as PrizePoolContract,
  Deposited,
  // Awarded,
  AwardedExternal,
  InstantWithdrawal,
  TimelockedWithdrawal,
  TimelockedWithdrawalSwept,
  PrizeStrategyDetached,
} from '../generated/templates/PrizePool/PrizePool'

import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'
// import { loadOrCreatePrize } from './helpers/loadOrCreatePrize'

const ZERO = BigInt.fromI32(0)
const ONE = BigInt.fromI32(1)

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
  
  if (token.equals(ticketAddress)) {
    const _player = loadOrCreatePlayer(
      Address.fromString(event.address.toHex()),
      event.params.to
    )
    
    log.warning('supply _player.balance: {}', [_player.balance.toString()])

    if (_player.balance.equals(ZERO)) {
      log.warning('in supply if!', [])
      log.warning('_prizePool.playerCount: {}', [_prizePool.playerCount.toString()])
      _prizePool.playerCount = _prizePool.playerCount.plus(ONE)
      log.warning('_prizePool.playerCount: {}', [_prizePool.playerCount.toString()])
    }

    const boundTicket = ERC20Contract.bind(
      Address.fromString(ticket.toHexString())
    )
    _prizePool.totalSupply = boundTicket.totalSupply()
    _prizePool.save()

    _player.address = event.params.to
    _player.prizePool = event.address.toHex()
    _player.balance = _player.balance.plus(event.params.amount)
    // _player.shares = _player.shares.plus(event.params.shares)
    _player.save()
  } else if (token === _prizeStrategy.sponsorship) {
    // FILL IN SPONSORSHIP WHAT HAPPENS HERE

  }
}

export function handleInstantWithdrawal(event: InstantWithdrawal): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  const _prizeStrategy = PrizeStrategy.load(_prizePool.prizeStrategy)
  const _player = loadOrCreatePlayer(
    Address.fromString(event.address.toHex()),
    event.params.from
  )

  _player.balance = _player.balance.minus(event.params.amount)
  // _player.shares = _player.shares.minus(event.params.shares)

  const boundTicket = ERC20Contract.bind(
    Address.fromString(_prizeStrategy.ticket.toHex())
  )
  _prizePool.totalSupply = boundTicket.totalSupply()

  log.warning('instantWithdrawal _player.balance: {}', [_player.balance.toString()])
  if (_player.balance.equals(ZERO)) {
    log.warning('in instantWithdrawal if!', [])
    _prizePool.playerCount = _prizePool.playerCount.minus(ONE)
  }

  _prizePool.save()
  _player.save()
}

export function handleTimelockedWithdrawal(event: TimelockedWithdrawal): void {
  // const timelock = Timelock.load(event.address.toHex())
  const player = loadOrCreatePlayer(
    Address.fromString(event.address.toHex()),
    event.params.from
  )

  // increment or decrement prize pool player count if balance is now 0

  // This may need to be an association of many timelocked balances per player
  player.timelockedBalance = player.timelockedBalance.plus(event.params.amount)
  player.unlockTimestamp = event.params.unlockTimestamp

  player.save()
}

export function handleTimelockedWithdrawalSwept(event: TimelockedWithdrawalSwept): void {
  // const _prizePool = PrizePool.load(event.address.toHex())
  const _player = loadOrCreatePlayer(
    Address.fromString(event.address.toHex()),
    event.params.from
  )

  _player.timelockedBalance = _player.timelockedBalance.minus(event.params.amount)
  // _player.unlockTimestamp = event.params.unlockTimestamp ?

  // increment or decrement prize pool player count if balance is now 0

  _player.save()
}



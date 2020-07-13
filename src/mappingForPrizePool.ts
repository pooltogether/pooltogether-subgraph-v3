import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import {
  PrizePool,
} from '../generated/schema'
import {
  ERC20 as ERC20Contract,
} from '../generated/templates/PrizePool/ERC20'

import {
  CompoundPeriodicPrizePool as CompoundPeriodicPrizePoolContract,
  CollateralRedeemed,
  CollateralSupplied,
  CollateralSwept,
  CollateralTimelocked,
  PrizePoolOpened,
  PrizePoolAwardStarted,
  PrizePoolAwardCompleted,
  PrincipalSupplied,
  PrincipalRedeemed,
  PrincipalCaptured,
} from '../generated/templates/CompoundPeriodicPrizePool/CompoundPeriodicPrizePool'

import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'
import { loadOrCreatePrize } from './helpers/loadOrCreatePrize'

const ZERO = BigInt.fromI32(0)
const ONE = BigInt.fromI32(1)

export function handlePrizePoolOpened(event: PrizePoolOpened): void {
  // no-op, handled when created by builder
}

export function handlePrizePoolAwardStarted(event: PrizePoolAwardStarted): void {
  const prizePool = PrizePool.load(event.address.toHexString())

  prizePool.currentState = "Started"
  prizePool.rngRequestId = event.params.rngRequestId
  prizePool.save()

  const prize = loadOrCreatePrize(event.address.toHexString(), prizePool.currentPrizeId.toString())

  prize.rewardStartedOperator = event.params.operator
  prize.rngRequestId = event.params.rngRequestId
  prize.save()
}

export function handlePrizePoolAwardCompleted(event: PrizePoolAwardCompleted): void {
  const prizePool = PrizePool.load(event.address.toHexString())
  const boundPrizePool = CompoundPeriodicPrizePoolContract.bind(event.address)
  
  // Record prize history
  const prize = loadOrCreatePrize(
    event.address.toHexString(),
    prizePool.currentPrizeId.toString()
  )

  prize.rewardCompletedOperator = event.params.operator
  prize.prize = event.params.prize
  prize.reserveFee = event.params.reserveFee
  prize.randomNumber = event.params.randomNumber

  prize.save()


  prizePool.currentState = "Awarded"
  prizePool.currentPrizeId = prizePool.currentPrizeId.plus(BigInt.fromI32(1))
  prizePool.previousPrize = boundPrizePool.previousPrize()
  prizePool.previousPrizeAverageTickets = boundPrizePool.previousPrizeAverageTickets()
  prizePool.rngRequestId = BigInt.fromI32(0)

  prizePool.save()
}









export function handlePrincipalSupplied(event: PrincipalSupplied): void {
  // const yieldService = YieldService.load(event.address.toHex())

  // const player = loadOrCreatePlayer(
  //   Address.fromString(yieldService.prizePool),
  //   event.params.from
  // )

  // player.address = event.params.from
  // player.prizePool = yieldService.prizePool
  // player.balance = player.balance.plus(event.params.amount)
  // // player.shares = player.shares.plus(event.params.shares)

  // player.save()
}

export function handlePrincipalRedeemed(event: PrincipalRedeemed): void {
  // const yieldService = YieldService.load(event.address.toHex())
}

export function handlePrincipalCaptured(event: PrincipalCaptured): void {
  // const yieldService = YieldService.load(event.address.toHex())
}


export function handleCollateralTimelocked(event: CollateralTimelocked): void {
  // const timelock = Timelock.load(event.address.toHex())
  const player = loadOrCreatePlayer(
    Address.fromString(event.address.toHex()),
    event.params.to
  )

  // increment or decrement prize pool player count if balance is now 0

  // This may need to be an association of many timelocked balances per player
  player.timelockedBalance = player.timelockedBalance.plus(event.params.amount)
  player.unlockTimestamp = event.params.unlockTimestamp

  player.save()
}

export function handleCollateralSwept(event: CollateralSwept): void {
  // const _prizePool = PrizePool.load(event.address.toHex())
  const _player = loadOrCreatePlayer(
    Address.fromString(event.address.toHex()),
    event.params.to
  )

  _player.timelockedBalance = _player.timelockedBalance.minus(event.params.amount)
  // _player.unlockTimestamp = event.params.unlockTimestamp ?

  // increment or decrement prize pool player count if balance is now 0

  _player.save()
}


export function handleCollateralSupplied(event: CollateralSupplied): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  const _player = loadOrCreatePlayer(
    Address.fromString(event.address.toHex()),
    event.params.user
  )

  log.warning('supply _player.balance: {}', [_player.balance.toString()])
  if (_player.balance.equals(ZERO)) {
    log.warning('in supply if!', [])
    log.warning('_prizePool.playerCount: {}', [_prizePool.playerCount.toString()])
    _prizePool.playerCount = _prizePool.playerCount.plus(ONE)
    log.warning('_prizePool.playerCount: {}', [_prizePool.playerCount.toString()])
  }

  const boundTicket = ERC20Contract.bind(Address.fromString(_prizePool.ticket.toHex()))
  _prizePool.totalSupply = boundTicket.totalSupply()
  _prizePool.save()
  
  _player.address = event.params.user
  _player.prizePool = event.address.toHex()
  _player.balance = _player.balance.plus(event.params.collateral)
  // _player.shares = _player.shares.plus(event.params.shares)

  _player.save()
}

export function handleCollateralRedeemed(event: CollateralRedeemed): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  const _player = loadOrCreatePlayer(
    Address.fromString(event.address.toHex()),
    event.params.user
  )

  _player.balance = _player.balance.minus(event.params.collateral)
  // _player.shares = _player.shares.minus(event.params.shares)

  const boundTicket = ERC20Contract.bind(Address.fromString(_prizePool.ticket.toHex()))
  _prizePool.totalSupply = boundTicket.totalSupply()

  log.warning('redeem _player.balance: {}', [_player.balance.toString()])
  if (_player.balance.equals(ZERO)) {
    log.warning('in redeem if!', [])
    _prizePool.playerCount = _prizePool.playerCount.minus(ONE)
  }

  _prizePool.save()
  _player.save()
}

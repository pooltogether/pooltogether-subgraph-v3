import { Address, Bytes, log } from '@graphprotocol/graph-ts'
import {
  SingleRandomWinner,
  PrizeStrategy,
  PrizePool,
} from '../generated/schema'

import { loadOrCreatePrize } from './helpers/loadOrCreatePrize'

import {
  Initialized,
  ControlledTokenAdded,
  ReserveFeeControlledTokenSet,
  ReserveFeeCaptured,
  LiquidityCapSet,
  Deposited,
  TimelockDeposited,
  Awarded,
  AwardedExternalERC20,
  AwardedExternalERC721,
  InstantWithdrawal,
  TimelockedWithdrawal,
  TimelockedWithdrawalSwept,
  CreditPlanSet,
  PrizeStrategySet,
  EmergencyShutdown,
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
import { loadOrCreatePrizeStrategy } from './helpers/loadOrCreatePrizeStrategy'
import { loadOrCreatePrizePoolCreditRate } from './helpers/loadOrCreatePrizePoolCreditRate'

import { ZERO, ZERO_ADDRESS } from './helpers/common'


export function handleInitialized(event: Initialized): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  _prizePool.comptroller = event.params.comptroller.toHex()
  _prizePool.trustedForwarder = event.params.trustedForwarder
  _prizePool.maxExitFeeMantissa = event.params.maxExitFeeMantissa
  _prizePool.maxTimelockDuration = event.params.maxTimelockDuration
  _prizePool.save()
}

export function handleControlledTokenAdded(event: ControlledTokenAdded): void {
  log.warning('implement handleControlledTokenAdded!', [])
}
export function handleReserveFeeControlledTokenSet(event: ReserveFeeControlledTokenSet): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  _prizePool.reserveFeeControlledToken = event.params.token
  _prizePool.save()
}

export function handleLiquidityCapSet(event: LiquidityCapSet): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  _prizePool.liquidityCap = event.params.liquidityCap
  _prizePool.save()
}

export function handleCreditPlanSet(event: CreditPlanSet): void {
  const _creditRate = loadOrCreatePrizePoolCreditRate(event.address, event.params.token)
  _creditRate.creditLimitMantissa = event.params.creditLimitMantissa
  _creditRate.creditRateMantissa = event.params.creditRateMantissa
  _creditRate.save()
}

export function handlePrizeStrategySet(event: PrizeStrategySet): void {
  const _prizePoolAddress = event.address
  const _prizeStrategyAddress = event.params.prizeStrategy
  const _prizeStrategy = loadOrCreatePrizeStrategy(_prizePoolAddress, _prizeStrategyAddress)
  _prizeStrategy.singleRandomWinner = _prizeStrategyAddress.toHex()
  _prizeStrategy.save()
}

export function handleEmergencyShutdown(event: EmergencyShutdown): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  _prizePool.deactivated = true
  _prizePool.save()
}

export function handleReserveFeeCaptured(event: ReserveFeeCaptured): void {
  const _prizePool = PrizePool.load(event.address.toHex())
  _prizePool.cumulativePrizeReserveFee = _prizePool.cumulativePrizeReserveFee.plus(event.params.amount)
  _prizePool.save()

}

export function handleAwarded(event: Awarded): void {
  const _prizePool = PrizePool.load(event.address.toHex())

  // Record prize history
  const _prize = loadOrCreatePrize(
    event.address.toHex(),
    _prizePool.currentPrizeId.toString()
  )
  _prize.amount = event.params.amount


  const winner = event.params.winner.toHex()
  if (winner != ZERO_ADDRESS) {
    const winnerBytes = Bytes.fromHexString(winner) as Bytes
    _prize.winners = [winnerBytes]

    const _player = loadOrCreatePlayer(event.address, Address.fromString(winner))
    _player.cumulativeWinnings = _player.cumulativeWinnings.plus(event.params.amount)
    incrementPlayerBalance(_player, event.params.amount)
    _player.save()
  }

  _prize.save()

  // Update Pool (Reserve Fee updated in handleReserveFeeCaptured)
  _prizePool.cumulativePrizeNet = _prizePool.cumulativePrizeNet.plus(event.params.amount)
  _prizePool.cumulativePrizeGross = _prizePool.cumulativePrizeNet.plus(_prizePool.cumulativePrizeReserveFee)
  _prizePool.save()
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
  const _prizePool = PrizePool.load(event.address.toHex())
  _prizePool.owner = event.params.newOwner
  _prizePool.save()
}

export function handleDeposited(event: Deposited): void {
  const _prizePoolAddress = event.address.toHex()
  const _prizePool = PrizePool.load(_prizePoolAddress)

  const _prizeStrategyId = _prizePool.prizeStrategy
  const _prizeStrategy = PrizeStrategy.load(_prizeStrategyId)

  const _singleRandomWinner = SingleRandomWinner.load(_prizeStrategy.singleRandomWinner)

  const tokenAddress = event.params.token
  const ticketAddress = Address.fromString(_singleRandomWinner.ticket)
  const ticketIsToken = (tokenAddress.equals(ticketAddress))

  if (ticketIsToken) {
    const _player = loadOrCreatePlayer(
      Address.fromString(_prizePoolAddress),
      event.params.to
    )

    const playersCachedBalance = _player.balance
    incrementPlayerCount(_prizePool as PrizePool, playersCachedBalance)

    updateTotals(_prizePool as PrizePool)

    incrementPlayerBalance(_player, event.params.amount)

    _player.save()
  } else {
    const _sponsor = loadOrCreateSponsor(
      Address.fromString(_prizePoolAddress),
      event.params.to
    )

    incrementSponsorBalance(_sponsor, event.params.amount)

    updateTotals(_prizePool as PrizePool)

    _sponsor.save()
  }

  _prizePool.save()
}

export function handleInstantWithdrawal(event: InstantWithdrawal): void {
  const _prizePoolAddress = event.address.toHex()
  const _prizePool = PrizePool.load(_prizePoolAddress)

  const _prizeStrategyId = _prizePool.prizeStrategy
  const _prizeStrategy = PrizeStrategy.load(_prizeStrategyId)

  const _singleRandomWinner = SingleRandomWinner.load(_prizeStrategy.singleRandomWinner)

  const ticket = _singleRandomWinner.ticket
  const token = event.params.token

  const ticketAddress = Address.fromString(ticket)
  const ticketIsToken = token.equals(ticketAddress)

  if (ticketIsToken) {
    const _player = loadOrCreatePlayer(
      Address.fromString(_prizePoolAddress),
      event.params.from
    )

    decrementPlayerBalance(_player, event.params.amount)

    updateTotals(_prizePool as PrizePool)

    decrementPlayerCount(_prizePool as PrizePool, _player)

    _player.save()
  } else {
    const _sponsor = loadOrCreateSponsor(
      Address.fromString(_prizePoolAddress),
      event.params.from
    )

    decrementSponsorBalance(_sponsor, event.params.amount)

    updateTotals(_prizePool as PrizePool)

    _sponsor.save()
  }

  _prizePool.save()
}

export function handleTimelockedWithdrawal(event: TimelockedWithdrawal): void {
  const _prizePoolAddress = event.address.toHex()
  const _prizePool = PrizePool.load(_prizePoolAddress)

  const _player = loadOrCreatePlayer(
    Address.fromString(_prizePoolAddress),
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
  const _prizePoolAddress = event.address.toHex()
  const _player = loadOrCreatePlayer(
    Address.fromString(_prizePoolAddress),
    event.params.from
  )

  decrementPlayerTimelockedBalance(_player, event.params.amount)
  _player.unlockTimestamp = null

  _player.save()
}

// This happens when a player deposits some of their timelocked funds
// back into the pool
export function handleTimelockDeposited(event: TimelockDeposited): void {
  const _prizePoolAddress = event.address.toHex()
  const _prizePool = PrizePool.load(_prizePoolAddress)

  const _player = loadOrCreatePlayer(
    Address.fromString(_prizePoolAddress),
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

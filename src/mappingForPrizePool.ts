import { Address, Bytes, log, store } from '@graphprotocol/graph-ts'
import {
  PrizeStrategy,
  PrizePool,
  PrizePoolAccount,
} from '../generated/schema'

import {
  Initialized,
  ControlledTokenAdded,
  ReserveFeeCaptured,
  LiquidityCapSet,
  TimelockDeposited,
  Awarded,
  AwardedExternalERC20,
  AwardedExternalERC721,
  TimelockedWithdrawal,
  TimelockedWithdrawalSwept,
  CreditPlanSet,
  PrizeStrategySet,
  OwnershipTransferred,
} from '../generated/templates/PrizePool/PrizePool'


import { loadOrCreatePrize } from './helpers/loadOrCreatePrize'

import { loadOrCreatePrizePool } from './helpers/loadOrCreatePrizePool'
import { loadOrCreatePrizeStrategy } from './helpers/loadOrCreatePrizeStrategy'
import { loadOrCreatePrizePoolCreditRate } from './helpers/loadOrCreatePrizePoolCreditRate'
import { loadOrCreateAwardedExternalErc20Token, loadOrCreateAwardedExternalErc721Nft } from './helpers/loadOrCreateAwardedExternalErc'
import { loadOrCreateExternalErc721Award } from './helpers/loadOrCreateExternalAward'

import { ZERO } from './helpers/common'


export function handleInitialized(event: Initialized): void {
  const _prizePool = loadOrCreatePrizePool(event.address)
  _prizePool.reserveRegistry = event.params.reserveRegistry
  _prizePool.trustedForwarder = event.params.trustedForwarder
  _prizePool.maxExitFeeMantissa = event.params.maxExitFeeMantissa
  _prizePool.maxTimelockDuration = event.params.maxTimelockDuration
  _prizePool.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const _prizePool = loadOrCreatePrizePool(event.address)
  _prizePool.owner = event.params.newOwner
  _prizePool.save()
}

export function handleControlledTokenAdded(event: ControlledTokenAdded): void {
  log.warning('implement handleControlledTokenAdded!', [])
}

export function handleLiquidityCapSet(event: LiquidityCapSet): void {
  const _prizePool = loadOrCreatePrizePool(event.address)
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

  const _prizeStrategy = loadOrCreatePrizeStrategy(_prizeStrategyAddress)
  _prizeStrategy.singleRandomWinner = _prizeStrategyAddress.toHex()
  _prizeStrategy.save()

  const _prizePool = loadOrCreatePrizePool(_prizePoolAddress)
  _prizePool.prizeStrategy = _prizeStrategy.id
  _prizePool.save()
}

export function handleReserveFeeCaptured(event: ReserveFeeCaptured): void {
  const _prizePool = loadOrCreatePrizePool(event.address)
  _prizePool.cumulativePrizeReserveFee = _prizePool.cumulativePrizeReserveFee.plus(event.params.amount)
  _prizePool.save()

}

export function handleAwarded(event: Awarded): void {
  const _prizePool = loadOrCreatePrizePool(event.address)

  // Record prize history
  const _prize = loadOrCreatePrize(
    event.address.toHex(),
    _prizePool.currentPrizeId.toString()
  )
  _prize.amount = event.params.amount

  const winner = event.params.winner
  const existingWinners = _prize.winners
  _prize.winners = new Array(existingWinners.push(winner))
  _prize.save()

  // increment accumulative winnings
  const prizePoolAccount = PrizePoolAccount.load(generateCompositeId(_prizePool.id, winner.toHex()))
  prizePoolAccount.cumulativeWinnings = prizePoolAccount.cumulativeWinnings.plus(event.params.amount)
  prizePoolAccount.save()

  // Update Pool (Reserve Fee updated in handleReserveFeeCaptured)
  _prizePool.cumulativePrizeNet = _prizePool.cumulativePrizeNet.plus(event.params.amount)
  _prizePool.cumulativePrizeGross = _prizePool.cumulativePrizeNet.plus(_prizePool.cumulativePrizeReserveFee)
  _prizePool.save()
}

export function handleAwardedExternalERC20(event: AwardedExternalERC20): void {
  const _prizePool = loadOrCreatePrizePool(event.address)

  const _prize = loadOrCreatePrize(
    event.address.toHex(),
    _prizePool.currentPrizeId.toString()
  )

  const awardedErc20Token = loadOrCreateAwardedExternalErc20Token(
    _prize,
    event.params.token
  )

  awardedErc20Token.balanceAwarded = event.params.amount

  awardedErc20Token.save()
}

// This is emitted when external rewards (nfts, etc) are awarded
export function handleAwardedExternalERC721(event: AwardedExternalERC721): void {
  const _prizePool = loadOrCreatePrizePool(event.address)

  const _prize = loadOrCreatePrize(
    event.address.toHex(),
    _prizePool.currentPrizeId.toString()
  )

  const _prizeStrategyId = _prizePool.prizeStrategy
  const _prizeStrategy = PrizeStrategy.load(_prizeStrategyId)

  const awardedExternalErc721Nft = loadOrCreateAwardedExternalErc721Nft(
    _prize,
    _prizeStrategy as PrizeStrategy,
    event.params.token
  )
  awardedExternalErc721Nft.save()


  const externalErc721 = loadOrCreateExternalErc721Award(
    _prizeStrategy.id,
    event.params.token
  )
  store.remove('ExternalErc721Award', externalErc721.id)
}


export function handleTimelockedWithdrawal(event: TimelockedWithdrawal): void {
  const _prizePoolAddress = event.address
  const prizePool = loadOrCreatePrizePool(_prizePoolAddress)

  // load PrizePoolAccount and update unlockedTimestamp and timelockedBalance
  let prizePoolAccount = PrizePoolAccount.load(generateCompositeId(prizePool.id, event.params.from.toHex()))
  prizePoolAccount.unlockTimestamp = event.params.unlockTimestamp
  prizePoolAccount.timelockedBalance = prizePoolAccount.timelockedBalance.plus(event.params.amount)
  
  // decrement PrizePool timelocked total balance
  prizePool.timelockTotalSupply = prizePool.timelockTotalSupply.minus(event.params.amount)

  // save touched entities
  prizePoolAccount.save()
  prizePool.save()
  
}

export function handleTimelockedWithdrawalSwept(event: TimelockedWithdrawalSwept): void {

  let prizePoolAccount = PrizePoolAccount.load(generateCompositeId(event.address.toHex(), event.params.from.toHex()))
  prizePoolAccount.timelockedBalance = ZERO
  prizePoolAccount.unlockTimestamp = ZERO
  
  let prizePool = PrizePool.load(event.address.toHex())
  prizePool.timelockTotalSupply = prizePool.timelockTotalSupply.minus(event.params.amount)

  prizePool.save()
  prizePoolAccount.save()
}

// This happens when a player deposits some of their timelocked funds
// back into the pool
export function handleTimelockDeposited(event: TimelockDeposited): void {
  const _prizePoolAddress = event.address
  const _prizePool = loadOrCreatePrizePool(_prizePoolAddress)

  // decrement account.timelockBalance
  //decrement PrizePool.totalTimelockSuuply
  _prizePool.timelockTotalSupply = _prizePool.timelockTotalSupply.minus(event.params.amount)
  
  const prizePoolAccount = PrizePoolAccount.load(generateCompositeId(_prizePool.id, event.params.to.toHex()))
  prizePoolAccount.timelockedBalance = prizePoolAccount.timelockedBalance.minus(event.params.amount)

  _prizePool.save()
}


function generateCompositeId(key1: string, key2: string) : string{
  return key1+"-"+key2
}
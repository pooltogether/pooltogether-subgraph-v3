import { BigInt, log } from '@graphprotocol/graph-ts'
import {
  PrizePool,
  PrizeStrategy,
} from '../generated/schema'

import {
  PrizePool as PrizePoolContract,
} from '../generated/templates/PrizePool/PrizePool'
import {
  RNGInterface as RngContract,
} from '../generated/templates/PrizeStrategy/RNGInterface'
import {
  PrizeStrategy as PrizeStrategyContract,
  PrizePoolOpened,
  PrizePoolAwardStarted,
  PrizePoolAwarded,
  ExitFeeUpdated,
  CreditRateUpdated,
  RngServiceUpdated,
} from '../generated/templates/PrizeStrategy/PrizeStrategy'

import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'
import { loadOrCreatePrize } from './helpers/loadOrCreatePrize'

const ZERO = BigInt.fromI32(0)
const ONE = BigInt.fromI32(1)

export function handlePrizePoolOpened(event: PrizePoolOpened): void {
  // no-op
  //
  // const _prizeStrategy = PrizeStrategy.load(event.address.toHexString())

  // const _prize = loadOrCreatePrize(
  //   event.address.toHexString(),
  //   _prizeStrategy.currentPrizeId.toString()
  // )
  // _prize.prizeStrategy = event.address.toHex()
  // _prize.save()
}

export function handlePrizePoolAwardStarted(event: PrizePoolAwardStarted): void {
  const _prizeStrategy = PrizeStrategy.load(event.address.toHex())
  const boundPrizeStrategy = PrizeStrategyContract.bind(event.address)

  _prizeStrategy.currentState = "Started"
  _prizeStrategy.prizesCount = _prizeStrategy.prizesCount.plus(ONE)
  _prizeStrategy.save()


  const prize = loadOrCreatePrize(
    event.address,
    _prizeStrategy.currentPrizeId.toString()
  )

  prize.prizePeriodStartedTimestamp = boundPrizeStrategy.prizePeriodStartedAt()
  prize.lockBlock = event.params.rngLockBlock

  prize.awardStartOperator = event.params.operator
  prize.rngRequestId = event.params.rngRequestId

  prize.save()
}

export function handlePrizePoolAwarded(event: PrizePoolAwarded): void {
  const _prizeStrategy = PrizeStrategy.load(event.address.toHexString())
  const _prizePool = PrizePool.load(_prizeStrategy.prizePool)
  const boundPrizeStrategy = PrizeStrategyContract.bind(event.address)
  const boundRng = RngContract.bind(boundPrizeStrategy.rng())
  
  // Record prize history
  const prize = loadOrCreatePrize(
    event.address,
    _prizeStrategy.currentPrizeId.toString()
  )

  prize.awardedOperator = event.params.operator

  prize.reserveFee = event.params.reserveFee
  prize.net = event.params.prize
  prize.gross = prize.net

  if (event.params.reserveFee.gt(ZERO)) {
    prize.gross = prize.net.plus(prize.reserveFee as BigInt)
  }

  const randomNumber = boundRng.randomNumber(prize.rngRequestId)
  prize.randomNumber = randomNumber

  prize.awardedBlock = event.block.number
  prize.awardedTimestamp = event.block.timestamp

  prize.totalTicketSupply = _prizePool.totalSupply

  prize.save()

  _prizeStrategy.currentState = "Awarded"
  // log.warning('old _prizeStrategy.currentPrizeId: {}', [_prizeStrategy.currentPrizeId.toString()])

  _prizeStrategy.currentPrizeId = _prizeStrategy.currentPrizeId.plus(
    BigInt.fromI32(1)
  )

  // log.warning('new _prizeStrategy.currentPrizeId: {}', [_prizeStrategy.currentPrizeId.toString()])

  _prizeStrategy.save()


  // Update Pool
  _prizePool.cumulativePrizeGross = _prizePool.cumulativePrizeGross.plus(prize.gross as BigInt)
  _prizePool.cumulativePrizeReserveFee = _prizePool.cumulativePrizeReserveFee.plus(event.params.reserveFee)
  _prizePool.cumulativePrizeNet = _prizePool.cumulativePrizeNet.plus(event.params.prize)

  _prizePool.save()
}


export function handleExitFeeUpdated(event: ExitFeeUpdated): void {
  const _prizeStrategy = PrizeStrategy.load(event.address.toHexString())

  _prizeStrategy.exitFeeMantissa = event.params.exitFeeMantissa

  _prizeStrategy.save()
}

export function handleCreditRateUpdated(event: CreditRateUpdated): void {
  const _prizeStrategy = PrizeStrategy.load(event.address.toHexString())

  _prizeStrategy.creditRateMantissa = event.params.creditRateMantissa

  _prizeStrategy.save()
}

export function handleRngServiceUpdated(event: RngServiceUpdated): void {
  const _prizeStrategy = PrizeStrategy.load(event.address.toHexString())

  _prizeStrategy.rng = event.params.rngService

  _prizeStrategy.save()
}

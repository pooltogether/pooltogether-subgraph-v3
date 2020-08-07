import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import {
  PrizePool,
  PrizeStrategy,
} from '../generated/schema'
import {
  ERC20 as ERC20Contract,
} from '../generated/templates/PrizePool/ERC20'

import {
  RNGInterface as RngContract,
} from '../generated/templates/PrizeStrategy/RNGInterface'
import {
  PrizeStrategy as PrizeStrategyContract,
  PrizePoolOpened,
  PrizePoolAwardStarted,
  PrizePoolAwarded,
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
  const boundPrizeStrategy = PrizeStrategyContract.bind(event.address)
  const boundRng = RngContract.bind(boundPrizeStrategy.rng())
  
  // Record prize history
  const prize = loadOrCreatePrize(
    event.address,
    _prizeStrategy.currentPrizeId.toString()
  )

  prize.awardedOperator = event.params.operator

  prize.net = event.params.prize
  prize.reserveFee = event.params.reserveFee
  prize.gross = ZERO
  if (event.params.reserveFee.gt(ZERO)) {
    prize.gross = prize.net.plus(prize.reserveFee as BigInt)
  }

  const randomNumber = boundRng.randomNumber(prize.rngRequestId)
  prize.randomNumber = randomNumber

  const winner = boundPrizeStrategy.draw(randomNumber)
  prize.winners = [winner.toHex()]

  prize.awardedBlock = event.block.number
  prize.awardedTimestamp = event.block.timestamp

  prize.save()

  // _prizeStrategy.previousPrize = boundPrizePool.previousPrize()
  // _prizeStrategy.previousPrizeAverageTickets = boundPrizePool.previousPrizeAverageTickets()
  // _prizeStrategy.rngRequestId = BigInt.fromI32(0)
  
  _prizeStrategy.currentState = "Awarded"
  _prizeStrategy.currentPrizeId = _prizeStrategy.currentPrizeId.plus(
    BigInt.fromI32(1)
  )

  _prizeStrategy.save()
}

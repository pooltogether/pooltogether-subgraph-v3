import { BigInt } from '@graphprotocol/graph-ts'
import {
  PrizePool,
} from '../generated/schema'
import {
  CompoundPeriodicPrizePool as CompoundPeriodicPrizePoolContract,
  PrizePoolOpened,
  PrizePoolAwardStarted,
  PrizePoolAwardCompleted,
} from '../generated/templates/CompoundPeriodicPrizePool/CompoundPeriodicPrizePool'

import { loadOrCreatePrize } from './helpers/loadOrCreatePrize'

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
  const prize = loadOrCreatePrize(event.address.toHexString(), prizePool.currentPrizeId.toString())

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

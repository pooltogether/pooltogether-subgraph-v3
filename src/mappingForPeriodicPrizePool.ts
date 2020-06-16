import { BigInt } from '@graphprotocol/graph-ts'
import {
  PeriodicPrizePool,
} from '../generated/schema'
import {
  PeriodicPrizePool as PeriodicPrizePoolContract,
  PrizePoolOpened,
  PrizePoolAwardStarted,
  PrizePoolAwardCompleted,
} from '../generated/templates/PeriodicPrizePool/PeriodicPrizePool'

import { loadOrCreatePrize } from './helpers/loadOrCreatePrize'

export function handlePrizePoolOpened(event: PrizePoolOpened): void {
  // no-op, handled when created by builder
}

export function handlePrizePoolAwardStarted(event: PrizePoolAwardStarted): void {
  const periodicPrizePool = PeriodicPrizePool.load(event.address.toHexString())

  periodicPrizePool.currentState = "Started"
  periodicPrizePool.rngRequestId = event.params.rngRequestId
  periodicPrizePool.save()

  const prize = loadOrCreatePrize(event.address.toHexString(), periodicPrizePool.currentPrizeId.toString())

  prize.rewardStartedOperator = event.params.operator
  prize.rngRequestId = event.params.rngRequestId
  prize.save()
}

export function handlePrizePoolAwardCompleted(event: PrizePoolAwardCompleted): void {
  const periodicPrizePool = PeriodicPrizePool.load(event.address.toHexString())
  const boundPeriodicPrizePool = PeriodicPrizePoolContract.bind(event.address)
  
  // Record prize history
  const prize = loadOrCreatePrize(event.address.toHexString(), periodicPrizePool.currentPrizeId.toString())

  prize.rewardCompletedOperator = event.params.operator
  prize.prize = event.params.prize
  prize.reserveFee = event.params.reserveFee
  prize.randomNumber = event.params.randomNumber

  prize.save()


  periodicPrizePool.currentState = "Awarded"
  periodicPrizePool.currentPrizeId = periodicPrizePool.currentPrizeId.plus(BigInt.fromI32(1))
  periodicPrizePool.previousPrize = boundPeriodicPrizePool.previousPrize()
  periodicPrizePool.previousPrizeAverageTickets = boundPeriodicPrizePool.previousPrizeAverageTickets()
  periodicPrizePool.rngRequestId = BigInt.fromI32(0)

  periodicPrizePool.save()
}

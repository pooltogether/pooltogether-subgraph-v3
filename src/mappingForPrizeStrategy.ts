import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import {
  PrizePool,
} from '../generated/schema'
import {
  ERC20 as ERC20Contract,
} from '../generated/templates/PrizePool/ERC20'

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

export function handlePrizePoolAwarded(event: PrizePoolAwarded): void {
  const prizePool = PrizePool.load(event.address.toHexString())
  const boundPrizePool = PrizeStrategyContract.bind(event.address)
  
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

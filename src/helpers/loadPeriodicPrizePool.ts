import { Address } from "@graphprotocol/graph-ts"
import {
  PeriodicPrizePool as PeriodicPrizePoolContract,
} from '../../generated/templates/PeriodicPrizePool/PeriodicPrizePool'
import {
  PeriodicPrizePool,
} from '../../generated/schema'

export function loadPeriodicPrizePool(
  periodicPrizePoolAddress: Address,
): PeriodicPrizePool {
  let periodicPrizePool = PeriodicPrizePool.load(periodicPrizePoolAddress.toHex())

  const boundPeriodicPrizePool = PeriodicPrizePoolContract.bind(periodicPrizePoolAddress)

  periodicPrizePool.prizeStrategy = boundPeriodicPrizePool.prizeStrategy()

  periodicPrizePool.prizePeriodSeconds = boundPeriodicPrizePool.prizePeriodSeconds()
  periodicPrizePool.prizePeriodStartedAt = boundPeriodicPrizePool.prizePeriodStartedAt()

  periodicPrizePool.rng = boundPeriodicPrizePool.rng()

  periodicPrizePool.save()

  return periodicPrizePool as PeriodicPrizePool
}

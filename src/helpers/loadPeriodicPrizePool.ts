import { Address } from "@graphprotocol/graph-ts"
import {
  PeriodicPrizePool as PeriodicPrizePoolContract,
} from '../../generated/PeriodicPrizePool/PeriodicPrizePool'
import {
  PeriodicPrizePool,
} from '../../generated/templates'

export function loadPeriodicPrizePool(
  periodicPrizePoolAddress: Address,
): PeriodicPrizePool {
  let periodicPrizePool = PeriodicPrizePool.load(periodicPrizePoolAddress.toHex())

  const boundPeriodicPrizePool = PeriodicPrizePoolContract.bind(periodicPrizePoolAddress)

  periodicPrizePool.prizeStrategy = boundPeriodicPrizePool.prizeStrategy()

  periodicPrizePool.prizePeriodSeconds = boundPeriodicPrizePool.prizePeriodSeconds()
  periodicPrizePool.prizePeriodStartedAt = boundPeriodicPrizePool.prizePeriodStartedAt()

  periodicPrizePool.governor = boundPeriodicPrizePool.governor()
  periodicPrizePool.rng = boundPeriodicPrizePool.rng()

  periodicPrizePool.save()

  return periodicPrizePool as PeriodicPrizePool
}

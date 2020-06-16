import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  PeriodicPrizePool,
  Prize,
} from '../../generated/schema'
import { PeriodicPrizePool as PeriodicPrizePoolContract } from '../../generated/templates/PeriodicPrizePool/PeriodicPrizePool'
import { PeriodicPrizePool as PeriodicPrizePoolTemplate } from '../../generated/templates'

import { prizeId } from './idTemplates'

export function createPeriodicPrizePool(
  moduleManager: Address,
  periodicPrizePoolAddress: Address,
): PeriodicPrizePool {
  // Start listening for events from the dynamically generated contract
  PeriodicPrizePoolTemplate.create(periodicPrizePoolAddress)

  const periodicPrizePool = new PeriodicPrizePool(periodicPrizePoolAddress.toHex())
  const boundPeriodicPrizePool = PeriodicPrizePoolContract.bind(periodicPrizePoolAddress)

  periodicPrizePool.currentPrizeId = BigInt.fromI32(1)

  periodicPrizePool.prizePoolModuleManager = moduleManager.toHex()

  periodicPrizePool.prizeStrategy = boundPeriodicPrizePool.prizeStrategy()
  periodicPrizePool.rng = boundPeriodicPrizePool.rng()

  periodicPrizePool.prizePeriodSeconds = boundPeriodicPrizePool.prizePeriodSeconds()
  periodicPrizePool.prizePeriodStartedAt = boundPeriodicPrizePool.prizePeriodStartedAt()

  periodicPrizePool.currentState = "Opened"

  periodicPrizePool.save()


  const prize = new Prize(prizeId(
    periodicPrizePoolAddress.toHexString(),
    periodicPrizePool.currentPrizeId.toString()
  ))
  prize.prizePool = periodicPrizePoolAddress.toHex()
  prize.save()
  

  return periodicPrizePool as PeriodicPrizePool
}

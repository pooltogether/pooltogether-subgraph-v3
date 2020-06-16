import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  PrizePoolModuleManager as PrizePoolModuleManagerContract,
} from '../../generated/PrizePoolBuilder/PrizePoolModuleManager'
import {
  PrizePoolModuleManager,
} from '../../generated/schema'

import { createPeriodicPrizePool } from '../helpers/createPeriodicPrizePool'

export function loadOrCreatePrizePoolModuleManager(
  blockNumber: BigInt,
  builder: Address,
  creator: Address,
  moduleManager: Address,
  prizeStrategy: Address,
): PrizePoolModuleManager {
  let prizePoolModuleManager = PrizePoolModuleManager.load(moduleManager.toHex())

  if (!prizePoolModuleManager) {
    prizePoolModuleManager = new PrizePoolModuleManager(moduleManager.toHex())
    const boundPrizePoolModuleManager = PrizePoolModuleManagerContract.bind(moduleManager)

    prizePoolModuleManager.prizePoolBuilder = builder.toHex()
    prizePoolModuleManager.creator = creator
    prizePoolModuleManager.prizeStrategy = prizeStrategy

    prizePoolModuleManager.block = blockNumber

    prizePoolModuleManager.yieldService = boundPrizePoolModuleManager.yieldService()
    prizePoolModuleManager.ticket = boundPrizePoolModuleManager.ticket()
    prizePoolModuleManager.credit = boundPrizePoolModuleManager.credit()
    prizePoolModuleManager.sponsorship = boundPrizePoolModuleManager.sponsorship()
    prizePoolModuleManager.timelock = boundPrizePoolModuleManager.timelock()
    prizePoolModuleManager.prizePool = boundPrizePoolModuleManager.prizePool()
    prizePoolModuleManager.interestTracker = boundPrizePoolModuleManager.interestTracker()

    createPeriodicPrizePool(
      moduleManager,
      boundPrizePoolModuleManager.prizePool()
    )

    prizePoolModuleManager.save()
  }

  return prizePoolModuleManager as PrizePoolModuleManager
}

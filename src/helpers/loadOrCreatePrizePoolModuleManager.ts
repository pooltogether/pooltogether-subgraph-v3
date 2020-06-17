import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  PrizePoolModuleManager as PrizePoolModuleManagerContract,
} from '../../generated/PrizePoolBuilder/PrizePoolModuleManager'
import {
  PrizePoolModuleManager,
} from '../../generated/schema'

import { createInterestTracker } from '../helpers/createInterestTracker'
import { createPeriodicPrizePool } from '../helpers/createPeriodicPrizePool'
import { createSponsorship } from '../helpers/createSponsorship'
import { createTicket } from '../helpers/createTicket'
import { createTimelock } from '../helpers/createTimelock'
import { createYieldService } from '../helpers/createYieldService'

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

    createInterestTracker(
      moduleManager,
      boundPrizePoolModuleManager.interestTracker()
    )

    createPeriodicPrizePool(
      moduleManager,
      boundPrizePoolModuleManager.prizePool()
    )

    createSponsorship(
      moduleManager,
      boundPrizePoolModuleManager.sponsorship()
    )

    createTicket(
      moduleManager,
      boundPrizePoolModuleManager.ticket()
    )

    createTimelock(
      moduleManager,
      boundPrizePoolModuleManager.timelock()
    )

    createYieldService(
      moduleManager,
      boundPrizePoolModuleManager.yieldService()
    )

    prizePoolModuleManager.save()
  }

  return prizePoolModuleManager as PrizePoolModuleManager
}

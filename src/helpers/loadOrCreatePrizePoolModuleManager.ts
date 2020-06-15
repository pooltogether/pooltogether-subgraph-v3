import { Address, BigInt, DataSourceContext, log } from "@graphprotocol/graph-ts"
import {
  PrizePoolModuleManager as PrizePoolModuleManagerContract,
} from '../../generated/PrizePoolBuilder/PrizePoolModuleManager'
import {
  PeriodicPrizePool,
  PrizePoolModuleManager,
} from '../../generated/schema'
import { PeriodicPrizePool as PeriodicPrizePoolContract } from '../../generated/templates/PeriodicPrizePool/PeriodicPrizePool'
import { PeriodicPrizePool as PeriodicPrizePoolTemplate } from '../../generated/templates'

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



    // Start watching dynamically generated contracts
    PeriodicPrizePoolTemplate.create(boundPrizePoolModuleManager.prizePool())

    const periodicPrizePoolAddress = boundPrizePoolModuleManager.prizePool()
    const periodicPrizePool = new PeriodicPrizePool(periodicPrizePoolAddress.toHex())
    const boundPeriodicPrizePool = PeriodicPrizePoolContract.bind(periodicPrizePoolAddress)

    periodicPrizePool.prizePoolModuleManager = moduleManager.toHex()

    periodicPrizePool.prizeStrategy = boundPeriodicPrizePool.prizeStrategy()
    periodicPrizePool.rng = boundPeriodicPrizePool.rng()

    periodicPrizePool.prizePeriodSeconds = boundPeriodicPrizePool.prizePeriodSeconds()
    periodicPrizePool.prizePeriodStartedAt = boundPeriodicPrizePool.prizePeriodStartedAt()

    periodicPrizePool.save()



    prizePoolModuleManager.save()
  }

  return prizePoolModuleManager as PrizePoolModuleManager
}

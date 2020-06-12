import { Address, BigInt, DataSourceContext } from "@graphprotocol/graph-ts"
import {
  PrizePoolModuleManager as PrizePoolModuleManagerContract,
} from '../../generated/PrizePoolBuilder/PrizePoolModuleManager'
import {
  PoolManager,
} from '../../generated/schema'
import { PeriodicPrizePool } from '../../generated/templates'

export function loadOrCreatePoolManager(
  creator: Address,
  moduleManager: Address,
  prizeStrategy: Address,
): PoolManager {
  let poolManager = PoolManager.load(moduleManager.toHex())

  if (!poolManager) {
    poolManager = new PoolManager(moduleManager.toHex())
    const boundPoolManager = PrizePoolModuleManagerContract.bind(moduleManager)

    poolManager.creator = creator
    poolManager.prizeStrategy = prizeStrategy

    // poolManager.block = event.block.number

    poolManager.yieldService = boundPoolManager.yieldService()
    poolManager.ticket = boundPoolManager.ticket()
    poolManager.credit = boundPoolManager.credit()
    poolManager.sponsorship = boundPoolManager.sponsorship()
    poolManager.timelock = boundPoolManager.timelock()
    poolManager.prizePool = boundPoolManager.prizePool()
    poolManager.interestTracker = boundPoolManager.interestTracker()

    // Store Dynamically generated contracts
    // PeriodicPrizePool.create(boundPoolManager.prizePool())

    let context = new DataSourceContext()
    context.setBigInt("prizePeriodSeconds", BigInt.fromI32(1))
    PeriodicPrizePool.createWithContext(boundPoolManager.prizePool(), context)

    poolManager.save()
  }

  return poolManager as PoolManager
}

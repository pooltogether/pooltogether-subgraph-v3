import { Address, log } from "@graphprotocol/graph-ts"
import {
  YieldService,
} from '../../generated/schema'
import { PrizePoolModuleManager } from '../../generated/PrizePoolBuilder/PrizePoolModuleManager'
import { 
  YieldService as YieldServiceTemplate,
} from '../../generated/templates'
import {
  CompoundYieldService as CompoundYieldServiceContract,
} from '../../generated/templates/YieldService/CompoundYieldService'
import {
  CTokenInterface as CTokenInterface,
} from '../../generated/PrizePoolBuilder/CTokenInterface'

export function createYieldService(
  moduleManager: Address,
  yieldServiceAddress: Address,
): YieldService {
  // Start listening for events from the dynamically generated contract
  YieldServiceTemplate.create(yieldServiceAddress)

  const yieldService = new YieldService(yieldServiceAddress.toHex())
  const boundPrizePoolModuleManager = PrizePoolModuleManager.bind(moduleManager)

  yieldService.prizePool = boundPrizePoolModuleManager.prizePool().toHex()
  yieldService.prizePoolModuleManager = moduleManager.toHex()

  const boundYieldService = CompoundYieldServiceContract.bind(yieldServiceAddress)
  yieldService.yieldServiceToken = boundYieldService.token().toHex()

  yieldService.accountedBalance = boundYieldService.accountedBalance()
  yieldService.balance = boundYieldService.balance()
  yieldService.unaccountedBalance = boundYieldService.unaccountedBalance()

  const boundCToken = CTokenInterface.bind(boundYieldService.token())
  yieldService.token = boundCToken.underlying().toHex()
  // yieldService.supplyRatePerBlock = boundCToken.supplyRatePerBlock()
  // yieldService.type = 'cToken' // down the road set this via createWithContext (instead of create())

  yieldService.unaccountedBalance = boundYieldService.unaccountedBalance()

  yieldService.save()

  return yieldService as YieldService
}

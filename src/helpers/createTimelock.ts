import { Address, log } from "@graphprotocol/graph-ts"
import {
  Timelock,
} from '../../generated/schema'
import { PrizePoolModuleManager } from '../../generated/PrizePoolBuilder/PrizePoolModuleManager'
import { 
  Timelock as TimelockTemplate,
} from '../../generated/templates'

export function createTimelock(
  moduleManager: Address,
  timelockAddress: Address,
): Timelock {
  // Start listening for events from the dynamically generated contract
  TimelockTemplate.create(timelockAddress)

  const timelock = new Timelock(timelockAddress.toHex())
  const boundPrizePoolModuleManager = PrizePoolModuleManager.bind(moduleManager)

  timelock.prizePool = boundPrizePoolModuleManager.prizePool().toHex()
  timelock.prizePoolModuleManager = moduleManager.toHex()

  timelock.save()

  return timelock as Timelock
}

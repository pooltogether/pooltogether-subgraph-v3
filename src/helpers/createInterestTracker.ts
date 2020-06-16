import { Address } from "@graphprotocol/graph-ts"
import {
  InterestTracker,
} from '../../generated/schema'
import { PrizePoolModuleManager } from '../../generated/PrizePoolBuilder/PrizePoolModuleManager'
import { InterestTracker as InterestTrackerTemplate } from '../../generated/templates'

export function createInterestTracker(
  moduleManager: Address,
  interestTrackerAddress: Address,
): InterestTracker {
  // Start listening for events from the dynamically generated contract
  InterestTrackerTemplate.create(interestTrackerAddress)

  const interestTracker = new InterestTracker(interestTrackerAddress.toHex())
  const boundPrizePoolModuleManager = PrizePoolModuleManager.bind(moduleManager)

  interestTracker.prizePool = boundPrizePoolModuleManager.prizePool().toHex()
  interestTracker.prizePoolModuleManager = moduleManager.toHex()

  interestTracker.save()

  return interestTracker as InterestTracker
}

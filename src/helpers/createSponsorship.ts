import { Address } from "@graphprotocol/graph-ts"
import {
  Sponsorship,
} from '../../generated/schema'
import { PrizePoolModuleManager } from '../../generated/PrizePoolBuilder/PrizePoolModuleManager'
import { Sponsorship as SponsorshipTemplate } from '../../generated/templates'

export function createSponsorship(
  moduleManager: Address,
  sponsorshipAddress: Address,
): Sponsorship {
  // Start listening for events from the dynamically generated contract
  SponsorshipTemplate.create(sponsorshipAddress)

  const sponsorship = new Sponsorship(sponsorshipAddress.toHex())
  const boundPrizePoolModuleManager = PrizePoolModuleManager.bind(moduleManager)

  sponsorship.prizePool = boundPrizePoolModuleManager.prizePool().toHex()
  sponsorship.prizePoolModuleManager = moduleManager.toHex()

  sponsorship.save()

  return sponsorship as Sponsorship
}

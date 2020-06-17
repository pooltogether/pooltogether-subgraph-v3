import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Sponsorship,
} from '../../generated/schema'
import { PrizePoolModuleManager } from '../../generated/PrizePoolBuilder/PrizePoolModuleManager'
import { Sponsorship as SponsorshipTemplate } from '../../generated/templates'
import { Sponsorship as SponsorshipContract } from '../../generated/templates/Sponsorship/Sponsorship'

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

  const boundSponsorship = SponsorshipContract.bind(sponsorshipAddress)
  sponsorship.name = boundSponsorship.name()
  sponsorship.symbol = boundSponsorship.symbol()
  sponsorship.decimals = BigInt.fromI32(boundSponsorship.decimals())

  sponsorship.save()

  return sponsorship as Sponsorship
}

import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Sponsorship,
} from '../../generated/schema'
import { Sponsorship as SponsorshipTemplate } from '../../generated/templates'
import { ControlledToken as ControlledTokenContract } from '../../generated/templates/Sponsorship/ControlledToken'

export function createSponsorship(
  prizePool: Address,
  sponsorshipAddress: Address,
): Sponsorship {
  // Start listening for events from the dynamically generated contract
  SponsorshipTemplate.create(sponsorshipAddress)

  const sponsorship = new Sponsorship(sponsorshipAddress.toHex())
  sponsorship.prizePool = prizePool.toHex()

  const boundSponsorship = ControlledTokenContract.bind(sponsorshipAddress)
  sponsorship.name = boundSponsorship.name()
  sponsorship.symbol = boundSponsorship.symbol()
  sponsorship.decimals = BigInt.fromI32(boundSponsorship.decimals())

  sponsorship.save()

  return sponsorship as Sponsorship
}

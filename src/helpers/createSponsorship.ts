import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Sponsorship,
} from '../../generated/schema'
import { Sponsorship as SponsorshipTemplate } from '../../generated/templates'
import { ControlledToken as ControlledTokenContract } from '../../generated/templates/Sponsorship/ControlledToken'

export function createSponsorship(
  prizeStrategy: Address,
  sponsorshipAddress: Address,
): Sponsorship {
  // Start listening for events from the dynamically generated contract
  SponsorshipTemplate.create(sponsorshipAddress)

  const _sponsorship = new Sponsorship(sponsorshipAddress.toHex())
  _sponsorship.prizeStrategy = prizeStrategy.toHex()

  const boundSponsorship = ControlledTokenContract.bind(sponsorshipAddress)
  _sponsorship.name = boundSponsorship.name()
  _sponsorship.symbol = boundSponsorship.symbol()
  _sponsorship.decimals = BigInt.fromI32(boundSponsorship.decimals())

  _sponsorship.save()

  return _sponsorship as Sponsorship
}

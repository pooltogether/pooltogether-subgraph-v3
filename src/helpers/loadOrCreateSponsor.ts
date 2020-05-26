import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  Sponsor
} from '../../generated/schema'

const ZERO = BigInt.fromI32(0)

function formatSponsorId(sponsorAddress: Address, poolAddress: Address): string {
  return 'sponsor-' + sponsorAddress.toHex() + '_pool-' + poolAddress.toHex()
}

export function loadOrCreateSponsor(sponsorAddress: Address, poolAddress: Address): Sponsor {
  let sponsorId = formatSponsorId(sponsorAddress, poolAddress)
  let sponsor = Sponsor.load(sponsorId)
  if (!sponsor) {
    sponsor = new Sponsor(sponsorId)
    sponsor.address = sponsorAddress
    sponsor.sponsorshipAndFeeBalance = ZERO
    sponsor.poolContract = poolAddress.toHex()
  }
  return sponsor as Sponsor
}

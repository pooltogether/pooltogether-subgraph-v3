import { Address } from '@graphprotocol/graph-ts'

import {
  Sponsor
} from '../../generated/schema'


function formatSponsorId(sponsorAddress: Address, poolAddress: Address): string {
  return 'sponsor-' + sponsorAddress.toHex() + '_pool-' + poolAddress.toHex()
}

export function loadSponsor(sponsorAddress: Address, poolAddress: Address): Sponsor {
  let sponsorId = formatSponsorId(sponsorAddress, poolAddress)
  return Sponsor.load(sponsorId) as Sponsor
}

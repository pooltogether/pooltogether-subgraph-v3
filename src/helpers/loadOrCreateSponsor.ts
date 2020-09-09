import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { Sponsor } from '../../generated/schema'

import { playerId } from './idTemplates'

const ZERO = BigInt.fromI32(0)

export function loadOrCreateSponsor(
  prizePool: Address,
  player: Address
): Sponsor {
  const id = playerId(prizePool.toHex(), player.toHex())
  let _sponsor = Sponsor.load(id)

  if (!_sponsor) {
    _sponsor = new Sponsor(id)

    _sponsor.prizePool = prizePool.toHex()
    
    _sponsor.address = player
    _sponsor.balance = ZERO

    _sponsor.save()
  }

  return _sponsor as Sponsor
}

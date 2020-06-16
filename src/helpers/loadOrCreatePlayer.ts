import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { Player } from '../../generated/schema'

import { playerId } from './idTemplates'

export function loadOrCreatePlayer(
  prizePool: Address,
  player: Address
): Player {
  const id = playerId(prizePool.toHex(), player.toHex())
  let _player = Player.load(id)

  if (!_player) {
    _player = new Player(id)

    log.warning('_player {}', [player.toHex()])
    _player.prizePool = prizePool.toHex()
    // log.warning('Address from String {}', [Address.fromString(player).toString()])
    _player.address = player
    _player.balance = BigInt.fromI32(0)

    _player.save()
  }

  return _player as Player
}

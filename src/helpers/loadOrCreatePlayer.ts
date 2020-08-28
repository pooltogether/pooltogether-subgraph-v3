import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { Player } from '../../generated/schema'

import { playerId } from './idTemplates'

const ZERO = BigInt.fromI32(0)

export function loadOrCreatePlayer(
  prizePool: Address,
  player: Address
): Player {
  const id = playerId(prizePool.toHex(), player.toHex())
  let _player = Player.load(id)

  if (!_player) {
    _player = new Player(id)

    // log.warning('Creating new _player {}', [player.toHex()])
    _player.prizePool = prizePool.toHex()
    // log.warning('Address from String {}', [Address.fromString(player).toString()])
    _player.address = player
    _player.balance = ZERO

    _player.timelockedBalance = ZERO
    _player.unlockTimestamp = ZERO
    
    _player.cumulativeWinnings = ZERO

    _player.save()
  } else {
    // log.warning('Found existing _player {}', [player.toHex()])
  }

  return _player as Player
}

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

    _player.prizePool = prizePool.toHex()
    _player.address = player
    _player.balance = ZERO

    _player.timelockedBalance = ZERO
    _player.unlockTimestamp = ZERO
    
    _player.cumulativeWinnings = ZERO

    _player.save()
  }

  return _player as Player
}

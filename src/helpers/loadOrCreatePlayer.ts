import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import {
  Player,
  DripTokenPlayer,
  BalanceDripPlayer,
} from '../../generated/schema'

import {
  playerId,
  dripTokenPlayerId,
  balanceDripPlayerId,
} from './idTemplates'

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
    _player.address = player
    _player.balance = BigInt.fromI32(0)

    _player.timelockedBalance = BigInt.fromI32(0)
    _player.unlockTimestamp = BigInt.fromI32(0)

    _player.save()
  }

  return _player as Player
}


export function loadOrCreateDripTokenPlayer(
  comptroller: Address,
  dripToken: Address,
  player: Address
): DripTokenPlayer {
  const _playerId = dripTokenPlayerId(comptroller.toHex(), dripToken.toHex(), player.toHex())
  let _player = DripTokenPlayer.load(_playerId)

  if (!_player) {
    _player = new DripTokenPlayer(_playerId)

    log.warning('_player {}', [player.toHex()])
    _player.dripToken = dripToken
    _player.comptroller = comptroller.toHex()
    _player.address = player
    _player.balance = BigInt.fromI32(0)
    _player.save()
  }

  return _player as DripTokenPlayer
}


export function loadOrCreateBalanceDripPlayer(
  comptroller: Address,
  player: Address,
  balanceDripId: string
): BalanceDripPlayer {
  const _playerId = balanceDripPlayerId(comptroller.toHex(), player.toHex(), balanceDripId)
  let _player = BalanceDripPlayer.load(_playerId)

  if (!_player) {
    _player = new BalanceDripPlayer(_playerId)

    log.warning('_player {}', [player.toHex()])
    _player.balanceDrip = balanceDripId
    _player.address = player
    _player.lastExchangeRateMantissa = BigInt.fromI32(0)
    _player.save()
  }

  return _player as BalanceDripPlayer
}

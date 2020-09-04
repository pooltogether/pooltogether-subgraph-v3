import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import {
  Player,
  DripTokenPlayer,
  BalanceDripPlayer,
  VolumeDripPlayer,
} from '../../generated/schema'

import {
  playerId,
  dripTokenPlayerId,
  balanceDripPlayerId,
  volumeDripPlayerId,
} from './idTemplates'

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


export function loadOrCreateDripTokenPlayer(
  comptroller: Address,
  dripToken: Address,
  player: Address
): DripTokenPlayer {
  const _playerId = dripTokenPlayerId(comptroller.toHex(), dripToken.toHex(), player.toHex())
  let _player = DripTokenPlayer.load(_playerId)

  if (!_player) {
    _player = new DripTokenPlayer(_playerId)

    log.warning('DripTokenPlayer {}', [player.toHex()])
    _player.dripToken = dripToken
    _player.comptroller = comptroller.toHex()
    _player.address = player
    _player.balance = BigInt.fromI32(0)
    _player.save()
  }

  return _player as DripTokenPlayer
}


export function loadOrCreateBalanceDripPlayer(
  balanceDripId: string,
  player: Address,
): BalanceDripPlayer {
  const _playerId = balanceDripPlayerId(balanceDripId, player.toHex())
  let _player = BalanceDripPlayer.load(_playerId)

  if (!_player) {
    _player = new BalanceDripPlayer(_playerId)

    log.warning('BalanceDripPlayer {}', [player.toHex()])
    _player.balanceDrip = balanceDripId
    _player.address = player
    _player.save()
  }

  return _player as BalanceDripPlayer
}

export function loadOrCreateVolumeDripPlayer(
  volumeDripId: string,
  player: Address,
): VolumeDripPlayer {
  const _playerId = volumeDripPlayerId(volumeDripId, player.toHex())
  let _player = VolumeDripPlayer.load(_playerId)

  if (!_player) {
    _player = new VolumeDripPlayer(_playerId)

    log.warning('VolumeDripPlayer {}', [player.toHex()])
    _player.volumeDrip = volumeDripId
    _player.address = player
    _player.periodIndex = BigInt.fromI32(0)
    _player.balance = BigInt.fromI32(0)
    _player.save()
  }

  return _player as VolumeDripPlayer
}

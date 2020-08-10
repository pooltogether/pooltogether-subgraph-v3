import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import {
  Comptroller,
  BalanceDrip,
  PlayerBalanceDrip,
  VolumeDrip,
} from '../../generated/schema'

import {
  Comptroller as ComptrollerContract,
} from '../../generated/Comptroller/Comptroller'

import {
  balanceDripId,
  playerBalanceDripId,
  volumeDripId,
} from './idTemplates'

export function loadOrCreateComptroller(
  comptrollerAddress: Address
): Comptroller {
  const id = comptrollerAddress.toHex()
  let _comptroller = Comptroller.load(id)

  if (!_comptroller) {
    _comptroller = new Comptroller(id)
    const boundComptroller = ComptrollerContract.bind(comptrollerAddress)

    const callResult = boundComptroller.try_reserveRateMantissa()
    if (callResult.reverted) {
      log.info("Comptroller->reserveRateMantissa reverted", [])
    } else {
      _comptroller.reserveRateMantissa = callResult.value
    }

    _comptroller.save()
  }

  return _comptroller as Comptroller
}


export function loadOrCreateBalanceDrip(
  comptrollerAddress: Address,
  prizeStrategyAddress: Address,
  measureTokenAddress: Address,
  dripTokenAddress: Address
): BalanceDrip {
  const id = balanceDripId(
    comptrollerAddress.toHex(),
    prizeStrategyAddress.toHex(),
    measureTokenAddress.toHex(),
    dripTokenAddress.toHex()
  )
  let _balanceDrip = BalanceDrip.load(id)

  if (!_balanceDrip) {
    _balanceDrip = new BalanceDrip(id)
    _balanceDrip.prizeStrategy = prizeStrategyAddress.toHex()
    _balanceDrip.measureToken = measureTokenAddress
    _balanceDrip.dripToken = dripTokenAddress
    _balanceDrip.removed = false
    _balanceDrip.save()
  }

  return _balanceDrip as BalanceDrip
}


export function loadOrCreatePlayerBalanceDrip(
  comptrollerAddress: Address,
  prizeStrategyAddress: Address,
  playerAddress: Address,
  balanceDripAddress: string
): PlayerBalanceDrip {
  const id = playerBalanceDripId(
    comptrollerAddress.toHex(),
    prizeStrategyAddress.toHex(),
    playerAddress.toHex()
  )
  let _playerBalanceDrip = PlayerBalanceDrip.load(id)

  if (!_playerBalanceDrip) {
    _playerBalanceDrip = new PlayerBalanceDrip(id)
    _playerBalanceDrip.player = playerAddress.toHex()
    _playerBalanceDrip.balanceDrip = balanceDripAddress
    _playerBalanceDrip.save()
  }

  return _playerBalanceDrip as PlayerBalanceDrip
}


export function loadOrCreateVolumeDrip(
  comptrollerAddress: Address,
  prizeStrategyAddress: Address,
  volumeDripIndex: BigInt
): VolumeDrip {
  const id = volumeDripId(comptrollerAddress.toHex(), prizeStrategyAddress.toHex(), volumeDripIndex.toHex())
  let _volumeDrip = VolumeDrip.load(id)

  if (!_volumeDrip) {
    _volumeDrip = new VolumeDrip(id)
    _volumeDrip.prizeStrategy = prizeStrategyAddress.toHex()
    _volumeDrip.index = volumeDripIndex
    _volumeDrip.save()
  }

  return _volumeDrip as VolumeDrip
}

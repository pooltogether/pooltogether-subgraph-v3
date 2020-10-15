import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  Comptroller,
  BalanceDrip,
  VolumeDrip,
  VolumeDripPeriod,
} from '../../generated/schema'

import {
  Comptroller as ComptrollerContract,
} from '../../generated/Comptroller/Comptroller'

import {
  dripTokenId,
  volumeDripPeriodId,
} from './idTemplates'


export function loadOrCreateComptroller(
  comptrollerAddress: Address
): Comptroller {
  const id = comptrollerAddress.toHex()
  let _comptroller = Comptroller.load(id)

  if (!_comptroller) {
    _comptroller = new Comptroller(id)
    const boundComptroller = ComptrollerContract.bind(comptrollerAddress)

    _comptroller.owner = boundComptroller.owner()
    _comptroller.save()
  }

  return _comptroller as Comptroller
}


export function loadOrCreateBalanceDrip(
  comptrollerAddress: Address,
  sourceAddress: Address,
  measureTokenAddress: Address,
  dripTokenAddress: Address
): BalanceDrip {
  const id = dripTokenId(
    comptrollerAddress.toHex(),
    sourceAddress.toHex(),
    measureTokenAddress.toHex(),
    dripTokenAddress.toHex()
  )
  let _balanceDrip = BalanceDrip.load(id)

  if (!_balanceDrip) {
    _balanceDrip = new BalanceDrip(id)
    _balanceDrip.sourceAddress = sourceAddress
    _balanceDrip.measureToken = measureTokenAddress
    _balanceDrip.dripToken = dripTokenAddress
    _balanceDrip.deactivated = false
    _balanceDrip.save()
  }

  return _balanceDrip as BalanceDrip
}


export function loadOrCreateVolumeDrip(
  comptrollerAddress: Address,
  sourceAddress: Address,
  measureTokenAddress: Address,
  dripTokenAddress: Address,
  isReferral: boolean
): VolumeDrip {
  const id = dripTokenId(
    comptrollerAddress.toHex(),
    sourceAddress.toHex(),
    measureTokenAddress.toHex(),
    dripTokenAddress.toHex(),
    isReferral.toString()
  )
  let _volumeDrip = VolumeDrip.load(id)

  if (!_volumeDrip) {
    _volumeDrip = new VolumeDrip(id)
    _volumeDrip.sourceAddress = sourceAddress
    _volumeDrip.measureToken = measureTokenAddress
    _volumeDrip.dripToken = dripTokenAddress
    _volumeDrip.referral = isReferral
    _volumeDrip.deactivated = false
    _volumeDrip.save()
  }

  return _volumeDrip as VolumeDrip
}

export function loadOrCreateVolumeDripPeriod(
  volumeDripId: string,
  periodIndex: BigInt
): VolumeDripPeriod {
  const id = volumeDripPeriodId(
    volumeDripId,
    periodIndex.toString()
  )
  let _period = VolumeDripPeriod.load(id)

  if (!_period) {
    _period = new VolumeDripPeriod(id)
    _period.volumeDrip = volumeDripId
    _period.periodIndex = periodIndex
    _period.isDripping = false
    _period.save()
  }

  return _period as VolumeDripPeriod
}

import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import {
  Comptroller,
  BalanceDrip,
} from '../../generated/schema'

import {
  Comptroller as ComptrollerContract,
} from '../../generated/Comptroller/Comptroller'

import {
  balanceDripId,
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

    _comptroller.reserveRateMantissa = boundComptroller.reserveRateMantissa()
    // const callResult = boundComptroller.try_reserveRateMantissa()
    // if (callResult.reverted) {
    //   log.info("Comptroller->reserveRateMantissa reverted", [])
    // } else {
    //   _comptroller.reserveRateMantissa = callResult.value
    // }

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
  const id = balanceDripId(
    comptrollerAddress.toHex(),
    sourceAddress.toHex(),
    measureTokenAddress.toHex(),
    dripTokenAddress.toHex()
  )
  let _balanceDrip = BalanceDrip.load(id)

  if (!_balanceDrip) {
    _balanceDrip = new BalanceDrip(id)
    _balanceDrip.prizePool = sourceAddress.toHex()
    _balanceDrip.measureToken = measureTokenAddress
    _balanceDrip.dripToken = dripTokenAddress
    _balanceDrip.deactivated = false
    _balanceDrip.save()
  }

  return _balanceDrip as BalanceDrip
}


// export function loadOrCreateVolumeDrip(
//   comptrollerAddress: Address,
//   sourceAddress: Address,
//   volumeDripIndex: BigInt
// ): VolumeDrip {
//   const id = volumeDripId(comptrollerAddress.toHex(), sourceAddress.toHex(), volumeDripIndex.toHex())
//   let _volumeDrip = VolumeDrip.load(id)

//   if (!_volumeDrip) {
//     _volumeDrip = new VolumeDrip(id)
//     _volumeDrip.prizePool = sourceAddress.toHex()
//     _volumeDrip.index = volumeDripIndex
//     _volumeDrip.save()
//   }

//   return _volumeDrip as VolumeDrip
// }

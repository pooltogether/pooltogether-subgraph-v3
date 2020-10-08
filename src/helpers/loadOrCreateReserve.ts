import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  Reserve,
} from '../../generated/schema'

import {
  Reserve as ReserveContract,
} from '../../generated/Reserve/Reserve'

import { ZERO_ADDRESS } from './common'

export function loadOrCreateReserve(
  reserveAddress: Address
): Reserve {
  const id = reserveAddress.toHex()
  let _reserve = Reserve.load(id)

  if (!_reserve) {
    _reserve = new Reserve(id)
    const boundReserve = ReserveContract.bind(reserveAddress)

    _reserve.owner = boundReserve.owner()
    _reserve.recipient = boundReserve.reserveRecipient(Address.fromString(ZERO_ADDRESS))
    _reserve.rateMantissa = boundReserve.reserveRateMantissa(Address.fromString(ZERO_ADDRESS))
    _reserve.save()
  }

  return _reserve as Reserve
}

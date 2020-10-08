
import {
  ReserveRecipientSet,
  ReserveRateMantissaSet,
  OwnershipTransferred,

} from '../generated/Reserve/Reserve'

import { loadOrCreateReserve } from './helpers/loadOrCreateReserve'


export function handleReserveRecipientSet(event: ReserveRecipientSet): void {
  const _reserve = loadOrCreateReserve(event.address)
  _reserve.recipient = event.params.recipient
  _reserve.save()
}

export function handleReserveRateMantissaSet(event: ReserveRateMantissaSet): void {
  const _reserve = loadOrCreateReserve(event.address)
  _reserve.rateMantissa = event.params.rateMantissa
  _reserve.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const _reserve = loadOrCreateReserve(event.address)
  _reserve.owner = event.params.newOwner
  _reserve.save()
}

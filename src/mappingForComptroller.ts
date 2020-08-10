import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  PrizeStrategy as PrizeStrategyContract,
} from '../generated/templates/PrizeStrategy/PrizeStrategy'

import {
  Comptroller as ComptrollerContract,
  ReserveRateMantissaSet,
  BalanceDripAdded,
  BalanceDripRemoved,
  BalanceDripRateSet,
  BalanceDripClaimed,
  VolumeDripAdded,
  VolumeDripRemoved,
  VolumeDripAmountSet,
  VolumeDripClaimed,
  ReferralVolumeDripAdded,
  ReferralVolumeDripRemoved,
  ReferralVolumeDripAmountSet,
  ReferralVolumeDripClaimed,
} from '../generated/templates/Comptroller/Comptroller'

import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'
import {
  loadOrCreateComptroller,
  loadOrCreateBalanceDrip,
  loadOrCreatePlayerBalanceDrip,
} from './helpers/loadOrCreateComptroller'


export function handleReserveRateMantissaSet(event: ReserveRateMantissaSet): void {
  const _comptroller = loadOrCreateComptroller(event.address)
  _comptroller.reserveRateMantissa = event.params.reserveRateMantissa
  _comptroller.save()
}

export function handleBalanceDripAdded(event: BalanceDripAdded): void {
  const _comptrollerAddress = event.address
  const _prizeStrategyAddress = event.params.prizeStrategy
  const _measureTokenAddress = event.params.measure
  const _dripTokenAddress = event.params.dripToken

  const _balanceDrip = loadOrCreateBalanceDrip(
    _comptrollerAddress,
    _prizeStrategyAddress,
    _measureTokenAddress,
    _dripTokenAddress
  )

  _balanceDrip.dripRatePerSecond = event.params.dripRatePerSecond
  _balanceDrip.save()
}

export function handleBalanceDripRemoved(event: BalanceDripRemoved): void {
  const _comptrollerAddress = event.address
  const _prizeStrategyAddress = event.params.prizeStrategy
  const _measureTokenAddress = event.params.measure
  const _dripTokenAddress = event.params.dripToken

  const _balanceDrip = loadOrCreateBalanceDrip(
    _comptrollerAddress,
    _prizeStrategyAddress,
    _measureTokenAddress,
    _dripTokenAddress
  )

  _balanceDrip.removed = true
  _balanceDrip.save()
}

export function handleBalanceDripRateSet(event: BalanceDripRateSet): void {
  const _comptrollerAddress = event.address
  const _prizeStrategyAddress = event.params.prizeStrategy
  const _measureTokenAddress = event.params.measure
  const _dripTokenAddress = event.params.dripToken

  const _balanceDrip = loadOrCreateBalanceDrip(
    _comptrollerAddress,
    _prizeStrategyAddress,
    _measureTokenAddress,
    _dripTokenAddress
  )

  _balanceDrip.dripRatePerSecond = event.params.dripRatePerSecond
  _balanceDrip.save()
}

export function handleBalanceDripClaimed(event: BalanceDripClaimed): void {
  const _comptrollerAddress = event.address
  const _prizeStrategyAddress = event.params.prizeStrategy
  const _measureTokenAddress = event.params.measure
  const _dripTokenAddress = event.params.dripToken
  const _playerAddress = event.params.user

  const _boundComptroller = ComptrollerContract.bind(_comptrollerAddress)
  const response = _boundComptroller.getBalanceDrip(
    _prizeStrategyAddress,
    _measureTokenAddress,
    _dripTokenAddress
  )
  const exchangeRateMantissa = response.value1 // response[1]

  const _boundPrizeStrategy = PrizeStrategyContract.bind(event.address)
  const _prizePoolAddress = _boundPrizeStrategy.prizePool()

  const _player = loadOrCreatePlayer(
    _prizePoolAddress,
    _playerAddress
  )

  const _balanceDrip = loadOrCreateBalanceDrip(
    _comptrollerAddress,
    _prizeStrategyAddress,
    _measureTokenAddress,
    _dripTokenAddress
  )

  const _playerBalanceDrip = loadOrCreatePlayerBalanceDrip(
    _comptrollerAddress,
    _prizeStrategyAddress,
    _playerAddress,
    _balanceDrip.id
  )

  _playerBalanceDrip.dripBalance = _playerBalanceDrip.dripBalance.plus(event.params.amount)
  _playerBalanceDrip.lastExchangeRateMantissa = exchangeRateMantissa
  _playerBalanceDrip.save()
}

export function handleVolumeDripAdded(event: VolumeDripAdded): void {
  log.warning('TODO: implement handleVolumeDripAdded!', [])
}

export function handleVolumeDripRemoved(event: VolumeDripRemoved): void {
  log.warning('TODO: implement handleVolumeDripRemoved!', [])
}

export function handleVolumeDripAmountSet(event: VolumeDripAmountSet): void {
  log.warning('TODO: implement handleVolumeDripAmountSet!', [])
}

export function handleVolumeDripClaimed(event: VolumeDripClaimed): void {
  log.warning('TODO: implement handleVolumeDripClaimed!', [])
}

export function handleReferralVolumeDripAdded(event: ReferralVolumeDripAdded): void {
  log.warning('TODO: implement handleReferralVolumeDripAdded!', [])
}

export function handleReferralVolumeDripRemoved(event: ReferralVolumeDripRemoved): void {
  log.warning('TODO: implement handleReferralVolumeDripRemoved!', [])
}

export function handleReferralVolumeDripAmountSet(event: ReferralVolumeDripAmountSet): void {
  log.warning('TODO: implement handleReferralVolumeDripAmountSet!', [])
}

export function handleReferralVolumeDripClaimed(event: ReferralVolumeDripClaimed): void {
  log.warning('TODO: implement handleReferralVolumeDripClaimed!', [])
}

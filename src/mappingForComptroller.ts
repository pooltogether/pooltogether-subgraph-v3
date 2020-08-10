import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  PrizeStrategy as PrizeStrategyContract,
} from '../generated/templates/PrizeStrategy/PrizeStrategy'

import {
  Comptroller as ComptrollerContract,

  ReserveRateMantissaSet,
  DripTokenDripped,
  DripTokenClaimed,

  BalanceDripActivated,
  BalanceDripDeactivated,
  BalanceDripRateSet,
  BalanceDripDripped,

  VolumeDripActivated,
  VolumeDripDeactivated,
  VolumeDripSet,
  VolumeDripPeriodStarted,
  VolumeDripPeriodEnded,
  VolumeDripDeposited,
  VolumeDripDripped,
} from '../generated/Comptroller/Comptroller'

import {
  loadOrCreatePlayer,
  loadOrCreateDripTokenPlayer,
  loadOrCreateBalanceDripPlayer,
} from './helpers/loadOrCreatePlayer'

import {
  loadOrCreateComptroller,
  loadOrCreateBalanceDrip,
} from './helpers/loadOrCreateComptroller'




export function handleReserveRateMantissaSet(event: ReserveRateMantissaSet): void {
  const _comptroller = loadOrCreateComptroller(event.address)
  _comptroller.reserveRateMantissa = event.params.reserveRateMantissa
  _comptroller.save()
}




///////////////////////////////////////
// Drip Token Balances
///////////////////////////////////////


export function handleDripTokenDripped(event: DripTokenDripped): void {
  const _comptrollerAddress = event.address
  const _dripTokenAddress = event.params.dripToken
  const _playerAddress = event.params.user
  const _amount = event.params.amount

  const _player = loadOrCreateDripTokenPlayer(
    _comptrollerAddress,
    _dripTokenAddress,
    _playerAddress,
  )

  _player.balance = _player.balance.plus(_amount)
  _player.save()
}

export function handleDripTokenClaimed(event: DripTokenClaimed): void {
  const _comptrollerAddress = event.address
  const _dripTokenAddress = event.params.dripToken
  const _playerAddress = event.params.user
  const _amount = event.params.amount

  const _player = loadOrCreateDripTokenPlayer(
    _comptrollerAddress,
    _dripTokenAddress,
    _playerAddress,
  )

  _player.balance = _player.balance.minus(_amount)
  _player.save()
}


///////////////////////////////////////
// Balance Drips
///////////////////////////////////////


export function handleBalanceDripActivated(event: BalanceDripActivated): void {
  const _comptrollerAddress = event.address
  const _sourceAddress = event.params.source
  const _measureTokenAddress = event.params.measure
  const _dripTokenAddress = event.params.dripToken

  const _balanceDrip = loadOrCreateBalanceDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress
  )

  const boundComptroller = ComptrollerContract.bind(_comptrollerAddress)
  const callResult = boundComptroller.getBalanceDrip(_sourceAddress, _measureTokenAddress, _dripTokenAddress);

  _balanceDrip.exchangeRateMantissa = callResult.value1
  _balanceDrip.timestamp = callResult.value2
  _balanceDrip.dripRatePerSecond = event.params.dripRatePerSecond
  _balanceDrip.save()
}

export function handleBalanceDripDeactivated(event: BalanceDripDeactivated): void {
  const _comptrollerAddress = event.address
  const _sourceAddress = event.params.source
  const _measureTokenAddress = event.params.measure
  const _dripTokenAddress = event.params.dripToken

  const _balanceDrip = loadOrCreateBalanceDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress
  )

  _balanceDrip.deactivated = true
  _balanceDrip.save()
}

export function handleBalanceDripRateSet(event: BalanceDripRateSet): void {
  const _comptrollerAddress = event.address
  const _sourceAddress = event.params.source
  const _measureTokenAddress = event.params.measure
  const _dripTokenAddress = event.params.dripToken

  const _balanceDrip = loadOrCreateBalanceDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress
  )

  const boundComptroller = ComptrollerContract.bind(_comptrollerAddress)
  const callResult = boundComptroller.getBalanceDrip(_sourceAddress, _measureTokenAddress, _dripTokenAddress);

  _balanceDrip.exchangeRateMantissa = callResult.value1
  _balanceDrip.timestamp = callResult.value2
  _balanceDrip.dripRatePerSecond = event.params.dripRatePerSecond
  _balanceDrip.save()
}

export function handleBalanceDripDripped(event: BalanceDripDripped): void {
  const _comptrollerAddress = event.address
  const _sourceAddress = event.params.source
  const _measureTokenAddress = event.params.measure
  const _dripTokenAddress = event.params.dripToken
  const _playerAddress = event.params.user
  const _userLastExchangeRate = event.params.userExchangeRate

  const _balanceDrip = loadOrCreateBalanceDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress
  )

  const _playerBalanceDrip = loadOrCreateBalanceDripPlayer(
    _comptrollerAddress,
    _playerAddress,
    _balanceDrip.id
  )

  _playerBalanceDrip.lastExchangeRateMantissa = _userLastExchangeRate
  _playerBalanceDrip.save()
}

///////////////////////////////////////
// Volume Drips
///////////////////////////////////////


export function handleVolumeDripActivated(event: VolumeDripActivated): void {
  log.warning('TODO: implement handleVolumeDripActivated!', [])
}

export function handleVolumeDripDeactivated(event: VolumeDripDeactivated): void {
  log.warning('TODO: implement handleVolumeDripDeactivated!', [])
}

export function handleVolumeDripSet(event: VolumeDripSet): void {
  log.warning('TODO: implement handleVolumeDripSet!', [])
}

export function handleVolumeDripPeriodStarted(event: VolumeDripPeriodStarted): void {
  log.warning('TODO: implement handleVolumeDripSet!', [])
}

export function handleVolumeDripPeriodEnded(event: VolumeDripPeriodEnded): void {
  log.warning('TODO: implement handleVolumeDripSet!', [])
}

export function handleVolumeDripDeposited(event: VolumeDripDeposited): void {
  log.warning('TODO: implement handleVolumeDripSet!', [])
}

export function handleVolumeDripDripped(event: VolumeDripDripped): void {
  log.warning('TODO: implement handleVolumeDripDripped!', [])
}

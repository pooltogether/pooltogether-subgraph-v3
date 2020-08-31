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
  loadOrCreateVolumeDripPlayer,
} from './helpers/loadOrCreatePlayer'

import {
  loadOrCreateComptroller,
  loadOrCreateBalanceDrip,
  loadOrCreateVolumeDrip,
  loadOrCreateVolumeDripPeriod,
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

  _balanceDrip.dripRatePerSecond = event.params.dripRatePerSecond // OR callResult.value0
  _balanceDrip.exchangeRateMantissa = callResult.value1
  _balanceDrip.timestamp = callResult.value2
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

  _balanceDrip.dripRatePerSecond = event.params.dripRatePerSecond // OR callResult.value0
  _balanceDrip.exchangeRateMantissa = callResult.value1
  _balanceDrip.timestamp = callResult.value2
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
  const _comptrollerAddress = event.address
  const _sourceAddress = event.params.source
  const _measureTokenAddress = event.params.measure
  const _dripTokenAddress = event.params.dripToken
  const _isReferral = event.params.isReferral

  const _volumeDrip = loadOrCreateVolumeDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress,
    _isReferral
  )

  const boundComptroller = ComptrollerContract.bind(_comptrollerAddress)
  const callResult = boundComptroller.getVolumeDrip(_sourceAddress, _measureTokenAddress, _dripTokenAddress, _isReferral);

  _volumeDrip.periodSeconds = callResult.value0
  _volumeDrip.dripAmount = callResult.value1
  _volumeDrip.periodCount = callResult.value2
  _volumeDrip.referral = _isReferral
  _volumeDrip.save()
}

export function handleVolumeDripDeactivated(event: VolumeDripDeactivated): void {
  const _comptrollerAddress = event.address
  const _sourceAddress = event.params.source
  const _measureTokenAddress = event.params.measure
  const _dripTokenAddress = event.params.dripToken
  const _isReferral = event.params.isReferral

  const _volumeDrip = loadOrCreateVolumeDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress,
    _isReferral
  )

  _volumeDrip.deactivated = true
  _volumeDrip.save()
}

export function handleVolumeDripSet(event: VolumeDripSet): void {
  const _comptrollerAddress = event.address
  const _sourceAddress = event.params.source
  const _measureTokenAddress = event.params.measure
  const _dripTokenAddress = event.params.dripToken
  const _isReferral = event.params.isReferral
  const _periodSeconds = event.params.periodSeconds
  const _dripAmount = event.params.dripAmount

  const _volumeDrip = loadOrCreateVolumeDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress,
    _isReferral
  )

  _volumeDrip.periodSeconds = _periodSeconds
  _volumeDrip.dripAmount = _dripAmount
  _volumeDrip.referral = _isReferral
  _volumeDrip.save()
}

export function handleVolumeDripPeriodStarted(event: VolumeDripPeriodStarted): void {
  const _comptrollerAddress = event.address
  const _sourceAddress = event.params.source
  const _measureTokenAddress = event.params.measure
  const _dripTokenAddress = event.params.dripToken
  const _isReferral = event.params.isReferral
  const _periodIndex = event.params.period
  const _dripAmount = event.params.dripAmount
  const _endTime = event.params.endTime

  const _volumeDrip = loadOrCreateVolumeDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress,
    _isReferral
  )
  const _volumeDripPeriod = loadOrCreateVolumeDripPeriod(
    _volumeDrip.id,
    _periodIndex,
  )

  const boundComptroller = ComptrollerContract.bind(_comptrollerAddress)
  const callResult = boundComptroller.getVolumeDripPeriod(_sourceAddress, _measureTokenAddress, _dripTokenAddress, _isReferral, _periodIndex.toI32());

  _volumeDripPeriod.totalSupply = callResult.value0
  _volumeDripPeriod.dripAmount = _dripAmount  // OR callResult.value1
  _volumeDripPeriod.endTime = _endTime        // OR callResult.value2
  _volumeDripPeriod.isDripping = true
  _volumeDripPeriod.save()
}

export function handleVolumeDripPeriodEnded(event: VolumeDripPeriodEnded): void {
  const _comptrollerAddress = event.address
  const _sourceAddress = event.params.source
  const _measureTokenAddress = event.params.measure
  const _dripTokenAddress = event.params.dripToken
  const _isReferral = event.params.isReferral
  const _periodIndex = event.params.period
  const _totalSupply = event.params.totalSupply

  const _volumeDrip = loadOrCreateVolumeDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress,
    _isReferral
  )
  const _volumeDripPeriod = loadOrCreateVolumeDripPeriod(
    _volumeDrip.id,
    _periodIndex,
  )

  _volumeDripPeriod.totalSupply = _totalSupply
  _volumeDripPeriod.isDripping = false
  _volumeDripPeriod.save()
}

export function handleVolumeDripDeposited(event: VolumeDripDeposited): void {


  // NOTE: Event never fired
  log.warning('TODO: implement handleVolumeDripDeposited!', [])


}

export function handleVolumeDripDripped(event: VolumeDripDripped): void {
  const _comptrollerAddress = event.address
  const _sourceAddress = event.params.source
  const _measureTokenAddress = event.params.measure
  const _dripTokenAddress = event.params.dripToken
  const _isReferral = event.params.isReferral
  const _user = event.params.user
  const _amount = event.params.amount

  const _volumeDrip = loadOrCreateVolumeDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress,
    _isReferral
  )
  const _volumeDripPlayer = loadOrCreateVolumeDripPlayer(
    _volumeDrip.id,
    _user,
  )

  _volumeDripPlayer.periodIndex = BigInt.fromI32(0) // HOW TO GET THIS?

  _volumeDripPlayer.balance = _volumeDripPlayer.balance.plus(_amount)
  _volumeDripPlayer.save()
}

import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { generateCompositeId, ONE, ZERO, ZERO_ADDRESS } from "./helpers/common"

import {
  Comptroller,
  BalanceDrip,
  VolumeDrip,
  DripTokenPlayer,
  BalanceDripPlayer,
  VolumeDripPlayer,
  VolumeDripPeriod,
  ControlledTokenBalance,
} from '../generated/schema'

import {
  Comptroller as ComptrollerContract,

  OwnershipTransferred,

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
  VolumeDripDripped,
  BeforeTokenMintCall,
} from '../generated/Comptroller/Comptroller'

import {
  loadOrCreateAccount,
  // loadOrCreateDripTokenPlayer,
  loadOrCreateBalanceDripPlayer,
  loadOrCreateVolumeDripPlayer,
} from './helpers/loadOrCreateAccount'

import {
  loadOrCreateComptroller,
  loadOrCreateBalanceDrip,
  loadOrCreateVolumeDrip,
  loadOrCreateVolumeDripPeriod,
} from './helpers/loadOrCreateComptroller'
import { loadOrCreateControlledToken } from './helpers/loadOrCreateControlledToken'



export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const _comptroller:Comptroller = loadOrCreateComptroller(event.address)
  _comptroller.owner = event.params.newOwner
  _comptroller.save()
}



///////////////////////////////////////
// Balance Drips
///////////////////////////////////////


export function handleBalanceDripActivated(event: BalanceDripActivated): void {
  const _comptrollerAddress:Address = event.address
  const _sourceAddress:Address = event.params.source
  const _measureTokenAddress:Address = event.params.measure
  const _dripTokenAddress:Address = event.params.dripToken

  const _balanceDrip:BalanceDrip = loadOrCreateBalanceDrip(
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
  const _comptrollerAddress:Address = event.address
  const _sourceAddress = event.params.source
  const _measureTokenAddress:Address = event.params.measure
  const _dripTokenAddress:Address = event.params.dripToken

  const _balanceDrip:BalanceDrip = loadOrCreateBalanceDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress
  )

  _balanceDrip.deactivated = true
  _balanceDrip.save()
}

export function handleBalanceDripRateSet(event: BalanceDripRateSet): void {
  const _comptrollerAddress:Address = event.address
  const _sourceAddress:Address = event.params.source
  const _measureTokenAddress:Address = event.params.measure
  const _dripTokenAddress:Address = event.params.dripToken

  const _balanceDrip:BalanceDrip = loadOrCreateBalanceDrip(
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
  const _comptrollerAddress:Address = event.address
  const _sourceAddress:Address = event.params.source
  const _measureTokenAddress:Address = event.params.measure
  const _dripTokenAddress:Address = event.params.dripToken
  const _playerAddress:Address = event.params.user
  const _amount:BigInt = event.params.amount

  const _balanceDrip:BalanceDrip = loadOrCreateBalanceDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress
  )

  const _playerBalanceDrip:BalanceDripPlayer = loadOrCreateBalanceDripPlayer(
    _balanceDrip.id,
    _playerAddress,
  )

  // _playerBalanceDrip.lastExchangeRateMantissa = _userLastExchangeRate
  _playerBalanceDrip.save()
}

///////////////////////////////////////
// Volume Drips
///////////////////////////////////////


export function handleVolumeDripActivated(event: VolumeDripActivated): void {
  const _comptrollerAddress:Address = event.address
  const _sourceAddress:Address = event.params.source
  const _measureTokenAddress:Address = event.params.measure
  const _dripTokenAddress:Address = event.params.dripToken
  const _isReferral:boolean = event.params.isReferral

  const _volumeDrip:VolumeDrip = loadOrCreateVolumeDrip(
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
  const _comptrollerAddress:Address = event.address
  const _sourceAddress:Address = event.params.source
  const _measureTokenAddress:Address = event.params.measure
  const _dripTokenAddress:Address = event.params.dripToken
  const _isReferral:boolean = event.params.isReferral

  const _volumeDrip:VolumeDrip = loadOrCreateVolumeDrip(
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
  const _comptrollerAddress:Address = event.address
  const _sourceAddress:Address = event.params.source
  const _measureTokenAddress:Address = event.params.measure
  const _dripTokenAddress:Address = event.params.dripToken
  const _isReferral:boolean = event.params.isReferral
  const _periodSeconds:BigInt = event.params.periodSeconds
  const _dripAmount:BigInt = event.params.dripAmount

  const _volumeDrip:VolumeDrip = loadOrCreateVolumeDrip(
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
  const _comptrollerAddress:Address = event.address
  const _sourceAddress:Address = event.params.source
  const _measureTokenAddress:Address = event.params.measure
  const _dripTokenAddress:Address = event.params.dripToken
  const _isReferral:boolean = event.params.isReferral
  const _periodIndex:BigInt = event.params.period
  const _dripAmount:BigInt = event.params.dripAmount
  const _endTime:BigInt = event.params.endTime

  const _volumeDrip:VolumeDrip = loadOrCreateVolumeDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress,
    _isReferral
  )
  const _volumeDripPeriod:VolumeDripPeriod = loadOrCreateVolumeDripPeriod(
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
  const _comptrollerAddress:Address = event.address
  const _sourceAddress:Address = event.params.source
  const _measureTokenAddress:Address = event.params.measure
  const _dripTokenAddress:Address = event.params.dripToken
  const _isReferral:boolean = event.params.isReferral
  const _periodIndex:BigInt = event.params.period
  const _totalSupply:BigInt = event.params.totalSupply

  const _volumeDrip:VolumeDrip = loadOrCreateVolumeDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress,
    _isReferral
  )
  const _volumeDripPeriod:VolumeDripPeriod = loadOrCreateVolumeDripPeriod(
    _volumeDrip.id,
    _periodIndex,
  )

  _volumeDripPeriod.totalSupply = _totalSupply
  _volumeDripPeriod.isDripping = false
  _volumeDripPeriod.save()
}

export function handleVolumeDripDripped(event: VolumeDripDripped): void {
  const _comptrollerAddress:Address = event.address
  const _sourceAddress:Address = event.params.source
  const _measureTokenAddress:Address = event.params.measure
  const _dripTokenAddress:Address = event.params.dripToken
  const _isReferral:boolean = event.params.isReferral
  const _user:Address = event.params.user
  const _amount:BigInt = event.params.amount

  const _volumeDrip:VolumeDrip = loadOrCreateVolumeDrip(
    _comptrollerAddress,
    _sourceAddress,
    _measureTokenAddress,
    _dripTokenAddress,
    _isReferral
  )
  const _volumeDripPlayer:VolumeDripPlayer = loadOrCreateVolumeDripPlayer(
    _volumeDrip.id,
    _user,
  )

  _volumeDripPlayer.periodIndex = BigInt.fromI32(0) // HOW TO GET THIS?

  

  _volumeDripPlayer.balance = _volumeDripPlayer.balance.plus(_amount)
  _volumeDripPlayer.save()
}

export function handleBeforeTokenMint(call: BeforeTokenMintCall): void {
  if (call.inputs.referrer === null || call.inputs.referrer.toHexString() === ZERO_ADDRESS) {
    return
  }

  const id = generateCompositeId(call.inputs.to.toHexString(), call.inputs.measure.toHexString())

  let tokenBalance = ControlledTokenBalance.load(id)

  if (!tokenBalance) {
    tokenBalance = new ControlledTokenBalance(id)
    tokenBalance.account = loadOrCreateAccount(call.inputs.to).id
    tokenBalance.controlledToken = loadOrCreateControlledToken(call.inputs.measure).id
  }

  tokenBalance.referrer = call.inputs.referrer  
  tokenBalance.save()
}
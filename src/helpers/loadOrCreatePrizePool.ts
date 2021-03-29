import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  PrizePool,
} from '../../generated/schema'

import {
  PrizePool as PrizePoolContract,
} from '../../generated/templates/PrizePool/PrizePool'

import {
  ControlledToken as ControlledTokenContract,
} from '../../generated/templates/ControlledToken/ControlledToken'

import { ZERO, ONE, ZERO_ADDRESS } from './common'


export function loadOrCreatePrizePool(
  prizePool: Address
): PrizePool {

  log.warning("loadOrCreatePrizePool called for {} ",[prizePool.toHexString()])

  let _prizePool = PrizePool.load(prizePool.toHex())

  if (!_prizePool) {
    log.warning("loadOrCreatePrizePool creating a prizePool {} ", [prizePool.toHexString()])
    _prizePool = new PrizePool(prizePool.toHex())

    const boundPrizePool = PrizePoolContract.bind(prizePool)

    const tryTokenCall = boundPrizePool.try_token()
    let poolTokenAddress : Address
    if(tryTokenCall.reverted){
      log.warning("try_token reverted on {} ", [prizePool.toHexString()])
    }
    else{
      poolTokenAddress = tryTokenCall.value
    }

    if(poolTokenAddress){
      const boundToken = ControlledTokenContract.bind(poolTokenAddress)
      
      const tryOwnerCall = boundPrizePool.try_owner()
      if(tryOwnerCall.reverted){
        log.warning("try_owner for {} reverted ", [prizePool.toHexString()])
        _prizePool.owner = null
      }
      else{
        _prizePool.owner = tryOwnerCall.value
      }

      _prizePool.underlyingCollateralToken = poolTokenAddress
  
      const tryNameCall = boundToken.try_name()
      if(tryNameCall.reverted){
        log.warning("try_name for {} reverted ", [prizePool.toHexString()])
        _prizePool.underlyingCollateralName = null
      }
      else{
        _prizePool.underlyingCollateralName = tryNameCall.value
      }
  
      const trySymbolCall = boundToken.try_symbol()
      if(trySymbolCall.reverted){
        log.warning("try_symbol for {} reverted ", [prizePool.toHexString()])
        _prizePool.underlyingCollateralSymbol = null
      }
      else{
        _prizePool.underlyingCollateralSymbol = trySymbolCall.value
      }
  
      const tryDecimalsCall = boundToken.try_decimals()
      if(tryDecimalsCall.reverted){
        log.warning("try_symbol for {} reverted ", [prizePool.toHexString()])
        _prizePool.underlyingCollateralDecimals = null
      }
      else{
        _prizePool.underlyingCollateralDecimals = BigInt.fromI32(tryDecimalsCall.value)
      }
  
      const try_timelockTotalSupplyCall = boundPrizePool.try_timelockTotalSupply()
      if(try_timelockTotalSupplyCall.reverted){
        log.warning("try_timelockSupply for {} reverted ", [prizePool.toHexString()])
        _prizePool.timelockTotalSupply = null
      }
      else{
        _prizePool.timelockTotalSupply = try_timelockTotalSupplyCall.value
      }
    }
    else{
      log.error("PrizePool {} does not have a token ", [prizePool.toHex()])
    }

    _prizePool.reserveRegistry = Address.fromString(ZERO_ADDRESS)
    _prizePool.reserveFeeControlledToken = Address.fromString(ZERO_ADDRESS)
    _prizePool.deactivated = false


    _prizePool.maxExitFeeMantissa = ZERO
    _prizePool.maxTimelockDuration = ZERO
    _prizePool.liquidityCap = ZERO

    _prizePool.currentState = 'Opened'
    _prizePool.currentPrizeId = ONE
    
    _prizePool.cumulativePrizeGross = ZERO
    _prizePool.cumulativePrizeReserveFee = ZERO
    _prizePool.cumulativePrizeNet = ZERO

    _prizePool.save()
  }
  return _prizePool as PrizePool
}

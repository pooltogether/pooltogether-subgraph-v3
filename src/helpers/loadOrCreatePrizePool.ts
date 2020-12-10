import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  PrizePool,
} from '../../generated/schema'

import {
  PrizePool as PrizePoolTemplate,
} from '../../generated/templates'

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
  let _prizePool = PrizePool.load(prizePool.toHex())

  if (!_prizePool) {
    _prizePool = new PrizePool(prizePool.toHex())
    const boundPrizePool = PrizePoolContract.bind(prizePool)



    const poolTokenAddress = boundPrizePool.token()
    const boundToken = ControlledTokenContract.bind(poolTokenAddress)

    _prizePool.owner = boundPrizePool.owner()
    _prizePool.reserveRegistry = Address.fromString(ZERO_ADDRESS)
    _prizePool.deactivated = false

    _prizePool.reserveFeeControlledToken = Address.fromString(ZERO_ADDRESS)

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
      _prizePool.underlyingCollateralDecimals = tryDecimalsCall.value
    }

    _prizePool.maxExitFeeMantissa = ZERO
    _prizePool.maxTimelockDuration = ZERO

    const try_timelockTotalSupplyCall = boundPrizePool.try_timelockTotalSupply()
    if(try_timelockTotalSupplyCall.reverted){
      log.warning("try_timelockSupply for {} reverted ", [prizePool.toHexString()])
      _prizePool.timelockTotalSupply = null
    }
    else{
      _prizePool.timelockTotalSupply = try_timelockTotalSupplyCall.value
    }
    
    _prizePool.liquidityCap = ZERO

    _prizePool.currentState = 'Opened'
    _prizePool.currentPrizeId = ONE
    _prizePool.prizesCount = ZERO

    _prizePool.cumulativePrizeGross = ZERO
    _prizePool.cumulativePrizeReserveFee = ZERO
    _prizePool.cumulativePrizeNet = ZERO

    _prizePool.save()

    // Start listening for events from the dynamically generated contract
    PrizePoolTemplate.create(prizePool)
  }

  return _prizePool as PrizePool
}

import { Address, BigInt } from '@graphprotocol/graph-ts'

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

// AG: no changes required looks like
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
    _prizePool.trustedForwarder = Address.fromString(ZERO_ADDRESS)
    _prizePool.deactivated = false

    _prizePool.reserveFeeControlledToken = Address.fromString(ZERO_ADDRESS)

    _prizePool.underlyingCollateralToken = poolTokenAddress
    _prizePool.underlyingCollateralDecimals = BigInt.fromI32(boundToken.decimals())
    _prizePool.underlyingCollateralName = boundToken.name()
    _prizePool.underlyingCollateralSymbol = boundToken.symbol()

    _prizePool.maxExitFeeMantissa = ZERO
    _prizePool.maxTimelockDuration = ZERO
    _prizePool.timelockTotalSupply = boundPrizePool.timelockTotalSupply()
    _prizePool.liquidityCap = ZERO

    _prizePool.totalSupply = ZERO
    _prizePool.totalSponsorship = ZERO

    _prizePool.currentState = 'Opened'
    _prizePool.currentPrizeId = ONE
    _prizePool.prizesCount = ZERO

    _prizePool.playerCount = ZERO

    _prizePool.cumulativePrizeGross = ZERO
    _prizePool.cumulativePrizeReserveFee = ZERO
    _prizePool.cumulativePrizeNet = ZERO

    _prizePool.save()

    // Start listening for events from the dynamically generated contract
    PrizePoolTemplate.create(prizePool)
  }

  return _prizePool as PrizePool
}

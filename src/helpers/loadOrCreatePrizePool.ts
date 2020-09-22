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
  CompoundPrizePool as CompoundPrizePoolContract,
} from '../../generated/templates/PrizePool/CompoundPrizePool'

import {
  ControlledToken as ControlledTokenContract,
} from '../../generated/templates/ControlledToken/ControlledToken'

import { loadOrCreatePrizeStrategy } from './loadOrCreatePrizeStrategy'

import { ZERO, ONE } from './common'


export function loadOrCreatePrizePool(
  prizePoolType: string,
  creator: Address,
  prizePool: Address,
  prizeStrategy: Address,
  comptroller: Address,
  trustedForwarder: Address,
): PrizePool {
  let _prizePool = PrizePool.load(prizePool.toHex())

  if (!_prizePool) {
    _prizePool = new PrizePool(prizePool.toHex())
    const _prizeStrategy = loadOrCreatePrizeStrategy(prizePool, prizeStrategy)

    const boundPrizePool = PrizePoolContract.bind(prizePool)
    const boundToken = ControlledTokenContract.bind(boundPrizePool.token())

    _prizePool.owner = creator
    _prizePool.comptroller = comptroller.toHex()
    _prizePool.prizeStrategy = _prizeStrategy.id
    _prizePool.trustedForwarder = trustedForwarder
    _prizePool.deactivated = false

    _prizePool.reserveFeeControlledToken = boundPrizePool.reserveFeeControlledToken()

    if (prizePoolType === 'Compound') {
      const boundCompoundPrizePool = CompoundPrizePoolContract.bind(prizePool)
      _prizePool.yieldToken = boundCompoundPrizePool.cToken()
    }

    _prizePool.underlyingCollateralToken = boundPrizePool.token()
    _prizePool.underlyingCollateralDecimals = BigInt.fromI32(boundToken.decimals())
    _prizePool.underlyingCollateralName = boundToken.name()
    _prizePool.underlyingCollateralSymbol = boundToken.symbol()

    _prizePool.maxExitFeeMantissa = boundPrizePool.maxExitFeeMantissa()
    _prizePool.maxTimelockDuration = boundPrizePool.maxTimelockDuration()
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

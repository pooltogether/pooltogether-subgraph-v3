import { Address, BigInt } from '@graphprotocol/graph-ts'

import {
  PrizePool,
  CompoundPrizePool,
} from '../../generated/schema'

import {
  PrizePool as PrizePoolTemplate,
} from '../../generated/templates'

import {
  CompoundPrizePool as CompoundPrizePoolTemplate,
} from '../../generated/templates'

import {
  CompoundPrizePool as CompoundPrizePoolContract,
} from '../../generated/templates/CompoundPrizePool/CompoundPrizePool'

import {
  ControlledToken as ControlledTokenContract,
} from '../../generated/templates/ControlledToken/ControlledToken'

import { loadOrCreatePrizeStrategy } from './loadOrCreatePrizeStrategy'

import { ZERO, ONE } from './common'


export function loadOrCreateCompoundPrizePool(
  creator: Address,
  prizePool: Address,
  prizeStrategy: Address,
  comptroller: Address,
  trustedForwarder: Address,
): PrizePool {
  let _prizePool = PrizePool.load(prizePool.toHex())

  if (!_prizePool) {
    _prizePool = new PrizePool(prizePool.toHex())
    const _compoundPrizePool = new CompoundPrizePool(prizePool.toHex())
    const _prizeStrategy = loadOrCreatePrizeStrategy(prizePool, prizeStrategy)

    const boundCompoundPrizePool = CompoundPrizePoolContract.bind(prizePool)
    const poolTokenAddress = boundCompoundPrizePool.token()
    const boundToken = ControlledTokenContract.bind(poolTokenAddress)

    _prizePool.owner = creator
    _prizePool.comptroller = comptroller.toHex()
    _prizePool.prizeStrategy = _prizeStrategy.id
    _prizePool.trustedForwarder = trustedForwarder
    _prizePool.deactivated = false

    _prizePool.prizePoolType = 'Compound'
    _prizePool.compoundPrizePool = _compoundPrizePool.id

    _prizePool.reserveFeeControlledToken = boundCompoundPrizePool.reserveFeeControlledToken()

    _prizePool.underlyingCollateralToken = poolTokenAddress
    _prizePool.underlyingCollateralDecimals = BigInt.fromI32(boundToken.decimals())
    _prizePool.underlyingCollateralName = boundToken.name()
    _prizePool.underlyingCollateralSymbol = boundToken.symbol()

    _prizePool.maxExitFeeMantissa = boundCompoundPrizePool.maxExitFeeMantissa()
    _prizePool.maxTimelockDuration = boundCompoundPrizePool.maxTimelockDuration()
    _prizePool.timelockTotalSupply = boundCompoundPrizePool.timelockTotalSupply()
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
    _compoundPrizePool.save()

    // Start listening for events from the dynamically generated contract
    PrizePoolTemplate.create(prizePool)
    CompoundPrizePoolTemplate.create(prizePool)
  }

  return _prizePool as PrizePool
}

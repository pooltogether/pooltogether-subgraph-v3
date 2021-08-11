import { Address, log, store } from '@graphprotocol/graph-ts'
import {
  PrizeStrategy,
  PrizePool
} from '../generated/schema'

import {
  ControlledTokenAdded,
  ReserveFeeCaptured,
  LiquidityCapSet,
  Awarded,
  AwardedExternalERC20,
  AwardedExternalERC721,
  CreditPlanSet,
  PrizeStrategySet,
  OwnershipTransferred,
  Initialized
} from '../generated/templates/PrizePool/PrizePool'

import {externalAwardId} from "./helpers/idTemplates"

import { loadOrCreatePrize } from './helpers/loadOrCreatePrize'

import { loadOrCreatePrizePool } from './helpers/loadOrCreatePrizePool'
import { loadOrCreatePrizeStrategy } from './helpers/loadOrCreatePrizeStrategy'
import { loadOrCreatePrizePoolCreditRate } from './helpers/loadOrCreatePrizePoolCreditRate'
import { loadOrCreateAwardedExternalErc20Token, loadOrCreateAwardedExternalErc721Nft } from './helpers/loadOrCreateAwardedExternalErc'


import { ONE, ZERO } from './helpers/common'
import { Deposited } from '../generated/templates/CompoundPrizePool/CompoundPrizePool'
import { loadOrCreatePrizePoolAccount } from './helpers/loadOrCreatePrizePoolAccount'
import { loadOrCreateAwardedControlledToken } from './helpers/loadOrCreateAwardedControlledToken'
import { loadOrCreateControlledToken } from './helpers/loadOrCreateControlledToken'

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const _prizePool = loadOrCreatePrizePool(event.address)
  _prizePool.owner = event.params.newOwner
  _prizePool.save()
}

export function handleControlledTokenAdded(event: ControlledTokenAdded): void {
  const controlledToken = loadOrCreateControlledToken(event.params.token)
}

export function handleLiquidityCapSet(event: LiquidityCapSet): void {
  const _prizePool = loadOrCreatePrizePool(event.address)
  _prizePool.liquidityCap = event.params.liquidityCap
  _prizePool.save()
}

export function handleCreditPlanSet(event: CreditPlanSet): void {
  const _creditRate = loadOrCreatePrizePoolCreditRate(event.address, event.params.token)
  _creditRate.creditLimitMantissa = event.params.creditLimitMantissa
  _creditRate.creditRateMantissa = event.params.creditRateMantissa
  _creditRate.save()
}

export function handlePrizeStrategySet(event: PrizeStrategySet): void {

  log.warning("debugps handlePrizeStrategySet for {} as {} ",[event.address.toHexString(), event.params.prizeStrategy.toHexString()])

  const _prizePoolAddress = event.address
  const _prizeStrategyAddress = event.params.prizeStrategy

  const _prizePool = loadOrCreatePrizePool(_prizePoolAddress)
  _prizePool.prizeStrategy = loadOrCreatePrizeStrategy(_prizeStrategyAddress).id
  _prizePool.save()
}

export function handleReserveFeeCaptured(event: ReserveFeeCaptured): void {
  const _prizePool = loadOrCreatePrizePool(event.address)
  _prizePool.cumulativePrizeReserveFee = _prizePool.cumulativePrizeReserveFee.plus(event.params.amount)
  _prizePool.save()

}

// this is called BEFORE PrizePoolAwarded - MW strat and SRW 
export function handleAwarded(event: Awarded): void {
  const _prizePool = loadOrCreatePrizePool(event.address)
  // Record prize history
  const _prize = loadOrCreatePrize(
    event.address.toHex(),
    _prizePool.currentPrizeId.toString()
  )

  const winner : Address = event.params.winner
    
  let length = _prize.numberOfSubWinners
  _prize.numberOfSubWinners = _prize.numberOfSubWinners.plus(ONE)
  _prize.save()
  
  log.warning("awardedControlled length is {} ",[length.toString()])

  const winnerIndex = length.toString()
  const awardedControlledToken = loadOrCreateAwardedControlledToken(event.address.toHexString(), winner, _prizePool.currentPrizeId.toString(), winnerIndex)
  
  

  awardedControlledToken.amount = event.params.amount
  awardedControlledToken.prize = _prize.id
  awardedControlledToken.token = event.params.token.toHexString()
  awardedControlledToken.save()

  // Update Pool (Reserve Fee updated in handleReserveFeeCaptured)
  _prizePool.cumulativePrizeNet = _prizePool.cumulativePrizeNet.plus(event.params.amount)
  _prizePool.cumulativePrizeGross = _prizePool.cumulativePrizeNet.plus(_prizePool.cumulativePrizeReserveFee)
  _prizePool.save()

}

// called after all the Tickets have been awarded
export function handleAwardedExternalERC20(event: AwardedExternalERC20): void {
  const _prizePool = loadOrCreatePrizePool(event.address)

  const _prize = loadOrCreatePrize(
    event.address.toHex(),
    _prizePool.currentPrizeId.toString()
  )


  const awardedErc20Token = loadOrCreateAwardedExternalErc20Token(
    _prize,
    event.params.token,
    event.params.winner,
    _prize.numberOfExternalAwardedErc20Winners.toHexString()
  )

  _prize.numberOfExternalAwardedErc20Winners = _prize.numberOfExternalAwardedErc20Winners.plus(ONE)
  _prize.save()

  awardedErc20Token.winner = event.params.winner
  awardedErc20Token.balanceAwarded = awardedErc20Token.balanceAwarded.plus(event.params.amount)
  
  awardedErc20Token.save()
}

// This is emitted when external rewards (nfts, etc) are awarded
export function handleAwardedExternalERC721(event: AwardedExternalERC721): void {
  const _prizePool = loadOrCreatePrizePool(event.address)

  const _prize = loadOrCreatePrize(
    event.address.toHex(),
    _prizePool.currentPrizeId.toString()
  )
  log.warning("handleAwardedExternalERC721 prizePool id {} prize {} ",[_prizePool.id, _prize.id])

  const _prizeStrategyId = _prizePool.prizeStrategy
  const _prizeStrategy = PrizeStrategy.load(_prizeStrategyId)

  const awardedExternalErc721Nft = loadOrCreateAwardedExternalErc721Nft(
    _prize,
    _prizeStrategy as PrizeStrategy,
    event.params.token
  )
  awardedExternalErc721Nft.winner = event.params.winner
  awardedExternalErc721Nft.save()
  
  // delete ID: `${prizeStrategy.address}-${token.address}`
  const deleteId = externalAwardId(_prizeStrategy.id, event.params.token.toHex())
  store.remove("MultipleWinnersExternalErc721Award", deleteId) // is this a noop if doesnt exist??
}

export function handleDeposited(event: Deposited):void {
  loadOrCreatePrizePoolAccount(event.address, event.params.to.toHex())
}

// inserted from 3_3_2
export function handleInitialized(event: Initialized): void {

  log.warning("PrizePool Initialized called for {} ",[event.address.toHexString()])

  const _prizePool = loadOrCreatePrizePool(event.address)
  _prizePool.reserveRegistry = event.params.reserveRegistry
  _prizePool.maxExitFeeMantissa = event.params.maxExitFeeMantissa
  _prizePool.save()
}

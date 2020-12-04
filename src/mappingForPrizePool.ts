import { Address, Bytes, log, store } from '@graphprotocol/graph-ts'
import {
  SingleRandomWinner,
  PrizeStrategy,
  PrizePool,
  PrizePoolAccount,
  Account,
  ControlledTokenBalance,
  ControlledToken,
} from '../generated/schema'

import {
  Initialized,
  ControlledTokenAdded,
  ReserveFeeCaptured,
  LiquidityCapSet,
  Deposited,
  TimelockDeposited,
  Awarded,
  AwardedExternalERC20,
  AwardedExternalERC721,
  InstantWithdrawal,
  TimelockedWithdrawal,
  TimelockedWithdrawalSwept,
  CreditPlanSet,
  PrizeStrategySet,
  OwnershipTransferred,
} from '../generated/templates/PrizePool/PrizePool'


import { loadOrCreatePrize } from './helpers/loadOrCreatePrize'
import { loadOrCreateAccount } from './helpers/loadOrCreateAccount'

import { loadOrCreatePrizePool } from './helpers/loadOrCreatePrizePool'
import { loadOrCreatePrizeStrategy } from './helpers/loadOrCreatePrizeStrategy'
import { loadOrCreatePrizePoolCreditRate } from './helpers/loadOrCreatePrizePoolCreditRate'
import { loadOrCreateAwardedExternalErc20Token, loadOrCreateAwardedExternalErc721Nft } from './helpers/loadOrCreateAwardedExternalErc'
import { loadOrCreateExternalErc721Award } from './helpers/loadOrCreateExternalAward'

import { ONE, ZERO, ZERO_ADDRESS } from './helpers/common'


export function handleInitialized(event: Initialized): void {
  const _prizePool = loadOrCreatePrizePool(event.address)
  _prizePool.reserveRegistry = event.params.reserveRegistry
  _prizePool.trustedForwarder = event.params.trustedForwarder
  _prizePool.maxExitFeeMantissa = event.params.maxExitFeeMantissa
  _prizePool.maxTimelockDuration = event.params.maxTimelockDuration
  _prizePool.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const _prizePool = loadOrCreatePrizePool(event.address)
  _prizePool.owner = event.params.newOwner
  _prizePool.save()
}

export function handleControlledTokenAdded(event: ControlledTokenAdded): void {
  log.warning('implement handleControlledTokenAdded!', [])
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
  const _prizePoolAddress = event.address
  const _prizeStrategyAddress = event.params.prizeStrategy

  const _prizeStrategy = loadOrCreatePrizeStrategy(_prizeStrategyAddress)
  _prizeStrategy.singleRandomWinner = _prizeStrategyAddress.toHex()
  _prizeStrategy.save()

  const _prizePool = loadOrCreatePrizePool(_prizePoolAddress)
  _prizePool.prizeStrategy = _prizeStrategy.id
  _prizePool.save()
}

export function handleReserveFeeCaptured(event: ReserveFeeCaptured): void {
  const _prizePool = loadOrCreatePrizePool(event.address)
  _prizePool.cumulativePrizeReserveFee = _prizePool.cumulativePrizeReserveFee.plus(event.params.amount)
  _prizePool.save()

}

export function handleAwarded(event: Awarded): void {
  const _prizePool = loadOrCreatePrizePool(event.address)

  // Record prize history
  const _prize = loadOrCreatePrize(
    event.address.toHex(),
    _prizePool.currentPrizeId.toString()
  )
  _prize.amount = event.params.amount

  const winner = event.params.winner
  const existingWinners = _prize.winners
  _prize.winners = new Array(existingWinners.push(winner))

  // increment accumulative winnings
  const prizePoolAccount = PrizePoolAccount.load(generateCompositeId(_prizePool.id, winner.toHex()))
  prizePoolAccount.cumulativeWinnings = prizePoolAccount.cumulativeWinnings.plus(event.params.amount)
  prizePoolAccount.save()

  // do we need to increment ControlledToken token balance here?



  //old code -- WHY ZERO ADDRESS check???
  
  // if (winner != ZERO_ADDRESS) {
  //   const winnerBytes = Bytes.fromHexString(winner) as Bytes
  //   _prize.winners = [winnerBytes]

  //   const _account = loadOrCreateAccount(event.address, Address.fromString(winner))
  //   _account.cumulativeWinnings = _account.cumulativeWinnings.plus(event.params.amount)
  //   incrementAccountBalance(_account, event.params.amount)
  //   _account.save()
  // }

  _prize.save()

  // Update Pool (Reserve Fee updated in handleReserveFeeCaptured)
  _prizePool.cumulativePrizeNet = _prizePool.cumulativePrizeNet.plus(event.params.amount)
  _prizePool.cumulativePrizeGross = _prizePool.cumulativePrizeNet.plus(_prizePool.cumulativePrizeReserveFee)
  _prizePool.save()
}

export function handleAwardedExternalERC20(event: AwardedExternalERC20): void {
  const _prizePool = loadOrCreatePrizePool(event.address)

  const _prize = loadOrCreatePrize(
    event.address.toHex(),
    _prizePool.currentPrizeId.toString()
  )

  const awardedErc20Token = loadOrCreateAwardedExternalErc20Token(
    _prize,
    event.params.token
  )

  awardedErc20Token.balanceAwarded = event.params.amount

  awardedErc20Token.save()
}

// This is emitted when external rewards (nfts, etc) are awarded
export function handleAwardedExternalERC721(event: AwardedExternalERC721): void {
  const _prizePool = loadOrCreatePrizePool(event.address)

  const _prize = loadOrCreatePrize(
    event.address.toHex(),
    _prizePool.currentPrizeId.toString()
  )

  const _prizeStrategyId = _prizePool.prizeStrategy
  const _prizeStrategy = PrizeStrategy.load(_prizeStrategyId)

  const awardedExternalErc721Nft = loadOrCreateAwardedExternalErc721Nft(
    _prize,
    _prizeStrategy as PrizeStrategy,
    event.params.token
  )
  awardedExternalErc721Nft.save()


  const externalErc721 = loadOrCreateExternalErc721Award(
    _prizeStrategy.id,
    event.params.token
  )
  store.remove('ExternalErc721Award', externalErc721.id)
}

export function handleDeposited(event: Deposited): void { // MAYBE DELETE?? 
  // const _prizePoolAddress = event.address
  // const _prizePool = loadOrCreatePrizePool(_prizePoolAddress)

  // const _prizeStrategyId = _prizePool.prizeStrategy
  // const _prizeStrategy = PrizeStrategy.load(_prizeStrategyId)

  // const _singleRandomWinner = SingleRandomWinner.load(_prizeStrategy.singleRandomWinner) //??


  // // what is happening here?
  // const tokenAddress = event.params.token
  // const ticketAddress = Address.fromString(_singleRandomWinner.ticket)
  // const ticketIsToken = (tokenAddress.equals(ticketAddress))

  // if (ticketIsToken) { // if token deposited is the same as this PrizePools SingleRandomWinner tickets? considered a "player"?
  //   const _player = loadOrCreateAccount(// loadOrCreate makes a composite ID from both these fields
  //     _prizePoolAddress,
  //     event.params.to
  //   )

  //   const playersCachedBalance = _player.balance // and here ? balance ??
  //   incrementPlayerCount(_prizePool as PrizePool, playersCachedBalance) // incrementing a player count with a monetary balance?

  //   updateTotals(_prizePool as PrizePool)

  //   incrementAccountBalance(_player, event.params.amount)

  //   _player.save()
  // } else { // considered a sponsor because the token deposited is not a ticket address?
  //   const _sponsor = loadOrCreateAccount(
  //     _prizePoolAddress,
  //     event.params.to
  //   )

  //   incrementAccountBalance(_sponsor, event.params.amount)

  //   updateTotals(_prizePool as PrizePool)

  //   _sponsor.save()
  // }

  // _prizePool.save()
}

export function handleInstantWithdrawal(event: InstantWithdrawal): void {
  const _prizePoolAddress = event.address
  const prizePool = loadOrCreatePrizePool(_prizePoolAddress)

  const _prizeStrategyId = prizePool.prizeStrategy // this could be null set here handlePrizeStrategySet
  const _prizeStrategy = PrizeStrategy.load(_prizeStrategyId)

  const _singleRandomWinner = SingleRandomWinner.load(_prizeStrategy.singleRandomWinner)

  const ticket = _singleRandomWinner.ticket
  const token = event.params.token

  const ticketAddress = Address.fromString(ticket)
  const ticketIsToken = token.equals(ticketAddress)

  //load Account this should always exist
  const account = Account.load(event.params.from.toHex()) // id of account just address
  const controlledToken = ControlledToken.load(event.params.token.toHex())
  
  // decrease PrizePoolAccount
  let prizePoolAccount = PrizePoolAccount.load(generateCompositeId(_prizeStrategy.id, account.id))
  prizePoolAccount.unlockTimestamp = event.block.timestamp // is this correct??
 

  // decrease ControlledTokenBalance
  let controlledTokenBalance = ControlledTokenBalance.load(generateCompositeId(event.params.from.toHex(),token.toHex()))
  const existingBalance = controlledTokenBalance.balance
  const newBalance = existingBalance.minus(event.params.redeemed)
  controlledTokenBalance.balance = newBalance
  
  // decrement controlledToken totalSupply and PrizePool total supply
  prizePool.totalSupply = prizePool.totalSupply.minus(event.params.redeemed)
  controlledToken.totalSupply = controlledToken.totalSupply.minus(event.params.redeemed)// or should be minus event.params.amount?
    
  // decrease numberOfHolders (if applicable)
  if(ticketIsToken && newBalance.equals(ZERO)){
    prizePool.playerCount = prizePool.playerCount.minus(ONE)
  }

  // save touched entitites
  prizePoolAccount.save()
  controlledToken.save()
  account.save()
  prizePool.save()
}

export function handleTimelockedWithdrawal(event: TimelockedWithdrawal): void {
  const _prizePoolAddress = event.address
  const prizePool = loadOrCreatePrizePool(_prizePoolAddress)

  const account = loadOrCreateAccount(
    _prizePoolAddress,
    event.params.from
  )

  // decrement PrizePool total supply
  prizePool.totalSupply = prizePool.totalSupply.minus(event.params.amount)

  // load PrizePoolAccount and update unlockedTimestamp and timelockedBalance
  let prizePoolAccount = PrizePoolAccount.load(generateCompositeId(prizePool.id, account.id))
  prizePoolAccount.unlockTimestamp = event.params.unlockTimestamp
  prizePoolAccount.timelockedBalance = event.params.amount
  
  // decrease ControlledTokenBalance
  let controlledTokenBalance = ControlledTokenBalance.load(generateCompositeId(event.params.from.toHex(),event.params.token.toHex()))
  const existingBalance = controlledTokenBalance.balance
  const newBalance = existingBalance.minus(event.params.amount)
  controlledTokenBalance.balance = newBalance

  // need to do all the following to find if ticket==token
  const _prizeStrategyId = prizePool.prizeStrategy 
  const _prizeStrategy = PrizeStrategy.load(_prizeStrategyId)

  const _singleRandomWinner = SingleRandomWinner.load(_prizeStrategy.singleRandomWinner)

  const ticket = _singleRandomWinner.ticket
  const token = event.params.token

  const ticketAddress = Address.fromString(ticket)
  const ticketIsToken = token.equals(ticketAddress)

  // if players balance will now be zero then decrement player count
  if(ticketIsToken && newBalance.equals(ZERO)){
    prizePool.playerCount = prizePool.playerCount.minus(ONE)
  }

  // save touched entities
  controlledTokenBalance.save()
  prizePoolAccount.save()
  account.save()
  prizePool.save()
  
}

export function handleTimelockedWithdrawalSwept(event: TimelockedWithdrawalSwept): void {
  const _prizePoolAddress = event.address
  const account = loadOrCreateAccount(
    _prizePoolAddress,
    event.params.from
  )
  
  let prizePoolAccount = PrizePoolAccount.load(generateCompositeId(event.address.toHex(), event.params.from.toHex()))
  prizePoolAccount.timelockedBalance = event.params.amount // or balance??
  prizePoolAccount.unlockTimestamp = null /// -- code was doing this, logically correct?
  
  //reduce prize pool totatlSupply here or no??

  prizePoolAccount.save()
  account.save()
}

// This happens when a player deposits some of their timelocked funds
// back into the pool
export function handleTimelockDeposited(event: TimelockDeposited): void {
  const _prizePoolAddress = event.address
  const _prizePool = loadOrCreatePrizePool(_prizePoolAddress)

  const _player = loadOrCreateAccount(
    _prizePoolAddress,
    event.params.to
  )

  


  // old code 
  // const playersCachedBalance = _player.balance
  // incrementPlayerCount(_prizePool as PrizePool, playersCachedBalance)

  // updateTotals(_prizePool as PrizePool)

  // decrementAccountTimelockedBalance(_player, event.params.amount)
  // incrementAccountBalance(_player, event.params.amount)

  // if (_player.timelockedBalance.equals(ZERO)) {
  //   _player.unlockTimestamp = null
  // }

  _player.save()
  _prizePool.save()
}


function generateCompositeId(key1: string, key2: string) : string{
  return key1+"-"+key2
}
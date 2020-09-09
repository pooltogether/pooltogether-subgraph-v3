import { Address, Bytes, BigInt, log } from "@graphprotocol/graph-ts"
import {
  PrizePool,
  SingleRandomWinnerPrizeStrategy,
  Prize,
} from '../../generated/schema'
import {
  ERC20 as ERC20Contract,
} from '../../generated/CompoundPrizePoolBuilder/ERC20'
import {
  ControlledToken as ControlledTokenContract,
} from '../../generated/CompoundPrizePoolBuilder/ControlledToken'
import {
  PrizePool as PrizePoolContract,
} from '../../generated/templates/PrizePool/PrizePool'
import {
  PrizeStrategy as PrizeStrategyContract,
} from '../../generated/templates/PrizeStrategy/PrizeStrategy'
import {
  PrizeStrategy as PrizeStrategyTemplate,
  PrizePool as PrizePoolTemplate
} from '../../generated/templates'


import { createSponsorship } from './createSponsorship'
import { createTicket } from './createTicket'

const ZERO = BigInt.fromI32(0)
const ONE = BigInt.fromI32(1)

export function loadOrCreateSingleRandomWinnerPrizeStrategy(
  blockNumber: BigInt,
  builder: Address,
  creator: Address,
  prizePool: Address,
  prizeStrategy: Address,
): SingleRandomWinnerPrizeStrategy {
  let _prizeStrategy = SingleRandomWinnerPrizeStrategy.load(prizeStrategy.toHex())

  if (!_prizeStrategy) {
    _prizeStrategy = new SingleRandomWinnerPrizeStrategy(prizeStrategy.toHex())
    const boundPrizeStrategy = PrizeStrategyContract.bind(prizeStrategy)

    _prizeStrategy.compoundPrizePoolBuilder = builder.toHex()
    _prizeStrategy.owner = creator
    _prizeStrategy.prizePool = prizePool.toHex()
    _prizeStrategy.ticket = boundPrizeStrategy.ticket()
    _prizeStrategy.rng = boundPrizeStrategy.rng()
    _prizeStrategy.sponsorship = boundPrizeStrategy.sponsorship()

    _prizeStrategy.prizePeriodSeconds = boundPrizeStrategy.prizePeriodSeconds()
    _prizeStrategy.prizePeriodStartedAt = boundPrizeStrategy.prizePeriodStartedAt()
    _prizeStrategy.prizePeriodEndAt = _prizeStrategy.prizePeriodStartedAt.plus(_prizeStrategy.prizePeriodSeconds)

    _prizeStrategy.save()




    const _pool = new PrizePool(prizePool.toHex())
    const boundPrizePool = PrizePoolContract.bind(prizePool)
    const boundToken = ControlledTokenContract.bind(boundPrizePool.token())
    const boundTicket = ERC20Contract.bind(Address.fromString(_prizeStrategy.ticket.toHex()))

    _pool.prizeStrategy = prizeStrategy
    _pool.comptroller = boundPrizePool.comptroller().toHex()
    _pool.owner = creator
    _pool.deactivated = false

    _pool.reserveFeeControlledToken = boundPrizePool.reserveFeeControlledToken()

    _pool.underlyingCollateralToken = boundPrizePool.token()
    _pool.underlyingCollateralDecimals = BigInt.fromI32(boundToken.decimals())
    _pool.underlyingCollateralName = boundToken.name()
    _pool.underlyingCollateralSymbol = boundToken.symbol()

    _pool.maxExitFeeMantissa = boundPrizePool.maxExitFeeMantissa()
    _pool.maxTimelockDuration = boundPrizePool.maxTimelockDuration()
    _pool.timelockTotalSupply = boundPrizePool.timelockTotalSupply()
    _pool.liquidityCap = ZERO

    _pool.currentState = 'Opened'
    _pool.currentPrizeId = ONE
    _pool.prizesCount = ZERO

    _pool.playerCount = ZERO
    _pool.totalSupply = boundTicket.totalSupply()

    _pool.cumulativePrizeGross = ZERO
    _pool.cumulativePrizeReserveFee = ZERO
    _pool.cumulativePrizeNet = ZERO

    _pool.save()



    createSponsorship(
      prizeStrategy,
      boundPrizeStrategy.sponsorship()
    )

    createTicket(
      prizeStrategy,
      boundPrizeStrategy.ticket()
    )



    // Start listening for events from the dynamically generated contract
    PrizeStrategyTemplate.create(prizeStrategy)

    // Start listening for events from the dynamically generated contract
    PrizePoolTemplate.create(prizePool)
  }

  return _prizeStrategy as SingleRandomWinnerPrizeStrategy
}

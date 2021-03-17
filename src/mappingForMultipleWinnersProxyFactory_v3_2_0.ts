import { BigInt } from '@graphprotocol/graph-ts'

import { ProxyCreated } from "../generated/MultipleWinnersProxyFactory_v3_1_0/MultipleWinnersProxyFactory_v3_1_0"

import { loadOrCreatePrizeStrategy } from './helpers/loadOrCreatePrizeStrategy'

import {
  MultipleWinnersPrizeStrategy
} from '../generated/schema'

import { MultipleWinners_v3_1_0, MultipleWinners_v3_2_0, MultipleWinners_v3_3_2 } from "../generated/templates"

export function handleMultipleWinnersCreated(event: ProxyCreated) : void{
  const address = event.params.proxy.toHexString()

  const multipleWinners = new MultipleWinnersPrizeStrategy(address)

  // set fields to blank/generic for now - Initialized event called straight after
  multipleWinners.prizePeriodSeconds = new BigInt(0)
  multipleWinners.prizePeriodStartedAt = new BigInt(0)
  multipleWinners.prizePeriodEndAt = new BigInt(0)

  multipleWinners.save()

  let prizeStrategy = loadOrCreatePrizeStrategy(event.params.proxy)
  prizeStrategy.multipleWinners = multipleWinners.id
  prizeStrategy.save()


  // creating multiple templates
  MultipleWinners_v3_2_0.create(event.params.proxy)





}

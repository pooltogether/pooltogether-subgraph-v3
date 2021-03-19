import { BigInt, log } from '@graphprotocol/graph-ts'

import { ProxyCreated } from "../generated/MultipleWinnersProxyFactory/MultipleWinnersProxyFactory"

import { loadOrCreatePrizeStrategy } from './helpers/loadOrCreatePrizeStrategy'

import {
  MultipleWinnersPrizeStrategy
} from '../generated/schema'

import { MultipleWinners } from "../generated/templates"

export function handleMultipleWinnersCreated(event: ProxyCreated) : void{
  const address = event.params.proxy.toHexString()


  log.info("creating a MWPrizeStrategy for {}", [address])

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
  MultipleWinners.create(event.params.proxy)




}

import {ProxyCreated} from "../generated/MultipleWinnersProxyFactory/MultipleWinnersProxyFactory"

import { log } from '@graphprotocol/graph-ts'

import {MultipleWinners} from "../generated/templates"
import { PeriodicPrizeStrategy } from "../generated/templates"

export function handleMultipleWinnersCreated(event: ProxyCreated) : void{
    // listen for CreateProxy events , handler creates template for MultipleWinners AND PeriodPrizeStrategy 
    log.warning("handleMultipleWinnersCreated at {}", [event.params.proxy.toHex()])
    MultipleWinners.create(event.params.proxy)
    PeriodicPrizeStrategy.create(event.params.proxy)
}
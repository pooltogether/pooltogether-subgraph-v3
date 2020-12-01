import {ProxyCreated} from "../generated/MultipleWinnersProxyFactory/MultipleWinnersProxyFactory"

import {MultipleWinners} from "../generated/templates"
import { PeriodicPrizeStrategy } from "../generated/templates"

export function handleMultipleWinnersCreated(event: ProxyCreated) : void{
    // listen for CreateProxy events , handler creates template for MultipleWinners AND PeriodPrizeStrategy 
    MultipleWinners.create(event.params.proxy)
    PeriodicPrizeStrategy.create(event.params.proxy)
}
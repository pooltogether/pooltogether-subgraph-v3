import {NumberOfWinnersSet} from "../generated/templates/MultipleWinners/MultipleWinners"

import { log } from '@graphprotocol/graph-ts'
import { PeriodicPrizeStrategy } from "../generated/schema"


export function handleNumberOfWinnersSet(event: NumberOfWinnersSet) : void {
    log.warning("number of winners set to {} ! ", [event.params.numberOfWinners.toString()])

    let periodicPrizeStrategy = PeriodicPrizeStrategy.load(event.address.toHex())
    if(periodicPrizeStrategy == null){
        log.error("this entity should already exist!",[])
    }
    else{
        periodicPrizeStrategy.numberOfWinners = event.params.numberOfWinners
        periodicPrizeStrategy.save()
    } 
}
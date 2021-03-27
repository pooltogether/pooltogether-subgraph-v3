
import {
    ProxyCreated,
  } from '../generated/CompoundPrizePoolProxyFactory/CompoundPrizePoolProxyFactory'
  
  import {
    PrizePool as PrizePoolTemplate,
    CompoundPrizePool as CompoundPrizePoolTemplate,
  } from '../generated/templates'
  
  export function handleProxyCreated(event: ProxyCreated): void {
    // Start listening for events from the dynamically generated contract
    // PrizePoolV3Template.create(event.params.proxy)
    PrizePoolTemplate.create(event.params.proxy)
    CompoundPrizePoolTemplate.create(event.params.proxy)
  }
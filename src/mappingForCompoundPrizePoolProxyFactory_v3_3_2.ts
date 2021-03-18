import {
  ProxyCreated,
} from '../generated/CompoundPrizePoolProxyFactory_v3_3_2/CompoundPrizePoolProxyFactory_v3_3_2'

import {
  PrizePool_v3_3_2,
  CompoundPrizePool as CompoundPrizePoolTemplate, // cannot label v3_3_2 because is coming from node_modules
} from '../generated/templates'

export function handleProxyCreated(event: ProxyCreated): void {
  // Start listening for events from the dynamically generated contract
  PrizePool_v3_3_2.create(event.params.proxy)
  
  
  CompoundPrizePoolTemplate.create(event.params.proxy)

}
import {
  ProxyCreated,
} from '../generated/CompoundPrizePoolProxyFactory_v3_0_1/CompoundPrizePoolProxyFactory_v3_0_1'

import {
  PrizePool_v3_1_0 as PrizePoolTemplate,
  CompoundPrizePool
} from '../generated/templates'

export function handleProxyCreated(event: ProxyCreated): void {
  // Start listening for events from the dynamically generated contract
  PrizePoolTemplate.create(event.params.proxy)
  CompoundPrizePool.create(event.params.proxy)

}
import {
  ProxyCreated,
} from '../generated/CompoundPrizePoolProxyFactory_v3_1_0/CompoundPrizePoolProxyFactory_v3_1_0'

import {
  PrizePool_v3 as PrizePoolV3Template,
  PrizePool_v3_1_0 as PrizePoolTemplate,
  PrizePool_v3_3_2,
  CompoundPrizePool as CompoundPrizePoolTemplate,
} from '../generated/templates'

export function handleProxyCreated(event: ProxyCreated): void {
  // Start listening for events from the dynamically generated contract
  PrizePoolV3Template.create(event.params.proxy)
  PrizePoolTemplate.create(event.params.proxy)
  PrizePool_v3_3_2.create(event.params.proxy)
  CompoundPrizePoolTemplate.create(event.params.proxy)

}
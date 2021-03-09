import {
  ProxyCreated,
} from './generated/YieldSourcePrizePoolProxyFactory_v3_3_2/YieldSourcePrizePoolProxyFactory_v3_3_2.ts"

import {
  PrizePool_v3 as PrizePoolV3Template,
  PrizePool_v3_0_1 as PrizePoolTemplate,
  YieldSourcePrizePool as YieldSourcePrizePoolTemplate,
} from '../generated/templates'

export function handleProxyCreated(event: ProxyCreated): void {
  // Start listening for events from the dynamically generated contract
  PrizePoolV3Template.create(event.params.proxy)
  PrizePoolTemplate.create(event.params.proxy)
  YieldSourcePrizePoolTemplate.create(event.params.proxy)
}

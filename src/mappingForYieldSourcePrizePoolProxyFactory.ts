import {
  ProxyCreated,
} from "../generated/YieldSourcePrizePoolProxyFactory/YieldSourcePrizePoolProxyFactory"

import {

  PrizePool as PrizePoolTemplate,
  YieldSourcePrizePool as YieldSourcePrizePoolTemplate,
} from '../generated/templates'

export function handleProxyCreated(event: ProxyCreated): void {
  // Start listening for events from the dynamically generated contract
  PrizePoolTemplate.create(event.params.proxy)
  YieldSourcePrizePoolTemplate.create(event.params.proxy)
}

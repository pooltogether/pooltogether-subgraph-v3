import {
    ProxyCreated,
  } from '../generated/StakePrizePoolProxyFactory_v3_1_0/StakePrizePoolProxyFactory'
  
  import {
    PrizePool_v3 as PrizePoolV3Template,
    PrizePool_v3_1_0 as PrizePoolTemplate,
    StakePrizePool as StakePrizeTemplate,
  } from '../generated/templates'
  
  export function handleStakePrizePoolCreated(event: ProxyCreated): void {
    // Start listening for events from the dynamically generated contract
    PrizePoolV3Template.create(event.params.proxy)
    PrizePoolTemplate.create(event.params.proxy)
    StakePrizeTemplate.create(event.params.proxy)
  }
  
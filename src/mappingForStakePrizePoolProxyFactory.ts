import {
    ProxyCreated,
  } from '../generated/StakePrizePoolProxyFactory/StakePrizePoolProxyFactory'
  
  import {
    PrizePool as PrizePoolTemplate,
    StakePrizePool as StakePrizeTemplate,
  } from '../generated/templates'
  
  export function handleStakePrizePoolCreated(event: ProxyCreated): void {
    // Start listening for events from the dynamically generated contract
    PrizePoolTemplate.create(event.params.proxy)
    StakePrizeTemplate.create(event.params.proxy)
  }
  
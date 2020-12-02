import { log } from '@graphprotocol/graph-ts'

import {
  ProxyCreated,
} from '../generated/CompoundPrizePoolProxyFactory/CompoundPrizePoolProxyFactory'

import {
  CompoundPrizePool as CompoundPrizePoolTemplate,
} from '../generated/templates'

export function handleProxyCreated(event: ProxyCreated): void {
  log.warning('event.params.proxy {}', [event.params.proxy.toHexString()])

  // Start listening for events from the dynamically generated contract
  CompoundPrizePoolTemplate.create(event.params.proxy)
}

import { log } from '@graphprotocol/graph-ts'

import {
  ProxyCreated,
} from '../generated/CompoundPrizePoolProxyFactory/CompoundPrizePoolProxyFactory'

import { loadOrCreateCompoundPrizePool } from './helpers/loadOrCreateCompoundPrizePool'

export function handleProxyCreated(event: ProxyCreated): void {
  log.warning('event.params.proxy {}', [event.params.proxy.toHexString()])

  loadOrCreateCompoundPrizePool(
    event.params.proxy
  )
}

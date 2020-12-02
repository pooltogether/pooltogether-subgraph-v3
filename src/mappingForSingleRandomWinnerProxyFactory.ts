import {
  ProxyCreated,
} from '../generated/SingleRandomWinnerProxyFactory/SingleRandomWinnerProxyFactory'

import { loadOrCreateSingleRandomWinner } from './helpers/loadOrCreateSingleRandomWinner'

export function handleProxyCreated(event: ProxyCreated): void {
  loadOrCreateSingleRandomWinner(
    event.params.proxy
  )
}

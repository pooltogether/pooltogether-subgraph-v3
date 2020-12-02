import {
  ProxyCreated,
} from '../generated/SingleRandomWinnerProxyFactory/SingleRandomWinnerProxyFactory'

import {
  SingleRandomWinner as SingleRandomWinnerTemplate,
} from '../generated/templates'

export function handleProxyCreated(event: ProxyCreated): void {
  SingleRandomWinnerTemplate.create(event.params.proxy)
}

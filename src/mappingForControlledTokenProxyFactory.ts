import {
    ProxyCreated,
  } from '../generated/ControlledTokenProxyFactory/ControlledTokenProxyFactory'
  
import {
    ControlledToken as ControlledTokenTemplate,
} from '../generated/templates'
 
export function handleProxyCreated(event: ProxyCreated): void {
    ControlledTokenTemplate.create(event.params.proxy)
}
  
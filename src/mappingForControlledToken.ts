import { Address, log, store } from '@graphprotocol/graph-ts'
import {ONE, ZERO, ZERO_ADDRESS} from "./helpers/common"
import {
  Transfer,
} from '../generated/templates/ControlledToken/ControlledToken'

import {
  ControlledToken, ControlledTokenBalance,
} from '../generated/schema'
import { loadOrCreateAccount } from './helpers/loadOrCreateAccount'



export function handleTransfer(event: Transfer): void {

  if(event.params.to.equals(event.params.from)){
    log.warning("transfer to self at txId {} from {} ",[event.transaction.hash.toString(), event.params.from.toHexString()])
    return
  }
  
  // const burning = event.params.to.equals(Address.fromString(ZERO_ADDRESS))
  // const minting = event.params.from.equals(Address.fromString(ZERO_ADDRESS))

  

  
  // if(!burning){ // if minting (deposit) or transferring
    let toBalance = ControlledTokenBalance.load(generateCompositeId (event.params.to, event.address)) // controlledtokenbalance id =  (address, controlledToken)
    
    if(toBalance == null) {// create case 
      toBalance = new ControlledTokenBalance(generateCompositeId (event.params.to, event.address))
      const controlledToken = ControlledToken.load(event.address.toHex())


      if(event.address.equals(Address.fromString("0x4fb19557fbd8d73ac884efbe291626fd5641c778"))){
        log.warning("debug77 increment toAddress {}  txid {} numberofHolders: {}", [event.params.to.toHexString(), event.transaction.hash.toHexString(), controlledToken.numberOfHolders.toString()])
      }
 
      controlledToken.numberOfHolders = controlledToken.numberOfHolders.plus(ONE)  // if transfer is to NEW address then increment number of players
      controlledToken.save()

      toBalance.balance = event.params.value
      toBalance.controlledToken = controlledToken.id // or event.address
      toBalance.account = loadOrCreateAccount(event.params.to).id
      
    }
    else{ //update case
      if(event.address.equals(Address.fromString("0x4fb19557fbd8d73ac884efbe291626fd5641c778"))){
        log.warning("updating existing balance toAddress {} txid {} balance before: {}, balance after {}", [event.params.to.toHexString(), event.transaction.hash.toHexString(), toBalance.balance.toString(), toBalance.balance.plus(event.params.value).toString() ])
      }

      toBalance.balance = toBalance.balance.plus(event.params.value)
    }
    toBalance.save()
  // }
  // else{ // if it is burning 
    // controlledToken.totalSupply = controlledToken.totalSupply.minus(event.params.value) // decrease total supply
  // }

  
  // if(!minting){ // not a mint event - transfer or burn (withdraw)
    let fromBalance = ControlledTokenBalance.load(generateCompositeId (event.params.from, event.address)) // must always exist
    if(fromBalance){
      if(event.address.equals(Address.fromString("0x4fb19557fbd8d73ac884efbe291626fd5641c778"))){
        log.warning("debug101 decreaseBalance txid {} \n accountId {} \n balanceBefore: {} \n balanceAfter {} ", [event.transaction.hash.toHexString(), event.params.from.toHexString(), fromBalance.balance.toString(), fromBalance.balance.minus(event.params.value).toString()])
      }
      fromBalance.balance = fromBalance.balance.minus(event.params.value)
    
      // if the balance of the sending account is zero then remove it
      if(fromBalance.balance.equals(ZERO)){
        const controlledToken = ControlledToken.load(event.address.toHex()) 
        if(event.address.equals(Address.fromString("0x4fb19557fbd8d73ac884efbe291626fd5641c778"))){
          log.warning("debug78 decrement txid {} \n accountId {} \n numberofHolders: {}", [event.transaction.hash.toHexString(), event.params.from.toHexString(), controlledToken.numberOfHolders.toString()])
        }
  
        // controlledToken.numberOfHolders = controlledToken.numberOfHolders.minus(ONE) // if account balance depleted decrement player count
        // controlledToken.save()
        store.remove("ControlledTokenBalance", fromBalance.id)
      }
      else{
        fromBalance.save()
      }
    }
  // }
  // else{ // we are minting
    // controlledToken.totalSupply = controlledToken.totalSupply.plus(event.params.value)
  // }

}


// helper --Move to helpers
function generateCompositeId(address1: Address, address2: Address) : string {
  return address1.toHex() + "-" + address2.toHex()
}
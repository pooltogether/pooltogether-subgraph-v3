# PoolTogether v3 Subgraph

The official PoolTogether v3 subgraph.

## Quick-use:

```sh
$ yarn prepare:local && graph codegen subgraph.local.yaml && graph build subgraph.local.yaml && yarn create:local && yarn deploy:local
```

## Local Setup

First you'll need to setup a graph node, then you can deploy the project to it.

### Local Graph Node

1. Clone the Graph Node repo:

```bash
$ git clone https://github.com/graphprotocol/graph-node/
```

2. Enter the dir

```bash
$ cd graph-node/docker
```

3. If using Linux, fix the local IP address:

```bash
$ ./setup.sh
```

4. Spin up the node

```bash
$ docker-compose up
```

### Deploying the Subgraph Locally

Make sure you've already deployed the PoolTogether contracts.  If you haven't done so, check out the [mock project](https://github.com/pooltogether/pooltogether-contracts-mock).  Once the contracts are deployed, you can set up the subgraph:

1. Install deps

```bash
$ yarn
```

2. Ensure generated code is up-to-date:

```bash
$ yarn codegen
```

3. Create a new local manifest called `subgraph.local.yaml`

```bash
$ cp subgraph.yaml subgraph.local.yaml
```

4. Update `subgraph.local.yaml` to the correct contract address (network doesn't matter)

```yaml
// subgraph.local.yaml
dataSources:
  - kind: ethereum/contract
    name: PrizeStrategyBuilder
    network: mainnet
    source:
      address: "<Your locally deployed address here>"
      abi: PrizeStrategyBuilder
...
```
  
5. Allocate the subgraph in the local Graph node

```bash
$ yarn create-local
```

6. Update the local subgraph

```bash
$ yarn deploy-local
```

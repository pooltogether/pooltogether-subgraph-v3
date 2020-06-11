import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import { store, log } from '@graphprotocol/graph-ts'
import {
  AdminAdded,
  AdminRemoved,
  Committed,
  CommittedDepositWithdrawn,
  Deposited,
  DepositedAndCommitted,
  FeeCollected,
  NextFeeBeneficiaryChanged,
  NextFeeFractionChanged,
  OpenDepositWithdrawn,
  Opened,
  Paused,
  Rewarded,
  RolledOver,
  SponsorshipAndFeesWithdrawn,
  SponsorshipDeposited,
  Unpaused,
  Withdrawn
} from "../generated/SingleRandomWinnerPrizePoolBuilder"
import {
  Draw,
  Admin
} from '../generated/schema'
import { loadOrCreatePlayer } from './helpers/loadOrCreatePlayer'
import { loadOrCreateSponsor } from './helpers/loadOrCreateSponsor'
import { loadSponsor } from './helpers/loadSponsor'
import { consolidateBalance } from './helpers/consolidateBalance'
import { consolidateDrawId } from './helpers/consolidateDrawId'
import { loadOrCreatePoolContract } from './helpers/loadOrCreatePoolContract'

const ZERO = BigInt.fromI32(0)
const ONE = BigInt.fromI32(1)
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

function formatDrawEntityId(poolAddress: Address, drawId: BigInt): string {
  return poolAddress.toHex() + '-' + drawId.toString()
}

function formatAdminEntityId(poolAddress: Address, adminAddress: Address): string {
  return poolAddress.toHex() + '-' + adminAddress.toHex()
}

export function handleAdminAdded(event: AdminAdded): void {
  let adminEntityId = formatAdminEntityId(event.address, event.params.admin)
  let admin = new Admin(adminEntityId)
  admin.addedAt = event.block.timestamp
  admin.address = event.params.admin

  let poolContract = loadOrCreatePoolContract(event.address)
  admin.poolContract = poolContract.id
  admin.save()
}

export function handleAdminRemoved(event: AdminRemoved): void {
  let adminEntityId = formatAdminEntityId(event.address, event.params.admin)
  store.remove('Admin', adminEntityId)
}

export function handleCommitted(event: Committed): void {
  const openDrawEntityId = formatDrawEntityId(event.address, event.params.drawId)
  const openDraw = Draw.load(openDrawEntityId)

  let poolContract = loadOrCreatePoolContract(event.address)
  poolContract.committedDrawId = openDraw.drawId
  poolContract.version = poolContract.version.plus(ONE)
  poolContract.save()

  openDraw.state = 'Committed'
  openDraw.committedAt = event.block.timestamp
  openDraw.committedAtBlock = event.block.number
  openDraw.version = openDraw.version.plus(ONE)
  openDraw.save()
}

export function handleCommittedDepositWithdrawn(
  event: CommittedDepositWithdrawn
): void {
}

export function handleDeposited(event: Deposited): void {
  let player = loadOrCreatePlayer(event.params.sender, event.address)
  consolidateBalance(player)
  
  let pool = loadOrCreatePoolContract(event.address)
  pool.openBalance = pool.openBalance.plus(event.params.amount)
  pool.version = pool.version.plus(ONE)
  pool.save()

  player.latestBalance = player.latestBalance.plus(event.params.amount)
  player.latestDrawId = pool.openDrawId
  player.version = player.version.plus(ONE)
  consolidateDrawId(player, pool.openDrawId)
  player.save()
}

export function handleDepositedAndCommitted(
  event: DepositedAndCommitted
): void {
  let player = loadOrCreatePlayer(event.params.sender, event.address)
  consolidateBalance(player)

  let pool = loadOrCreatePoolContract(event.address)
  pool.committedBalance = pool.committedBalance.plus(event.params.amount)
  pool.version = pool.version.plus(ONE)
  pool.save()

  player.consolidatedBalance = player.consolidatedBalance.plus(event.params.amount)
  player.version = player.version.plus(ONE)
  consolidateDrawId(player, pool.committedDrawId)
  player.save()
}

export function handleFeeCollected(event: FeeCollected): void {
}

export function handleNextFeeBeneficiaryChanged(
  event: NextFeeBeneficiaryChanged
): void {}

export function handleNextFeeFractionChanged(
  event: NextFeeFractionChanged
): void {}

export function handleOpenDepositWithdrawn(event: OpenDepositWithdrawn): void {
}

export function handleOpened(event: Opened): void {
  const drawEntityId = formatDrawEntityId(event.address, event.params.drawId)
  const draw = new Draw(drawEntityId)

  let poolContract = loadOrCreatePoolContract(event.address, false)
  poolContract.drawsCount = poolContract.drawsCount.plus(ONE)
  poolContract.openDrawId = event.params.drawId
  poolContract.committedBalance = poolContract.committedBalance.plus(poolContract.openBalance)
  poolContract.openBalance = ZERO
  poolContract.version = poolContract.version.plus(ONE)
  poolContract.save()

  draw.drawId = event.params.drawId
  draw.winner = Bytes.fromHexString(ZERO_ADDRESS) as Bytes
  draw.entropy = new Bytes(32)
  draw.winnings = ZERO
  draw.fee = ZERO
  draw.state = 'Open'
  draw.feeBeneficiary = event.params.feeBeneficiary
  draw.secretHash = event.params.secretHash
  draw.feeFraction = event.params.feeFraction
  draw.openedAt = event.block.timestamp
  draw.openedAtBlock = event.block.number
  draw.committedAt = ZERO
  draw.committedAtBlock = ZERO
  draw.rewardedAt = ZERO
  draw.rewardedAtBlock = ZERO
  draw.poolContract = poolContract.id
  draw.balance = ZERO
  draw.version = ZERO
  
  draw.save()
}

export function handlePaused(event: Paused): void {
  let poolContract = loadOrCreatePoolContract(event.address, false)
  poolContract.paused = true
  poolContract.version = poolContract.version.plus(ONE)
  poolContract.save()
}

export function handleRewarded(event: Rewarded): void {
  let pool = loadOrCreatePoolContract(event.address)
  pool.sponsorshipAndFeeBalance = pool.sponsorshipAndFeeBalance.plus(event.params.fee)
  pool.committedBalance = pool.committedBalance.plus(event.params.winnings)
  pool.version = pool.version.plus(ONE)
  pool.save()

  if (event.params.winner.toHex() != ZERO_ADDRESS) {
    let winner = loadOrCreatePlayer(event.params.winner, event.address)
    winner.consolidatedBalance = winner.consolidatedBalance.plus(event.params.winnings)
    winner.version = winner.version.plus(ONE)
    winner.save()
  }

  const committedDraw = Draw.load(formatDrawEntityId(event.address, event.params.drawId))
  committedDraw.state = 'Rewarded'
  committedDraw.winner = event.params.winner
  committedDraw.winnings = event.params.winnings
  committedDraw.fee = event.params.fee
  committedDraw.entropy = event.params.entropy
  committedDraw.rewardedAt = event.block.timestamp
  committedDraw.rewardedAtBlock = event.block.number
  committedDraw.version = committedDraw.version.plus(ONE)
  committedDraw.save()

  let sponsor = loadOrCreateSponsor(Address.fromString(committedDraw.feeBeneficiary.toHex()), event.address)
  sponsor.sponsorshipAndFeeBalance = sponsor.sponsorshipAndFeeBalance.plus(event.params.fee)
  sponsor.save()
}

export function handleRolledOver(event: RolledOver): void {
  const committedDraw = Draw.load(
    formatDrawEntityId(event.address, event.params.drawId)
  )

  committedDraw.state = 'Rewarded'
  committedDraw.entropy = Bytes.fromI32(1) as Bytes
  committedDraw.rewardedAt = event.block.timestamp
  committedDraw.rewardedAtBlock = event.block.number
  committedDraw.version = committedDraw.version.plus(ONE)

  committedDraw.save()
}

export function handleSponsorshipAndFeesWithdrawn(
  event: SponsorshipAndFeesWithdrawn
): void {
}

export function handleSponsorshipDeposited(event: SponsorshipDeposited): void {
  let pool = loadOrCreatePoolContract(event.address)
  pool.sponsorshipAndFeeBalance = pool.sponsorshipAndFeeBalance.plus(event.params.amount)
  pool.version = pool.version.plus(ONE)
  pool.save()

  let sponsor = loadOrCreateSponsor(event.params.sender, event.address)
  sponsor.sponsorshipAndFeeBalance = sponsor.sponsorshipAndFeeBalance.plus(event.params.amount)
  sponsor.save()
}

export function handleUnpaused(event: Unpaused): void {
  let poolContract = loadOrCreatePoolContract(event.address, false)
  poolContract.paused = false
  poolContract.version = poolContract.version.plus(ONE)
  poolContract.save()
}

export function handleWithdrawn(event: Withdrawn): void {
  let player = loadOrCreatePlayer(event.params.sender, event.address)
  consolidateBalance(player)

  let pool = loadOrCreatePoolContract(event.address)
  pool.openBalance = pool.openBalance.minus(player.latestBalance)
  pool.committedBalance = pool.committedBalance.minus(player.consolidatedBalance)
  pool.version = pool.version.plus(ONE)

  let sponsor = loadSponsor(event.params.sender, event.address)
  if (sponsor) {
    pool.sponsorshipAndFeeBalance = pool.sponsorshipAndFeeBalance.minus(sponsor.sponsorshipAndFeeBalance)
    store.remove('Sponsor', sponsor.id)
  }
  pool.save()

  store.remove('Player', player.id)
}

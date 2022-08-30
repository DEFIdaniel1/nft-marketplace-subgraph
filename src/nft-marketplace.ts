import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  ListingCancelled as ListingCancelledEvent, // can rename them as you like
  NFTListed as NFTListedEvent,
  NFTPurchased as NFTPurchasedEvent,
} from "../generated/NFTMarketplace/NFTMarketplace";
import {
  NFTListed,
  NFTPurchased,
  ListingCancelled,
  ActiveItem,
} from "../generated/schema";

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  return tokenId.toHexString() + nftAddress.toHexString();
}

export function handleNFTListed(event: NFTListedEvent): void {
  let nftListed = NFTListed.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!nftListed) {
    nftListed = new NFTListed(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  if (!activeItem) {
    activeItem = new ActiveItem(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  nftListed.seller = event.params.seller;
  activeItem.seller = event.params.seller;

  nftListed.price = event.params.price;
  activeItem.price = event.params.price;

  nftListed.tokenId = event.params.tokenId;
  activeItem.tokenId = event.params.tokenId;

  nftListed.nftAddress = event.params.nftAddress;
  activeItem.nftAddress = event.params.nftAddress;

  nftListed.save();
  activeItem.save();
}

export function handleListingCancelled(event: ListingCancelledEvent): void {
  let cancelledListing = ListingCancelled.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!cancelledListing) {
    cancelledListing = new ListingCancelled(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  cancelledListing.seller = event.params.seller;
  cancelledListing.tokenId = event.params.tokenId;
  cancelledListing.nftAddress = event.params.nftAddress;

  activeItem!.buyer = Address.fromString(
    "0x000000000000000000000000000000000000dEaD"
  ); //dead address is a common burner address nobody owns - can use it to filter cancelled items

  cancelledListing.save();
  activeItem!.save();
}

export function handleNFTPurchased(event: NFTPurchasedEvent): void {
  let nftPurchased = NFTPurchased.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!nftPurchased) {
    nftPurchased = new NFTPurchased(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  nftPurchased.buyer = event.params.buyer;
  nftPurchased.tokenId = event.params.tokenId;
  nftPurchased.nftAddress = event.params.nftAddress;
  nftPurchased.buyer = event.params.buyer;

  // activeItem should already exist, just need to update the buyer field
  activeItem!.buyer = event.params.buyer;
  nftPurchased.save();
  activeItem!.save();
  // not deleting ActiveItem. Just filter - if buyer, it's been purchased, otherwise, it's still active
}

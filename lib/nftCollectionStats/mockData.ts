export function collectionStatsRinkeby() {
  const [items, owners] = getFakeItemsAndOwners();
  return {
    floor: getFakeFloor(),
    items,
    owners,
    volume: getFakeVolume(),
  };
}

// MOCK METHODS TO GENERATE FAKE STATS FOR RINKEBY
export function getFakeFloor(): number {
  return Math.floor(Math.random() * (20 + 1));
}

export function getFakeItemsAndOwners(): [number, number] {
  const items = Math.floor(Math.random() * 800);
  const owners = Math.floor(Math.random() * (items - 1));

  return [items, owners];
}

export function getFakeVolume(): number {
  return Math.floor(Math.random() * 2000);
}

// Distributed Multi-Warehouse Order Allocation & Routing Engine
// Implements heuristic optimization minimizing distance and split-shipments.

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Distance in kilometers
}

/**
 * Evaluates candidates warehouses to fulfill an incoming order.
 * Considers:
 * 1. Available to Promise (ATP = onHand - reserved) for each line item.
 * 2. Geographic distance from warehouse to customer coordinates.
 * 3. Split-shipment penalty ($P_{split} = 500$ points) to favor single-facility fulfillment.
 */
export function simulateOrderAllocation(orderItems, destination, warehouses, stockRecords) {
  // destination: { lat, lon, city, state }
  // orderItems: [ { productId, quantity } ]

  const warehouseEvaluations = warehouses.map((wh) => {
    // Default coordinates if not set
    const whLat = wh.latitude || (wh.id === "WH-CHI" ? 41.8781 : wh.id === "WH-NJ" ? 40.7128 : 34.0522);
    const whLon = wh.longitude || (wh.id === "WH-CHI" ? -87.6298 : wh.id === "WH-NJ" ? -74.006 : -118.2437);

    const distanceKm = calculateDistance(destination.lat, destination.lon, whLat, whLon);

    let canFulfillAll = true;
    let fulfilledItemsCount = 0;
    const itemStockBreakdown = [];

    orderItems.forEach((item) => {
      const stock = stockRecords.find(
        (s) => s.warehouseId === wh.id && s.productId === item.productId
      );
      const atp = stock ? Math.max(0, stock.onHand - (stock.reserved || 0)) : 0;
      const canFulfillLine = atp >= item.quantity;

      if (!canFulfillLine) canFulfillAll = false;
      if (atp > 0) fulfilledItemsCount++;

      itemStockBreakdown.push({
        productId: item.productId,
        requestedQty: item.quantity,
        availableAtp: atp,
        canFulfill: canFulfillLine
      });
    });

    // Score calculation (lower is better):
    // Base score = distance in km
    // If cannot fulfill all items, add penalty 1500 per missing item
    const unfulfilledCount = orderItems.length - fulfilledItemsCount;
    let score = distanceKm;
    if (!canFulfillAll) {
      score += 2000 + unfulfilledCount * 500;
    }

    return {
      warehouseId: wh.id,
      warehouseName: wh.name,
      warehouseCode: wh.code,
      city: wh.city,
      distanceKm,
      canFulfillAll,
      fulfilledItemsCount,
      totalItems: orderItems.length,
      score,
      itemStockBreakdown
    };
  });

  // Sort best candidate first (lowest score)
  warehouseEvaluations.sort((a, b) => a.score - b.score);

  const bestChoice = warehouseEvaluations[0];
  const isSplitNeeded = !bestChoice.canFulfillAll;

  return {
    allocatedWarehouse: bestChoice,
    isSplitNeeded,
    allCandidates: warehouseEvaluations,
    strategy: bestChoice.canFulfillAll
      ? "Single-Node Optimal Proximity Fulfillment"
      : "Multi-Node Split-Shipment Required (Insufficient Stock in Nearest DC)"
  };
}

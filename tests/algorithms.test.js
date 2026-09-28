import test from "node:test";
import assert from "node:assert/strict";

import { calculateDistance, simulateOrderAllocation } from "../src/algorithms/stockAllocation.js";
import { calculateSafetyStock, calculateROP, calculateEOQ } from "../src/algorithms/reorderPoint.js";
import { ValuationEngine } from "../src/algorithms/valuation.js";

test("Algorithm 1: Distance Calculation & Haversine Formula", () => {
  // Distance from NYC (40.7128, -74.006) to Chicago (41.8781, -87.6298) is ~1145 km
  const dist = calculateDistance(40.7128, -74.006, 41.8781, -87.6298);
  assert.ok(dist > 1100 && dist < 1200, `Expected ~1145 km, got ${dist}`);
});

test("Algorithm 1: Multi-Warehouse Order Allocation with Split-Shipment Penalty", () => {
  const warehouses = [
    { id: "WH-CHI", name: "Chicago Central Hub", code: "CHI-01", city: "Chicago", latitude: 41.8781, longitude: -87.6298 },
    { id: "WH-NJ", name: "New Jersey Regional DC", code: "NJ-02", city: "Newark", latitude: 40.7128, longitude: -74.006 },
    { id: "WH-LA", name: "Pacific West Fulfillment", code: "LA-03", city: "Los Angeles", latitude: 34.0522, longitude: -118.2437 }
  ];

  // Stock scenario: NJ has full stock for item 1 and 2
  const stock = [
    { warehouseId: "WH-NJ", productId: "P1", onHand: 100, reserved: 0 },
    { warehouseId: "WH-NJ", productId: "P2", onHand: 50, reserved: 0 },
    { warehouseId: "WH-CHI", productId: "P1", onHand: 10, reserved: 0 },
    { warehouseId: "WH-CHI", productId: "P2", onHand: 0, reserved: 0 }
  ];

  const destinationNYC = { lat: 40.7128, lon: -74.006 };
  const items = [
    { productId: "P1", quantity: 5 },
    { productId: "P2", quantity: 2 }
  ];

  const result = simulateOrderAllocation(items, destinationNYC, warehouses, stock);

  // NJ should win due to 0 distance and 100% line fulfillment
  assert.equal(result.allocatedWarehouse.warehouseId, "WH-NJ");
  assert.equal(result.allocatedWarehouse.canFulfillAll, true);
  assert.equal(result.isSplitNeeded, false);
});

test("Algorithm 2: Dynamic Reorder Point (ROP) & Safety Stock", () => {
  const dailyDemand = 20; // units/day
  const leadTimeDays = 10; // days
  const sigmaDemand = 3;
  const sigmaLeadTime = 2;

  const ss = calculateSafetyStock(dailyDemand, leadTimeDays, sigmaDemand, sigmaLeadTime, "95%");
  assert.ok(ss > 0, "Safety stock must be strictly positive");

  const rop = calculateROP(dailyDemand, leadTimeDays, ss);
  // Expected: (20 * 10) + ss = 200 + ss
  assert.equal(rop, 200 + ss);
  assert.ok(rop > 200, "ROP must exceed pure lead-time demand");

  // EOQ calculation test
  const annualDemand = dailyDemand * 365; // 7300 units
  const fixedOrderCost = 50; // $50/order
  const unitCost = 40; // $40/unit
  const eoq = calculateEOQ(annualDemand, fixedOrderCost, unitCost, 0.2);
  assert.ok(eoq >= 10, "EOQ should be a reasonable batch quantity");
});

test("Algorithm 3: Dual Inventory Valuation (FIFO vs AVCO)", () => {
  const costLayers = [
    { batchId: "LOT-A", quantity: 10, unitCost: 10.0, receivedDate: "2026-01-01" },
    { batchId: "LOT-B", quantity: 10, unitCost: 20.0, receivedDate: "2026-02-01" }
  ];

  // Test depletion of 15 units under FIFO:
  // Should consume 10 units @ $10 ($100) + 5 units @ $20 ($100) = $200 COGS
  const fifo = ValuationEngine.computeFIFO(costLayers, 15);
  assert.equal(fifo.cogsTotal, 200);
  assert.equal(fifo.remainingUnits, 5);
  assert.equal(fifo.remainingStockValue, 100); // 5 remaining units @ $20

  // Test depletion of 15 units under AVCO:
  // Total cost: 10*10 + 10*20 = $300 across 20 units -> Avg unit cost = $15
  // Depleting 15 units * $15 = $225 COGS, 5 remaining units * $15 = $75 remaining value
  const avco = ValuationEngine.computeAVCO(costLayers, 15);
  assert.equal(avco.weightedAvgUnitCost, 15);
  assert.equal(avco.cogsTotal, 225);
  assert.equal(avco.remainingUnits, 5);
  assert.equal(avco.remainingStockValue, 75);
});

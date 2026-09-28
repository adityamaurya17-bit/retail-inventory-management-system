import {
  initialProducts,
  initialWarehouses,
  initialStock,
  initialSuppliers,
  initialPurchaseOrders,
  initialSalesOrders,
  initialStockTransfers,
  initialAuditLogs,
  agileCaseStudy
} from "../data/initialData.js";
import { api } from "../services/api.js";

const STORAGE_KEY = "RIMS_AGILE_CAPSTONE_STATE_V1";

class Store {
  constructor() {
    this.subscribers = new Set();
    this.dbConnected = false;
    this.dbDetails = null;
    this.currentUser = {
      id: 1,
      name: "Aarav Sharma",
      email: "admin@retailhub.in",
      role: "Admin"
    };
    this.loadState();
    this.syncWithBackend();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.products = parsed.products || initialProducts;
        this.warehouses = parsed.warehouses || initialWarehouses;
        this.stock = parsed.stock || initialStock;
        this.suppliers = parsed.suppliers || initialSuppliers;
        this.purchaseOrders = parsed.purchaseOrders || initialPurchaseOrders;
        this.salesOrders = parsed.salesOrders || initialSalesOrders;
        this.stockTransfers = parsed.stockTransfers || initialStockTransfers;
        this.auditLogs = parsed.auditLogs || initialAuditLogs;
        this.agile = parsed.agile || agileCaseStudy;
        return;
      }
    } catch (e) {
      console.warn("Could not load from localStorage, initializing defaults", e);
    }

    this.resetToDefaults(false);
  }

  saveState() {
    try {
      const payload = {
        products: this.products,
        warehouses: this.warehouses,
        stock: this.stock,
        suppliers: this.suppliers,
        purchaseOrders: this.purchaseOrders,
        salesOrders: this.salesOrders,
        stockTransfers: this.stockTransfers,
        auditLogs: this.auditLogs,
        agile: this.agile
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
    this.notify();
  }

  resetToDefaults(shouldNotify = true) {
    this.products = JSON.parse(JSON.stringify(initialProducts));
    this.warehouses = JSON.parse(JSON.stringify(initialWarehouses));
    this.stock = JSON.parse(JSON.stringify(initialStock));
    this.suppliers = JSON.parse(JSON.stringify(initialSuppliers));
    this.purchaseOrders = JSON.parse(JSON.stringify(initialPurchaseOrders));
    this.salesOrders = JSON.parse(JSON.stringify(initialSalesOrders));
    this.stockTransfers = JSON.parse(JSON.stringify(initialStockTransfers));
    this.auditLogs = JSON.parse(JSON.stringify(initialAuditLogs));
    this.agile = JSON.parse(JSON.stringify(agileCaseStudy));
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    if (shouldNotify) {
      this.logAudit("DEMO_DATA_RESET", "System Admin", "Reset all inventory records and Agile case study to baseline demo state.");
      this.notify();
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach((cb) => cb(this));
  }

  logAudit(action, user, details) {
    const log = {
      id: `LOG-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      action,
      user,
      details
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 50) this.auditLogs.pop();
  }

  // --- Product Getters & Mutations ---
  getProducts() {
    return this.products;
  }

  getProduct(id) {
    return this.products.find((p) => p.id === id);
  }

  getProductStockSummary(productId) {
    const records = this.stock.filter((s) => s.productId === productId);
    const onHand = records.reduce((acc, r) => acc + (r.onHand || 0), 0);
    const reserved = records.reduce((acc, r) => acc + (r.reserved || 0), 0);
    const available = Math.max(0, onHand - reserved);
    return { onHand, reserved, available, records };
  }

  addProduct(productData) {
    const newId = `PROD-${1000 + this.products.length + 1}`;
    const product = {
      id: newId,
      status: "Active",
      ...productData,
      costPrice: parseFloat(productData.costPrice) || 0,
      sellingPrice: parseFloat(productData.sellingPrice) || 0,
      reorderPoint: parseInt(productData.reorderPoint) || 20,
      maxStock: parseInt(productData.maxStock) || 100
    };
    this.products.unshift(product);

    // Create initial stock record at primary warehouse if specified
    const primaryWh = productData.initialWarehouse || "WH-CHI";
    const initialQty = parseInt(productData.initialStock) || 0;
    if (initialQty > 0) {
      this.stock.push({
        id: `STK-${Date.now().toString().slice(-4)}`,
        productId: newId,
        warehouseId: primaryWh,
        bin: "A-01-01",
        onHand: initialQty,
        reserved: 0,
        batch: `LOT-${new Date().getFullYear()}-N1`
      });
    }

    this.logAudit(
      "PRODUCT_CREATED",
      "Catalog Merchandiser",
      `Added product '${product.name}' (SKU: ${product.sku}) with ${initialQty} initial units at ${primaryWh}.`
    );
    this.saveState();
    return product;
  }

  updateProduct(id, productData) {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.products[idx] = {
        ...this.products[idx],
        ...productData,
        costPrice: parseFloat(productData.costPrice) || this.products[idx].costPrice,
        sellingPrice: parseFloat(productData.sellingPrice) || this.products[idx].sellingPrice,
        reorderPoint: parseInt(productData.reorderPoint) || this.products[idx].reorderPoint,
        maxStock: parseInt(productData.maxStock) || this.products[idx].maxStock
      };
      this.logAudit("PRODUCT_UPDATED", "Catalog Manager", `Updated specifications for product SKU: ${this.products[idx].sku}.`);
      this.saveState();
    }
  }

  deleteProduct(id) {
    const prod = this.getProduct(id);
    if (!prod) return;
    this.products = this.products.filter((p) => p.id !== id);
    this.stock = this.stock.filter((s) => s.productId !== id);
    this.logAudit("PRODUCT_DELETED", "Catalog Manager", `Deactivated and removed SKU: ${prod.sku}.`);
    this.saveState();
  }

  // --- Warehouses & Stock ---
  getWarehouses() {
    return this.warehouses;
  }

  getWarehouse(id) {
    return this.warehouses.find((w) => w.id === id);
  }

  getStock() {
    return this.stock;
  }

  getWarehouseUtilization(warehouseId) {
    const wh = this.getWarehouse(warehouseId);
    if (!wh) return { totalCapacity: 0, usedUnits: 0, percent: 0 };
    const stockInWh = this.stock.filter((s) => s.warehouseId === warehouseId);
    const usedUnits = stockInWh.reduce((sum, item) => sum + (item.onHand || 0), 0);
    const percent = Math.min(100, Math.round((usedUnits / wh.capacity) * 100));
    return {
      totalCapacity: wh.capacity,
      usedUnits,
      percent,
      itemCount: stockInWh.length
    };
  }

  adjustStock(productId, warehouseId, bin, newPhysicalCount, reason, notes) {
    const prod = this.getProduct(productId);
    const wh = this.getWarehouse(warehouseId);
    let record = this.stock.find((s) => s.productId === productId && s.warehouseId === warehouseId && s.bin === bin);

    const prevCount = record ? record.onHand : 0;
    const variance = newPhysicalCount - prevCount;

    if (!record) {
      record = {
        id: `STK-${Date.now().toString().slice(-4)}`,
        productId,
        warehouseId,
        bin: bin || "A-01-01",
        onHand: newPhysicalCount,
        reserved: 0,
        batch: `LOT-${new Date().getFullYear()}-ADJ`
      };
      this.stock.push(record);
    } else {
      record.onHand = Math.max(0, newPhysicalCount);
    }

    this.logAudit(
      "CYCLE_COUNT_ADJUSTMENT",
      "Warehouse Auditor",
      `Adjusted ${prod?.sku || productId} at ${wh?.name} (Bin: ${bin}): Prior=${prevCount}, Physical=${newPhysicalCount} (Var: ${variance > 0 ? "+" : ""}${variance}). Reason: ${reason}. Notes: ${notes || "N/A"}`
    );
    this.saveState();
  }

  // --- Inter-Warehouse Stock Transfers ---
  getStockTransfers() {
    return this.stockTransfers;
  }

  createStockTransfer(data) {
    const newId = `TRF-${Date.now().toString().slice(-4)}`;
    const transferNum = `TO-2026-${(this.stockTransfers.length + 1).toString().padStart(2, "0")}`;

    const transfer = {
      id: newId,
      transferNumber: transferNum,
      fromWarehouseId: data.fromWarehouseId,
      toWarehouseId: data.toWarehouseId,
      date: new Date().toISOString().split("T")[0],
      status: "In-Transit",
      carrier: data.carrier || "Dedicated Logistics Freight",
      trackingNumber: data.trackingNumber || `TRK-${Math.floor(1000000 + Math.random() * 9000000)}`,
      eta: data.eta || "In 3 Business Days",
      reason: data.reason || "Regional Stock Rebalancing",
      items: data.items
    };

    // Deduct stock from origin warehouse
    data.items.forEach((item) => {
      const stockRec = this.stock.find(
        (s) => s.productId === item.productId && s.warehouseId === data.fromWarehouseId
      );
      if (stockRec) {
        stockRec.onHand = Math.max(0, stockRec.onHand - item.quantity);
      }
    });

    this.stockTransfers.unshift(transfer);
    const originWh = this.getWarehouse(data.fromWarehouseId)?.name;
    const destWh = this.getWarehouse(data.toWarehouseId)?.name;
    this.logAudit(
      "TRANSFER_DISPATCHED",
      "Logistics Dispatcher",
      `Created ${transferNum} (${transfer.items.length} SKUs) from ${originWh} to ${destWh}. Status: In-Transit.`
    );
    this.saveState();
    return transfer;
  }

  completeStockTransfer(transferId) {
    const trf = this.stockTransfers.find((t) => t.id === transferId);
    if (!trf || trf.status === "Completed") return;

    // Add stock to destination warehouse
    trf.items.forEach((item) => {
      let destRec = this.stock.find(
        (s) => s.productId === item.productId && s.warehouseId === trf.toWarehouseId
      );
      if (destRec) {
        destRec.onHand += item.quantity;
      } else {
        this.stock.push({
          id: `STK-${Date.now().toString().slice(-4)}`,
          productId: item.productId,
          warehouseId: trf.toWarehouseId,
          bin: "A-01-01",
          onHand: item.quantity,
          reserved: 0,
          batch: `LOT-TRF-${trf.transferNumber}`
        });
      }
    });

    trf.status = "Completed";
    const destWh = this.getWarehouse(trf.toWarehouseId)?.name;
    this.logAudit(
      "TRANSFER_RECEIVED",
      "Receiving Manager",
      `Received and verified ${trf.transferNumber} at ${destWh}. Stock ingested into destination bins.`
    );
    this.saveState();
  }

  // --- Supplier & Procurement (PO / GRN) ---
  getSuppliers() {
    return this.suppliers;
  }

  getSupplier(id) {
    return this.suppliers.find((s) => s.id === id);
  }

  getPurchaseOrders() {
    return this.purchaseOrders;
  }

  createPurchaseOrder(poData) {
    const newId = `PO-2026-${(this.purchaseOrders.length + 1).toString().padStart(3, "0")}`;
    const poNum = `PO-${Math.floor(88000 + Math.random() * 999)}`;

    let total = 0;
    const items = poData.items.map((item) => {
      const prod = this.getProduct(item.productId);
      const cost = parseFloat(item.unitCost) || prod?.costPrice || 10;
      const qty = parseInt(item.quantity) || 1;
      total += cost * qty;
      return {
        productId: item.productId,
        quantity: qty,
        unitCost: cost,
        receivedQty: 0
      };
    });

    const sup = this.getSupplier(poData.supplierId);
    const expected = new Date();
    expected.setDate(expected.getDate() + (sup?.leadTimeDays || 10));

    const po = {
      id: newId,
      poNumber: poNum,
      supplierId: poData.supplierId,
      warehouseId: poData.warehouseId || "WH-CHI",
      orderDate: new Date().toISOString().split("T")[0],
      expectedDate: expected.toISOString().split("T")[0],
      status: "Approved",
      paymentTerms: sup?.paymentTerms || "Net 30",
      totalAmount: total,
      items,
      notes: poData.notes || "Procurement order created via RIMS automated portal."
    };

    this.purchaseOrders.unshift(po);
    this.logAudit(
      "PO_CREATED",
      "Procurement Specialist",
      `Issued ${poNum} to ${sup?.name} for $${total.toFixed(2)} to ${this.getWarehouse(po.warehouseId)?.name}.`
    );
    this.saveState();
    return po;
  }

  updatePurchaseOrderStatus(poId, status) {
    const po = this.purchaseOrders.find((p) => p.id === poId);
    if (!po) return;
    po.status = status;
    this.logAudit("PO_STATUS_CHANGE", "Procurement Agent", `PO ${po.poNumber} transitioned to status: ${status}.`);
    this.saveState();
  }

  receiveGoodsReceipt(poId, receivedMap, clerkName, notes) {
    const po = this.purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    let allComplete = true;
    let anyReceived = false;

    po.items.forEach((item) => {
      const additionalQty = parseInt(receivedMap[item.productId]) || 0;
      if (additionalQty > 0) {
        anyReceived = true;
        item.receivedQty = (item.receivedQty || 0) + additionalQty;

        // Ingest into target warehouse stock
        let stockRec = this.stock.find(
          (s) => s.productId === item.productId && s.warehouseId === po.warehouseId
        );
        if (stockRec) {
          stockRec.onHand += additionalQty;
        } else {
          this.stock.push({
            id: `STK-${Date.now().toString().slice(-4)}`,
            productId: item.productId,
            warehouseId: po.warehouseId,
            bin: "A-01-01",
            onHand: additionalQty,
            reserved: 0,
            batch: `LOT-GRN-${po.poNumber}`
          });
        }
      }

      if (item.receivedQty < item.quantity) {
        allComplete = false;
      }
    });

    if (allComplete) {
      po.status = "Received";
    } else if (anyReceived) {
      po.status = "Partially Received";
    }

    const grnId = `GRN-${Math.floor(4000 + Math.random() * 900)}`;
    this.logAudit(
      "GRN_PROCESSED",
      clerkName || "Inbound Dock Inspector",
      `Generated ${grnId} for PO ${po.poNumber} at ${this.getWarehouse(po.warehouseId)?.name}. Inventory updated. Notes: ${notes || "Receipt verified."}`
    );
    this.saveState();
  }

  // --- Sales Orders & Fulfillment ---
  getSalesOrders() {
    return this.salesOrders;
  }

  createSalesOrder(orderData) {
    const newId = `ORD-${Date.now().toString().slice(-4)}`;
    const orderNum = `SO-${Math.floor(7000 + Math.random() * 999)}`;

    let total = 0;
    const items = orderData.items.map((it) => {
      const prod = this.getProduct(it.productId);
      const price = prod?.sellingPrice || 50;
      const qty = parseInt(it.quantity) || 1;
      total += price * qty;
      return {
        productId: it.productId,
        quantity: qty,
        unitPrice: price
      };
    });

    const chosenWarehouse = orderData.warehouseId || "WH-CHI";

    // Reserve stock immediately
    items.forEach((it) => {
      const stockRec = this.stock.find(
        (s) => s.productId === it.productId && s.warehouseId === chosenWarehouse
      );
      if (stockRec) {
        stockRec.reserved = (stockRec.reserved || 0) + it.quantity;
      }
    });

    const order = {
      id: newId,
      orderNumber: orderNum,
      customer: {
        name: orderData.customerName || "Customer",
        email: orderData.customerEmail || "customer@example.com",
        channel: orderData.channel || "E-Commerce Direct",
        shippingAddress: orderData.shippingAddress || "100 Main St, Chicago, IL"
      },
      warehouseId: chosenWarehouse,
      orderDate: new Date().toISOString().replace("T", " ").slice(0, 16),
      carrier: orderData.carrier || "FedEx Ground",
      trackingNumber: `Pending`,
      priority: orderData.priority || "Normal",
      status: "Pending Allocation",
      totalAmount: total,
      items
    };

    this.salesOrders.unshift(order);
    this.logAudit(
      "ORDER_PLACED",
      "Omnichannel Intake",
      `New order ${orderNum} from ${order.customer.name} ($${total.toFixed(2)}). Stock reserved at ${this.getWarehouse(chosenWarehouse)?.name}.`
    );
    this.saveState();
    return order;
  }

  advanceOrderStatus(orderId, targetStatus) {
    const ord = this.salesOrders.find((o) => o.id === orderId);
    if (!ord) return;

    const prevStatus = ord.status;
    ord.status = targetStatus;

    if (targetStatus === "Dispatched" && prevStatus !== "Dispatched" && prevStatus !== "Delivered") {
      // Order permanently shipped: deduct from onHand and clear reserved
      ord.items.forEach((it) => {
        const stockRec = this.stock.find(
          (s) => s.productId === it.productId && s.warehouseId === ord.warehouseId
        );
        if (stockRec) {
          stockRec.onHand = Math.max(0, stockRec.onHand - it.quantity);
          stockRec.reserved = Math.max(0, (stockRec.reserved || 0) - it.quantity);
        }
      });
      if (!ord.trackingNumber || ord.trackingNumber === "Pending") {
        ord.trackingNumber = `${ord.carrier.split(" ")[0].toUpperCase()}-${Math.floor(100000000 + Math.random() * 900000000)}`;
      }
    }

    this.logAudit(
      "ORDER_STATUS_CHANGE",
      "Fulfillment Lead",
      `Order ${ord.orderNumber} advanced from '${prevStatus}' to '${targetStatus}'. Carrier: ${ord.carrier}.`
    );
    this.saveState();
  }

  // --- Audit Logs ---
  getAuditLogs() {
    return this.auditLogs;
  }

  // --- Agile Capstone Case Study Accessors ---
  getAgileCaseStudy() {
    return this.agile;
  }

  getSprint(sprintNumber) {
    return this.agile.sprints.find((s) => s.sprintNumber === parseInt(sprintNumber));
  }

  getEpic(epicId) {
    return this.agile.epics.find((e) => e.id === epicId);
  }

  updateStoryStatus(sprintNumber, storyId, newStatus) {
    const sprint = this.getSprint(sprintNumber);
    if (!sprint) return;
    const story = sprint.stories.find((s) => story.id === storyId);
    if (!story) return;
    story.status = newStatus;
    this.logAudit(
      "AGILE_STORY_UPDATED",
      "Scrum Master",
      `Sprint ${sprintNumber} Story [${story.id}] ${story.title} marked '${newStatus}'.`
    );
    this.saveState();
  }

  // --- PostgreSQL Backend Sync & RBAC Methods ---
  async syncWithBackend() {
    try {
      const health = await api.checkHealth();
      if (health.status === "healthy" && health.database && health.database.connected) {
        this.dbConnected = true;
        this.dbDetails = health.database;

        // Auto-login with default role if no token
        if (!api.token) {
          try {
            await api.login(this.currentUser.email, "Password123!");
          } catch (loginErr) {
            console.warn("Auto-login failed:", loginErr.message);
          }
        }

        // Fetch live dashboard & metrics to verify live sync
        try {
          const dash = await api.getDashboardSummary();
          if (dash && dash.success) {
            this.liveDashboard = dash.data;
          }
        } catch (dashErr) {
          console.warn("Live dashboard fetch notice:", dashErr.message);
        }

        this.notify();
      } else {
        this.dbConnected = false;
        this.dbDetails = null;
      }
    } catch (e) {
      this.dbConnected = false;
      this.dbDetails = null;
    }
  }

  getDbStatus() {
    return {
      connected: this.dbConnected,
      details: this.dbDetails
    };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async switchRole(roleName) {
    const roleMap = {
      "Admin": { email: "admin@retailhub.in", name: "Aarav Sharma" },
      "Inventory Manager": { email: "inventory@retailhub.in", name: "Priya Patel" },
      "Sales Manager": { email: "sales@retailhub.in", name: "Rohan Verma" },
      "Supplier Manager": { email: "supplier@retailhub.in", name: "Ananya Iyer" }
    };

    const target = roleMap[roleName] || roleMap["Admin"];
    this.currentUser = {
      name: target.name,
      email: target.email,
      role: roleName
    };

    if (this.dbConnected) {
      try {
        const res = await api.login(target.email, "Password123!");
        if (res.success && res.data.user) {
          this.currentUser = res.data.user;
        }
      } catch (err) {
        console.warn("Role switch API login error:", err.message);
      }
    }

    this.logAudit("RBAC_ROLE_SWITCH", this.currentUser.name, `Active user switched to [${roleName}] (${target.email}).`);
    this.notify();
    return this.currentUser;
  }
}

export const store = new Store();

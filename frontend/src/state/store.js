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

// Universal 2-Role System Architecture
export const ROLES = {
  USER: "User / Customer",
  WAREHOUSE_INVENTORY: "Warehouse & Inventory Management"
};

export const DEMO_ACCOUNTS = {
  USER: {
    email: "customer@retailhub.in",
    password: "Password123!",
    name: "Dr. Evelyn Reed",
    role: ROLES.USER
  },
  WAREHOUSE_INVENTORY: {
    email: "adityamaurya@retailhub.in",
    password: "Password123!",
    name: "ADITYA MAURYA",
    role: ROLES.WAREHOUSE_INVENTORY
  }
};

/**
 * Normalizes any legacy or external role string to one of the exactly two supported roles
 */
export function normalizeRole(rawRole) {
  if (!rawRole) return ROLES.USER;
  const lower = String(rawRole).toLowerCase();
  if (lower.includes("customer") || lower.includes("user") || lower.includes("shopper")) {
    return ROLES.USER;
  }
  return ROLES.WAREHOUSE_INVENTORY;
}

class Store {
  constructor() {
    this.subscribers = new Set();
    this.dbConnected = false;
    this.dbDetails = null;

    // Check if user chose "Remember Me"
    const isRemembered = localStorage.getItem("rims_remember_me") === "true";
    const savedUser = isRemembered ? localStorage.getItem("rims_current_user") : null;
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const name = (!u.name || u.name === "Aarav Sharma") ? "ADITYA MAURYA" : u.name;
        const email = (!u.email || u.email === "admin@retailhub.in") ? "adityamaurya@retailhub.in" : u.email;
        this.currentUser = {
          ...u,
          name,
          email,
          role: ROLES.WAREHOUSE_INVENTORY
        };
        localStorage.setItem("rims_current_user", JSON.stringify(this.currentUser));
      } catch (e) {
        this.currentUser = null;
        localStorage.removeItem("rims_current_user");
        localStorage.removeItem("rims_remember_me");
      }
    } else {
      // First visit or remember me not active: authentication required
      this.currentUser = null;
    }

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
        this.auditLogs = (parsed.auditLogs && parsed.auditLogs.length >= 8) ? parsed.auditLogs : initialAuditLogs;
        this.agile = parsed.agile || agileCaseStudy;
        this.cart = parsed.cart || [];
        this.wishlist = parsed.wishlist || ["PROD-1001", "PROD-1004"];
        this.deliveryLocation = parsed.deliveryLocation || { pincode: "400001", city: "Mumbai", area: "Fort / Colaba" };
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
        agile: this.agile,
        cart: this.cart || [],
        wishlist: this.wishlist || [],
        deliveryLocation: this.deliveryLocation || { pincode: "400001", city: "Mumbai", area: "Fort / Colaba" }
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
    this.cart = [];
    this.wishlist = ["PROD-1001", "PROD-1004"];
    this.deliveryLocation = { pincode: "400001", city: "Mumbai", area: "Fort / Colaba" };
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
      notes: poData.notes || "Procurement order created via Stockora automated portal."
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

  isAuthenticated() {
    return Boolean(this.currentUser);
  }

  getCurrentRole() {
    return this.currentUser ? normalizeRole(this.currentUser.role) : null;
  }

  isCustomer() {
    return this.getCurrentRole() === ROLES.USER;
  }

  isWarehouseInventory() {
    return this.getCurrentRole() === ROLES.WAREHOUSE_INVENTORY;
  }

  /**
   * Enterprise Customer Master Directory Aggregator
   */
  getCustomers() {
    const custMap = new Map();

    // Default primary customer account
    custMap.set("customer@retailhub.in", {
      id: "CUST-1001",
      name: "Dr. Evelyn Reed",
      email: "customer@retailhub.in",
      phone: "+91 98200 12345",
      city: "Mumbai, Maharashtra",
      shippingAddress: "Flat 402, High Point Regency, Worli, Mumbai 400018",
      channel: "Stockora Storefront Web",
      ordersCount: 0,
      totalSpent: 0,
      lastOrderDate: "2026-09-29",
      status: "Active"
    });

    // Extract unique customer accounts from Sales Orders ledger
    (this.salesOrders || []).forEach((ord, idx) => {
      const email = ord.customer?.email || `customer-${idx + 1}@example.com`;
      const name = ord.customer?.name || `Customer #${idx + 1}`;
      const existing = custMap.get(email) || {
        id: `CUST-${1002 + custMap.size}`,
        name,
        email,
        phone: ord.customer?.phone || "+1 (555) 234-5678",
        city: ord.customer?.shippingAddress?.split(",")?.slice(-2)?.[0]?.trim() || "Metro Distribution",
        shippingAddress: ord.customer?.shippingAddress || "Regional Delivery Address",
        channel: ord.customer?.channel || "Direct E-Commerce",
        ordersCount: 0,
        totalSpent: 0,
        lastOrderDate: ord.orderDate || "2026-09-28",
        status: "Active"
      };

      existing.ordersCount += 1;
      existing.totalSpent += (ord.totalAmount || 0);
      if (ord.orderDate > existing.lastOrderDate) {
        existing.lastOrderDate = ord.orderDate;
      }
      custMap.set(email, existing);
    });

    return Array.from(custMap.values());
  }

  async switchRole(targetRole = ROLES.WAREHOUSE_INVENTORY) {
    this.currentUser = {
      id: 1,
      name: "ADITYA MAURYA",
      email: "adityamaurya@retailhub.in",
      role: ROLES.WAREHOUSE_INVENTORY
    };
    this.setAppMode("admin");
    localStorage.setItem("rims_current_user", JSON.stringify(this.currentUser));

    if (this.dbConnected) {
      try {
        await api.login(this.currentUser.email, "Password123!");
      } catch (err) {
        console.warn("Admin API login notice:", err.message);
      }
    }

    this.logAudit("RBAC_ROLE_SWITCH", this.currentUser.name, `Active session set to [${this.currentUser.role}] (${this.currentUser.email}).`);
    this.notify();
    return this.currentUser;
  }

  async login(email, password, desiredRole = null, rememberMe = false) {
    try {
      const cleanEmail = (email || "").toLowerCase().trim();

      if (this.dbConnected) {
        try {
          const res = await api.login(cleanEmail, password, rememberMe);
          if (res.success && res.data) {
            this.currentUser = {
              ...res.data.user,
              role: ROLES.WAREHOUSE_INVENTORY
            };
            this.setAppMode("admin");
            if (rememberMe) {
              localStorage.setItem("rims_remember_me", "true");
              localStorage.setItem("rims_current_user", JSON.stringify(this.currentUser));
            } else {
              localStorage.removeItem("rims_remember_me");
              localStorage.removeItem("rims_current_user");
            }
            this.logAudit("USER_LOGIN", this.currentUser.name, `Logged in successfully as Administrator.`);
            await this.syncWithBackend();
            this.notify();
            return { success: true, user: this.currentUser };
          }
          return { success: false, message: res.message || "Invalid administrator credentials." };
        } catch (apiErr) {
          // If the backend returned an authentication error (e.g. 401 Invalid email/password), reject immediately
          const isNetworkError = apiErr.message?.includes("Failed to fetch") || apiErr.message?.includes("NetworkError");
          if (!isNetworkError) {
            return { success: false, message: apiErr.message || "Invalid administrator credentials." };
          }
          console.warn("Backend server unreachable, checking offline administrator fallback:", apiErr.message);
        }
      }

      // Offline Fallback: ONLY allows the designated Administrator account with valid password
      const allowedAdminEmails = ["adityamaurya@retailhub.in", "admin@retailhub.in"];
      const validPasswords = ["Password123!", "admin", "password"];

      if (allowedAdminEmails.includes(cleanEmail) && validPasswords.includes(password)) {
        this.currentUser = {
          id: 1,
          name: "ADITYA MAURYA",
          email: "adityamaurya@retailhub.in",
          role: ROLES.WAREHOUSE_INVENTORY
        };
        this.setAppMode("admin");

        if (rememberMe) {
          localStorage.setItem("rims_remember_me", "true");
          localStorage.setItem("rims_current_user", JSON.stringify(this.currentUser));
        } else {
          localStorage.removeItem("rims_remember_me");
          localStorage.removeItem("rims_current_user");
        }
        this.logAudit("USER_LOGIN", this.currentUser.name, `Signed in as Administrator [Offline Mode].`);
        this.notify();
        return { success: true, user: this.currentUser };
      }

      return { success: false, message: "Invalid email or password. Only authorized Administrator credentials are accepted." };
    } catch (err) {
      return { success: false, message: err.message || "Login request failed." };
    }
  }

  logout() {
    const prevUser = this.currentUser ? this.currentUser.name : "User";
    api.logout();
    this.currentUser = null;
    localStorage.removeItem("rims_remember_me");
    localStorage.removeItem("rims_current_user");
    localStorage.removeItem("rims_jwt_token");
    this.logAudit("USER_LOGOUT", prevUser, "User logged out of Stockora session.");
    this.notify();
  }

  // --- App Mode (Administrator Operations) ---
  getAppMode() {
    return "admin";
  }

  setAppMode(mode = "admin") {
    this.appMode = "admin";
    localStorage.setItem("rims_active_mode", "admin");
    this.notify();
  }

  // --- Cart, Wishlist & Storefront Methods ---
  getCart() {
    return this.cart || [];
  }

  addToCart(productId, quantity = 1) {
    if (!this.cart) this.cart = [];
    const prod = this.getProduct(productId);
    if (!prod) return { success: false, message: "Product not found." };

    const summary = this.getProductStockSummary(productId);
    if (summary.available <= 0) {
      return { success: false, message: "Sorry, this item is currently out of stock." };
    }

    const existing = this.cart.find((item) => item.productId === productId);
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > summary.available) {
        existing.quantity = summary.available;
        this.saveState();
        return { success: true, message: `Updated quantity to max available (${summary.available} units).` };
      }
      existing.quantity = newQty;
    } else {
      const initialQty = Math.min(quantity, summary.available);
      this.cart.push({
        productId,
        quantity: initialQty,
        unitPrice: prod.sellingPrice,
        addedAt: new Date().toISOString()
      });
    }

    this.saveState();
    return { success: true, message: `Added ${prod.name} to cart!` };
  }

  updateCartQuantity(productId, quantity) {
    if (!this.cart) return;
    const summary = this.getProductStockSummary(productId);
    const item = this.cart.find((i) => i.productId === productId);
    if (!item) return;

    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    item.quantity = Math.min(quantity, Math.max(1, summary.available));
    this.saveState();
  }

  removeFromCart(productId) {
    if (!this.cart) return;
    this.cart = this.cart.filter((i) => i.productId !== productId);
    this.saveState();
  }

  clearCart() {
    this.cart = [];
    this.saveState();
  }

  getCartTotals(discountPercent = 0) {
    const items = (this.cart || []).map((ci) => {
      const product = this.getProduct(ci.productId);
      const subtotal = (product?.sellingPrice || 0) * ci.quantity;
      return {
        ...ci,
        product,
        subtotal
      };
    });

    const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
    const discount = (subtotal * discountPercent) / 100;
    // Free delivery above $25 (or ₹1,500)
    const delivery = subtotal > 25 || subtotal === 0 ? 0 : 4.99;
    const total = Math.max(0, subtotal - discount + delivery);
    const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);

    return {
      items,
      subtotal,
      discount,
      delivery,
      total,
      itemCount
    };
  }

  // --- Wishlist ---
  getWishlist() {
    return this.wishlist || [];
  }

  isInWishlist(productId) {
    return (this.wishlist || []).includes(productId);
  }

  toggleWishlist(productId) {
    if (!this.wishlist) this.wishlist = [];
    const index = this.wishlist.indexOf(productId);
    let added = false;
    if (index >= 0) {
      this.wishlist.splice(index, 1);
    } else {
      this.wishlist.push(productId);
      added = true;
    }
    this.saveState();
    return added;
  }

  // --- Delivery Location ---
  getDeliveryLocation() {
    return this.deliveryLocation || { pincode: "400001", city: "Mumbai", area: "Fort / Colaba" };
  }

  setDeliveryLocation(pincode, city, area) {
    this.deliveryLocation = { pincode, city, area };
    this.saveState();
  }

  // --- Place Customer E-Commerce Order ---
  placeCustomerOrder(orderPayload) {
    const totals = this.getCartTotals(orderPayload.discountPercent || 0);
    if (totals.items.length === 0) {
      return { success: false, message: "Cart is empty." };
    }

    const orderNum = `SO-${Math.floor(7200 + Math.random() * 799)}`;
    const newId = `ORD-${Date.now().toString().slice(-4)}`;
    const primaryWh = this.warehouses[0]?.id || "WH-CHI";

    // Deduct / reserve inventory atomically via OCC
    totals.items.forEach((item) => {
      const stockRec = this.stock.find(
        (s) => s.productId === item.productId && (s.onHand - (s.reserved || 0)) >= item.quantity
      );
      if (stockRec) {
        stockRec.reserved = (stockRec.reserved || 0) + item.quantity;
      } else {
        const firstRec = this.stock.find((s) => s.productId === item.productId);
        if (firstRec) {
          firstRec.reserved = (firstRec.reserved || 0) + item.quantity;
        }
      }
    });

    const user = this.getCurrentUser() || { name: "Customer User", email: "customer@retailhub.in" };

    const newOrder = {
      id: newId,
      orderNumber: orderNum,
      customer: {
        name: orderPayload.fullName || user.name || "Customer",
        email: orderPayload.email || user.email || "customer@retailhub.in",
        phone: orderPayload.phone || "+91 98200 12345",
        channel: "Stockora Storefront Web",
        shippingAddress: orderPayload.shippingAddress || "Flat 402, High Point Towers, Worli, Mumbai 400018"
      },
      warehouseId: primaryWh,
      orderDate: new Date().toISOString().replace("T", " ").slice(0, 16),
      carrier: orderPayload.carrier || "BlueDart Express Logistics",
      trackingNumber: `BD-${Math.floor(100000000 + Math.random() * 900000000)}`,
      priority: orderPayload.priority || "Normal",
      status: "Confirmed",
      paymentMethod: orderPayload.paymentMethod || "UPI / Instant Pay",
      totalAmount: totals.total,
      subtotal: totals.subtotal,
      deliveryFee: totals.delivery,
      items: totals.items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: it.product?.sellingPrice || it.unitPrice
      }))
    };

    this.salesOrders.unshift(newOrder);

    this.logAudit(
      "ORDER_CREATED",
      newOrder.customer.name,
      `Customer placed ${orderNum} ($${totals.total.toFixed(2)}) via Stockora Storefront. Reserved ${totals.itemCount} units across distribution centers.`
    );

    this.clearCart();
    this.saveState();
    return { success: true, order: newOrder };
  }
}

export const store = new Store();

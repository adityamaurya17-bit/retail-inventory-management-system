// Seed data for Retail Inventory Management System (Agile Capstone Case Study)
export const initialProducts = [
  {
    id: "PROD-1001",
    sku: "ELEC-ANC-001",
    barcode: "8901234567890",
    name: "AuraPro ANC Wireless Headphones",
    category: "Electronics",
    brand: "AuraSound",
    costPrice: 74.50,
    sellingPrice: 179.99,
    reorderPoint: 40,
    maxStock: 250,
    unit: "Units",
    weightKg: 0.35,
    dimensions: "18 x 16 x 8 cm",
    status: "Active",
    description: "Hybrid Active Noise Cancellation with 40mm beryllium drivers and 38-hour battery life.",
    primarySupplierId: "SUP-001",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "PROD-1002",
    sku: "ELEC-KB-002",
    barcode: "8901234567891",
    name: "Vortex Pro RGB Mechanical Keyboard",
    category: "Electronics",
    brand: "VortexTech",
    costPrice: 42.00,
    sellingPrice: 119.50,
    reorderPoint: 30,
    maxStock: 200,
    unit: "Units",
    weightKg: 0.95,
    dimensions: "35 x 12 x 4 cm",
    status: "Active",
    description: "Hot-swappable tactile mechanical switches with per-key RGB backlighting and aluminum chassis.",
    primarySupplierId: "SUP-001",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "PROD-1003",
    sku: "ELEC-MST-003",
    barcode: "8901234567892",
    name: "PrecisionTrack Ergonomic Laser Mouse",
    category: "Electronics",
    brand: "AuraSound",
    costPrice: 22.00,
    sellingPrice: 69.99,
    reorderPoint: 50,
    maxStock: 300,
    unit: "Units",
    weightKg: 0.12,
    dimensions: "12 x 7 x 4 cm",
    status: "Active",
    description: "Ergonomic 4000 DPI multi-surface laser sensor with dual wireless Bluetooth & 2.4GHz connectivity.",
    primarySupplierId: "SUP-001",
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "PROD-1004",
    sku: "FASH-JKT-004",
    barcode: "8901234567893",
    name: "Alpine Thermal All-Weather Parka",
    category: "Apparel",
    brand: "NordicTrail",
    costPrice: 65.00,
    sellingPrice: 195.00,
    reorderPoint: 25,
    maxStock: 150,
    unit: "Units",
    weightKg: 1.20,
    dimensions: "40 x 30 x 10 cm",
    status: "Active",
    description: "Waterproof breathable DWR outer shell with 700-fill goose down insulation and taped seams.",
    primarySupplierId: "SUP-002",
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "PROD-1005",
    sku: "FASH-TEE-005",
    barcode: "8901234567894",
    name: "Organic Combed Cotton Crewneck Tee",
    category: "Apparel",
    brand: "NordicTrail",
    costPrice: 8.50,
    sellingPrice: 28.00,
    reorderPoint: 100,
    maxStock: 500,
    unit: "Units",
    weightKg: 0.18,
    dimensions: "25 x 20 x 2 cm",
    status: "Active",
    description: "100% GOTS certified organic ringspun cotton, pre-shrunk with reinforced rib collar.",
    primarySupplierId: "SUP-002",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "PROD-1006",
    sku: "HOME-DSK-006",
    barcode: "8901234567895",
    name: "Apex Dual-Motor Electric Standing Desk",
    category: "Home & Furniture",
    brand: "TitanErgo",
    costPrice: 180.00,
    sellingPrice: 449.00,
    reorderPoint: 15,
    maxStock: 80,
    unit: "Units",
    weightKg: 28.50,
    dimensions: "140 x 70 x 15 cm",
    status: "Active",
    description: "Solid bamboo desktop with dual synchronized silent motors, anti-collision sensor and memory presets.",
    primarySupplierId: "SUP-003",
    imageUrl: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "PROD-1007",
    sku: "HOME-CHR-007",
    barcode: "8901234567896",
    name: "ErgoMesh Executive Task Chair",
    category: "Home & Furniture",
    brand: "TitanErgo",
    costPrice: 95.00,
    sellingPrice: 269.00,
    reorderPoint: 20,
    maxStock: 100,
    unit: "Units",
    weightKg: 14.00,
    dimensions: "65 x 65 x 40 cm",
    status: "Active",
    description: "Dynamic lumbar support with breathable elastomeric mesh backrest and 4D adjustable armrests.",
    primarySupplierId: "SUP-003",
    imageUrl: "https://images.unsplash.com/photo-1580481077114-1e0e8e9b0c53?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "PROD-1008",
    sku: "FOOD-CFE-008",
    barcode: "8901234567897",
    name: "Highland Single-Origin Arabica Beans (1kg)",
    category: "Grocery & Gourmet",
    brand: "TerraOrganics",
    costPrice: 11.20,
    sellingPrice: 26.50,
    reorderPoint: 60,
    maxStock: 350,
    unit: "Packs",
    weightKg: 1.05,
    dimensions: "28 x 14 x 8 cm",
    status: "Active",
    description: "Fair-trade specialty grade whole bean coffee roasted in small batches with notes of cocoa and jasmine.",
    primarySupplierId: "SUP-004",
    imageUrl: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "PROD-1009",
    sku: "TECH-HUB-009",
    barcode: "8901234567898",
    name: "QuantumSmart IoT Zigbee Gateway",
    category: "Electronics",
    brand: "QuantumSense",
    costPrice: 28.00,
    sellingPrice: 79.99,
    reorderPoint: 35,
    maxStock: 180,
    unit: "Units",
    weightKg: 0.22,
    dimensions: "10 x 10 x 3 cm",
    status: "Active",
    description: "Universal smart home automation bridge supporting Zigbee 3.0, Matter, and HomeKit protocols.",
    primarySupplierId: "SUP-005",
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "PROD-1010",
    sku: "SPRT-MAT-010",
    barcode: "8901234567899",
    name: "ProGrip High-Density Non-Slip Yoga Mat",
    category: "Sports & Fitness",
    brand: "VanguardSport",
    costPrice: 14.50,
    sellingPrice: 48.00,
    reorderPoint: 45,
    maxStock: 220,
    unit: "Units",
    weightKg: 1.80,
    dimensions: "68 x 12 x 12 cm",
    status: "Active",
    description: "Eco-friendly natural tree rubber base with moisture-wicking polyurethane topcoat, 5mm cushion.",
    primarySupplierId: "SUP-006",
    imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "PROD-1011",
    sku: "SPRT-DBL-011",
    barcode: "8901234567800",
    name: "QuickSelect Adjustable Dumbbell Pair (50lb)",
    category: "Sports & Fitness",
    brand: "VanguardSport",
    costPrice: 110.00,
    sellingPrice: 299.00,
    reorderPoint: 15,
    maxStock: 75,
    unit: "Sets",
    weightKg: 46.00,
    dimensions: "45 x 25 x 25 cm",
    status: "Active",
    description: "Patented dial selection mechanism adjusts from 5 to 50 lbs in 5-lb increments. Heavy steel plates.",
    primarySupplierId: "SUP-006",
    imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "PROD-1012",
    sku: "ELEC-WTC-012",
    barcode: "8901234567801",
    name: "PulseFit GPS Rugged Smartwatch",
    category: "Electronics",
    brand: "QuantumSense",
    costPrice: 78.00,
    sellingPrice: 219.00,
    reorderPoint: 30,
    maxStock: 160,
    unit: "Units",
    weightKg: 0.06,
    dimensions: "5 x 5 x 1.4 cm",
    status: "Active",
    description: "Sapphire glass AMOLED display, dual-band GPS tracking, ECG and blood oxygen saturation monitoring.",
    primarySupplierId: "SUP-005",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80"
  }
];

export const initialWarehouses = [
  {
    id: "WH-CHI",
    code: "ORD-HUB-01",
    name: "Central Distribution Hub",
    city: "Chicago",
    state: "IL",
    address: "4400 S Pulaski Rd, Chicago, IL 60632",
    type: "Central Distribution Center",
    capacity: 85000,
    manager: "Marcus Vance",
    contactEmail: "mvance@rims-central.com",
    zones: [
      { id: "ZONE-A", name: "Zone A: High Velocity & Fast Movers", bins: ["A-01-01", "A-01-02", "A-02-01", "A-02-02"] },
      { id: "ZONE-B", name: "Zone B: Bulk Pallet & Storage", bins: ["B-01-01", "B-01-02", "B-02-01", "B-03-01"] },
      { id: "ZONE-C", name: "Zone C: High-Value Electronics (Secured)", bins: ["C-01-01", "C-01-02", "C-02-01"] },
      { id: "ZONE-D", name: "Zone D: Returns & Quality Quarantine", bins: ["D-01-01", "D-01-02"] }
    ]
  },
  {
    id: "WH-LAX",
    code: "LAX-FUL-02",
    name: "West Coast Fulfillment Center",
    city: "Ontario",
    state: "CA",
    address: "2150 E Airport Dr, Ontario, CA 91761",
    type: "Regional Fulfillment Center",
    capacity: 60000,
    manager: "Elena Rostova",
    contactEmail: "erostova@rims-west.com",
    zones: [
      { id: "ZONE-A", name: "Zone A: High-Velocity E-Com Pick", bins: ["A-01-01", "A-01-02", "A-02-01"] },
      { id: "ZONE-B", name: "Zone B: Bulk Storage & Overflow", bins: ["B-01-01", "B-02-01"] },
      { id: "ZONE-C", name: "Zone C: Electronics & Gadgets", bins: ["C-01-01", "C-02-01"] }
    ]
  },
  {
    id: "WH-EWR",
    code: "EWR-LOG-03",
    name: "East Coast Logistics Park",
    city: "Newark",
    state: "NJ",
    address: "100 Port St, Newark, NJ 07114",
    type: "Regional Fulfillment Center",
    capacity: 55000,
    manager: "David Chen",
    contactEmail: "dchen@rims-east.com",
    zones: [
      { id: "ZONE-A", name: "Zone A: Fast Moving Retail", bins: ["A-01-01", "A-01-02", "A-02-01"] },
      { id: "ZONE-B", name: "Zone B: Pallet Racking", bins: ["B-01-01", "B-02-01"] },
      { id: "ZONE-D", name: "Zone D: Reverse Logistics Dock", bins: ["D-01-01"] }
    ]
  },
  {
    id: "WH-DFW",
    code: "DFW-DEP-04",
    name: "South-Central Fulfillment Depot",
    city: "Dallas",
    state: "TX",
    address: "8800 Ambassador Row, Dallas, TX 75247",
    type: "Rapid Depot & B2B Hub",
    capacity: 45000,
    manager: "Sarah Jenkins",
    contactEmail: "sjenkins@rims-south.com",
    zones: [
      { id: "ZONE-A", name: "Zone A: Express Pick Waves", bins: ["A-01-01", "A-02-01"] },
      { id: "ZONE-B", name: "Zone B: High-Density Stacking", bins: ["B-01-01", "B-02-01"] }
    ]
  }
];

export const initialStock = [
  // PROD-1001: AuraPro ANC
  { id: "STK-101", productId: "PROD-1001", warehouseId: "WH-CHI", bin: "C-01-01", onHand: 85, reserved: 12, batch: "LOT-2026-A1" },
  { id: "STK-102", productId: "PROD-1001", warehouseId: "WH-LAX", bin: "C-01-01", onHand: 42, reserved: 8, batch: "LOT-2026-A1" },
  { id: "STK-103", productId: "PROD-1001", warehouseId: "WH-EWR", bin: "A-01-01", onHand: 28, reserved: 5, batch: "LOT-2026-A2" },
  { id: "STK-104", productId: "PROD-1001", warehouseId: "WH-DFW", bin: "A-01-01", onHand: 14, reserved: 2, batch: "LOT-2026-A2" },

  // PROD-1002: Vortex Mechanical Keyboard
  { id: "STK-105", productId: "PROD-1002", warehouseId: "WH-CHI", bin: "C-02-01", onHand: 95, reserved: 15, batch: "LOT-2026-B1" },
  { id: "STK-106", productId: "PROD-1002", warehouseId: "WH-LAX", bin: "C-02-01", onHand: 60, reserved: 10, batch: "LOT-2026-B1" },
  { id: "STK-107", productId: "PROD-1002", warehouseId: "WH-EWR", bin: "A-02-01", onHand: 18, reserved: 4, batch: "LOT-2026-B2" },
  { id: "STK-108", productId: "PROD-1002", warehouseId: "WH-DFW", bin: "A-02-01", onHand: 25, reserved: 3, batch: "LOT-2026-B2" },

  // PROD-1003: PrecisionTrack Laser Mouse
  { id: "STK-109", productId: "PROD-1003", warehouseId: "WH-CHI", bin: "A-01-01", onHand: 140, reserved: 22, batch: "LOT-2026-C1" },
  { id: "STK-110", productId: "PROD-1003", warehouseId: "WH-LAX", bin: "A-01-01", onHand: 80, reserved: 12, batch: "LOT-2026-C1" },
  { id: "STK-111", productId: "PROD-1003", warehouseId: "WH-EWR", bin: "A-01-02", onHand: 45, reserved: 8, batch: "LOT-2026-C2" },

  // PROD-1004: Alpine Thermal Parka
  { id: "STK-112", productId: "PROD-1004", warehouseId: "WH-CHI", bin: "B-01-01", onHand: 40, reserved: 6, batch: "LOT-2026-D1" },
  { id: "STK-113", productId: "PROD-1004", warehouseId: "WH-LAX", bin: "B-01-01", onHand: 18, reserved: 2, batch: "LOT-2026-D1" },
  { id: "STK-114", productId: "PROD-1004", warehouseId: "WH-EWR", bin: "B-01-01", onHand: 55, reserved: 14, batch: "LOT-2026-D2" },

  // PROD-1005: Organic Cotton Tee
  { id: "STK-115", productId: "PROD-1005", warehouseId: "WH-CHI", bin: "A-02-01", onHand: 280, reserved: 35, batch: "LOT-2026-E1" },
  { id: "STK-116", productId: "PROD-1005", warehouseId: "WH-LAX", bin: "A-02-01", onHand: 160, reserved: 20, batch: "LOT-2026-E1" },
  { id: "STK-117", productId: "PROD-1005", warehouseId: "WH-DFW", bin: "A-01-01", onHand: 90, reserved: 10, batch: "LOT-2026-E2" },

  // PROD-1006: Apex Standing Desk
  { id: "STK-118", productId: "PROD-1006", warehouseId: "WH-CHI", bin: "B-02-01", onHand: 24, reserved: 5, batch: "LOT-2026-F1" },
  { id: "STK-119", productId: "PROD-1006", warehouseId: "WH-LAX", bin: "B-02-01", onHand: 12, reserved: 2, batch: "LOT-2026-F1" },
  { id: "STK-120", productId: "PROD-1006", warehouseId: "WH-EWR", bin: "B-02-01", onHand: 15, reserved: 3, batch: "LOT-2026-F1" },

  // PROD-1007: ErgoMesh Chair
  { id: "STK-121", productId: "PROD-1007", warehouseId: "WH-CHI", bin: "B-03-01", onHand: 35, reserved: 7, batch: "LOT-2026-G1" },
  { id: "STK-122", productId: "PROD-1007", warehouseId: "WH-LAX", bin: "B-02-01", onHand: 20, reserved: 4, batch: "LOT-2026-G1" },

  // PROD-1008: Highland Single-Origin Coffee
  { id: "STK-123", productId: "PROD-1008", warehouseId: "WH-CHI", bin: "A-01-02", onHand: 180, reserved: 30, batch: "LOT-2026-H1" },
  { id: "STK-124", productId: "PROD-1008", warehouseId: "WH-DFW", bin: "A-02-01", onHand: 85, reserved: 15, batch: "LOT-2026-H1" },

  // PROD-1009: Smart IoT Gateway
  { id: "STK-125", productId: "PROD-1009", warehouseId: "WH-CHI", bin: "C-01-02", onHand: 65, reserved: 10, batch: "LOT-2026-I1" },
  { id: "STK-126", productId: "PROD-1009", warehouseId: "WH-LAX", bin: "C-01-01", onHand: 30, reserved: 4, batch: "LOT-2026-I1" },

  // PROD-1010: ProGrip Yoga Mat
  { id: "STK-127", productId: "PROD-1010", warehouseId: "WH-CHI", bin: "A-02-02", onHand: 95, reserved: 12, batch: "LOT-2026-J1" },
  { id: "STK-128", productId: "PROD-1010", warehouseId: "WH-LAX", bin: "A-01-02", onHand: 60, reserved: 8, batch: "LOT-2026-J1" },

  // PROD-1011: Adjustable Dumbbells
  { id: "STK-129", productId: "PROD-1011", warehouseId: "WH-CHI", bin: "B-01-02", onHand: 18, reserved: 4, batch: "LOT-2026-K1" },
  { id: "STK-130", productId: "PROD-1011", warehouseId: "WH-DFW", bin: "B-01-01", onHand: 12, reserved: 2, batch: "LOT-2026-K1" },

  // PROD-1012: PulseFit Smartwatch (Low stock alert test scenario)
  { id: "STK-131", productId: "PROD-1012", warehouseId: "WH-CHI", bin: "C-01-01", onHand: 14, reserved: 5, batch: "LOT-2026-L1" },
  { id: "STK-132", productId: "PROD-1012", warehouseId: "WH-LAX", bin: "C-01-01", onHand: 8, reserved: 2, batch: "LOT-2026-L1" },
  { id: "STK-133", productId: "PROD-1012", warehouseId: "WH-EWR", bin: "A-01-01", onHand: 5, reserved: 1, batch: "LOT-2026-L2" }
];

export const initialSuppliers = [
  {
    id: "SUP-001",
    code: "VEND-APEX",
    name: "Apex Silicon Dynamics Corp",
    category: "Electronics & Peripherals",
    contactName: "Arthur King",
    email: "procurement@apexsilicon.com",
    phone: "+1 (408) 555-0192",
    city: "San Jose, CA",
    leadTimeDays: 10,
    paymentTerms: "Net 30",
    reliabilityRating: 98.4,
    activeContracts: 4,
    status: "Preferred"
  },
  {
    id: "SUP-002",
    code: "VEND-NORD",
    name: "Nordic Textile Mills LLC",
    category: "Apparel & Fabrics",
    contactName: "Freja Lindholm",
    email: "orders@nordictextiles.com",
    phone: "+1 (503) 555-8321",
    city: "Portland, OR",
    leadTimeDays: 14,
    paymentTerms: "Net 45",
    reliabilityRating: 96.2,
    activeContracts: 3,
    status: "Active"
  },
  {
    id: "SUP-003",
    code: "VEND-TITAN",
    name: "Titan Ergonomics Industrial",
    category: "Home & Furniture",
    contactName: "Gabriel Ramos",
    email: "commercial@titanergo.com",
    phone: "+1 (512) 555-7744",
    city: "Austin, TX",
    leadTimeDays: 8,
    paymentTerms: "Net 30",
    reliabilityRating: 99.1,
    activeContracts: 5,
    status: "Preferred"
  },
  {
    id: "SUP-004",
    code: "VEND-TERRA",
    name: "Terra Organics Global Supply",
    category: "Grocery & Gourmet",
    contactName: "Maya Patel",
    email: "supply@terraorganics.com",
    phone: "+1 (303) 555-9011",
    city: "Denver, CO",
    leadTimeDays: 5,
    paymentTerms: "Net 15",
    reliabilityRating: 97.8,
    activeContracts: 2,
    status: "Active"
  },
  {
    id: "SUP-005",
    code: "VEND-QUANT",
    name: "Quantum Precision Sensors Ltd",
    category: "IoT & Smart Tech",
    contactName: "Julian Vance",
    email: "b2b@quantumsensors.io",
    phone: "+1 (617) 555-3298",
    city: "Boston, MA",
    leadTimeDays: 15,
    paymentTerms: "Net 60",
    reliabilityRating: 94.5,
    activeContracts: 2,
    status: "Active"
  },
  {
    id: "SUP-006",
    code: "VEND-VANG",
    name: "Vanguard Sportswear Worldwide",
    category: "Sports & Fitness",
    contactName: "Chloe Sterling",
    email: "distribution@vanguardsport.com",
    phone: "+1 (704) 555-6623",
    city: "Charlotte, NC",
    leadTimeDays: 12,
    paymentTerms: "Net 30",
    reliabilityRating: 95.8,
    activeContracts: 3,
    status: "Active"
  }
];

export const initialPurchaseOrders = [
  {
    id: "PO-2026-001",
    poNumber: "PO-88201",
    supplierId: "SUP-001",
    warehouseId: "WH-CHI",
    orderDate: "2026-09-18",
    expectedDate: "2026-10-02",
    status: "Partially Received",
    paymentTerms: "Net 30",
    totalAmount: 11175.00,
    items: [
      { productId: "PROD-1001", quantity: 100, unitCost: 74.50, receivedQty: 50 },
      { productId: "PROD-1002", quantity: 50, unitCost: 42.00, receivedQty: 50 },
      { productId: "PROD-1003", quantity: 75, unitCost: 22.00, receivedQty: 0 }
    ],
    notes: "Priority air freight. Partial shipment received at Chicago Receiving Bay 2."
  },
  {
    id: "PO-2026-002",
    poNumber: "PO-88202",
    supplierId: "SUP-005",
    warehouseId: "WH-CHI",
    orderDate: "2026-09-22",
    expectedDate: "2026-10-08",
    status: "Sent to Vendor",
    paymentTerms: "Net 60",
    totalAmount: 6240.00,
    items: [
      { productId: "PROD-1012", quantity: 80, unitCost: 78.00, receivedQty: 0 }
    ],
    notes: "Urgent replenishment for low stock alert on PulseFit GPS Smartwatch."
  },
  {
    id: "PO-2026-003",
    poNumber: "PO-88203",
    supplierId: "SUP-003",
    warehouseId: "WH-LAX",
    orderDate: "2026-09-15",
    expectedDate: "2026-09-26",
    status: "Received",
    paymentTerms: "Net 30",
    totalAmount: 9000.00,
    items: [
      { productId: "PROD-1006", quantity: 30, unitCost: 180.00, receivedQty: 30 },
      { productId: "PROD-1007", quantity: 35, unitCost: 95.00, receivedQty: 35 }
    ],
    notes: "Completed GRN-4019. Stock ingested into Ontario Zone B."
  },
  {
    id: "PO-2026-004",
    poNumber: "PO-88204",
    supplierId: "SUP-002",
    warehouseId: "WH-EWR",
    orderDate: "2026-09-25",
    expectedDate: "2026-10-10",
    status: "Approved",
    paymentTerms: "Net 45",
    totalAmount: 5175.00,
    items: [
      { productId: "PROD-1004", quantity: 50, unitCost: 65.00, receivedQty: 0 },
      { productId: "PROD-1005", quantity: 225, unitCost: 8.50, receivedQty: 0 }
    ],
    notes: "Winter catalog seasonal prep. Signed off by Procurement Director."
  },
  {
    id: "PO-2026-005",
    poNumber: "PO-88205",
    supplierId: "SUP-004",
    warehouseId: "WH-CHI",
    orderDate: "2026-09-27",
    expectedDate: "2026-10-04",
    status: "Draft",
    paymentTerms: "Net 15",
    totalAmount: 2240.00,
    items: [
      { productId: "PROD-1008", quantity: 200, unitCost: 11.20, receivedQty: 0 }
    ],
    notes: "Reorder point threshold breached in Chicago. Awaiting manager approval."
  }
];

export const initialSalesOrders = [
  {
    id: "ORD-7001",
    orderNumber: "SO-7001",
    customer: {
      name: "Nexus Digital Agency",
      email: "procurement@nexusagency.com",
      channel: "B2B Wholesale",
      shippingAddress: "250 W 57th St, New York, NY 10107"
    },
    warehouseId: "WH-EWR",
    orderDate: "2026-09-28 09:15",
    carrier: "FedEx Ground",
    trackingNumber: "FXG-902918239",
    priority: "Normal",
    status: "Packed",
    totalAmount: 899.95,
    items: [
      { productId: "PROD-1001", quantity: 3, unitPrice: 179.99 },
      { productId: "PROD-1002", quantity: 2, unitPrice: 119.50 },
      { productId: "PROD-1003", quantity: 1, unitPrice: 69.99 }
    ]
  },
  {
    id: "ORD-7002",
    orderNumber: "SO-7002",
    customer: {
      name: "Dr. Evelyn Reed",
      email: "evelyn.reed@medcenter.org",
      channel: "E-Commerce Direct",
      shippingAddress: "742 Evergreen Terrace, Chicago, IL 60611"
    },
    warehouseId: "WH-CHI",
    orderDate: "2026-09-28 10:45",
    carrier: "UPS Next Day Air",
    trackingNumber: "1Z9999999999999999",
    priority: "High",
    status: "Wave Picking",
    totalAmount: 718.00,
    items: [
      { productId: "PROD-1006", quantity: 1, unitPrice: 449.00 },
      { productId: "PROD-1007", quantity: 1, unitPrice: 269.00 }
    ]
  },
  {
    id: "ORD-7003",
    orderNumber: "SO-7003",
    customer: {
      name: "Summit Fitness Studio",
      email: "ops@summitfitness.la",
      channel: "B2B Wholesale",
      shippingAddress: "1200 S Grand Ave, Los Angeles, CA 90015"
    },
    warehouseId: "WH-LAX",
    orderDate: "2026-09-27 16:30",
    carrier: "DHL Freight",
    trackingNumber: "DHL-481902847",
    priority: "Normal",
    status: "Dispatched",
    totalAmount: 1484.00,
    items: [
      { productId: "PROD-1010", quantity: 10, unitPrice: 48.00 },
      { productId: "PROD-1011", quantity: 2, unitPrice: 299.00 },
      { productId: "PROD-1012", quantity: 2, unitPrice: 219.00 }
    ]
  },
  {
    id: "ORD-7004",
    orderNumber: "SO-7004",
    customer: {
      name: "Liam O'Connor",
      email: "liam.oc@gmail.com",
      channel: "Mobile App Store",
      shippingAddress: "320 Congress Ave, Austin, TX 78701"
    },
    warehouseId: "WH-DFW",
    orderDate: "2026-09-28 11:20",
    carrier: "USPS Priority",
    trackingNumber: "Pending",
    priority: "Normal",
    status: "Pending Allocation",
    totalAmount: 236.49,
    items: [
      { productId: "PROD-1001", quantity: 1, unitPrice: 179.99 },
      { productId: "PROD-1005", quantity: 2, unitPrice: 28.00 }
    ]
  },
  {
    id: "ORD-7005",
    orderNumber: "SO-7005",
    customer: {
      name: "Kylie Minogue",
      email: "kylie@soundwave.io",
      channel: "E-Commerce Direct",
      shippingAddress: "500 Howard St, San Francisco, CA 94105"
    },
    warehouseId: "WH-LAX",
    orderDate: "2026-09-26 14:00",
    carrier: "FedEx 2Day",
    trackingNumber: "FX-889920192",
    priority: "Normal",
    status: "Delivered",
    totalAmount: 359.98,
    items: [
      { productId: "PROD-1001", quantity: 2, unitPrice: 179.99 }
    ]
  },
  {
    id: "ORD-7006",
    orderNumber: "SO-7006",
    customer: {
      name: "Roast & Grind Roastery",
      email: "beans@roastandgrind.com",
      channel: "Retail POS Storefront",
      shippingAddress: "1440 W Randolph St, Chicago, IL 60607"
    },
    warehouseId: "WH-CHI",
    orderDate: "2026-09-28 12:00",
    carrier: "Courier Local Express",
    trackingNumber: "LOC-CHI-110",
    priority: "High",
    status: "Wave Picking",
    totalAmount: 530.00,
    items: [
      { productId: "PROD-1008", quantity: 20, unitPrice: 26.50 }
    ]
  }
];

export const initialStockTransfers = [
  {
    id: "TRF-901",
    transferNumber: "TO-2026-01",
    fromWarehouseId: "WH-CHI",
    toWarehouseId: "WH-LAX",
    date: "2026-09-26",
    status: "In-Transit",
    carrier: "Schneider National Logistics",
    trackingNumber: "SCH-9812401",
    eta: "2026-09-30",
    reason: "Balancing West Coast stock for upcoming promotional surge",
    items: [
      { productId: "PROD-1001", quantity: 25 },
      { productId: "PROD-1002", quantity: 20 }
    ]
  },
  {
    id: "TRF-902",
    transferNumber: "TO-2026-02",
    fromWarehouseId: "WH-CHI",
    toWarehouseId: "WH-DFW",
    date: "2026-09-24",
    status: "Completed",
    carrier: "Old Dominion Freight",
    trackingNumber: "ODFL-7718290",
    eta: "2026-09-27",
    reason: "Depot initial stocking replenishment",
    items: [
      { productId: "PROD-1005", quantity: 80 },
      { productId: "PROD-1008", quantity: 40 }
    ]
  },
  {
    id: "TRF-903",
    transferNumber: "TO-2026-03",
    fromWarehouseId: "WH-LAX",
    toWarehouseId: "WH-EWR",
    date: "2026-09-27",
    status: "In-Transit",
    carrier: "FedEx Freight Cross-Country",
    trackingNumber: "FXF-3382910",
    eta: "2026-10-02",
    reason: "East coast e-commerce regional stock optimization",
    items: [
      { productId: "PROD-1009", quantity: 15 },
      { productId: "PROD-1010", quantity: 25 }
    ]
  },
  {
    id: "TRF-904",
    transferNumber: "TO-2026-04",
    fromWarehouseId: "WH-CHI",
    toWarehouseId: "WH-EWR",
    date: "2026-09-28",
    status: "Draft",
    carrier: "TBD",
    trackingNumber: "Pending",
    eta: "2026-10-05",
    reason: "Winter jacket reallocation before cold front",
    items: [
      { productId: "PROD-1004", quantity: 15 }
    ]
  }
];

export const initialAuditLogs = [
  {
    id: "LOG-5001",
    timestamp: "2026-09-28 12:45:10",
    action: "STOCK_RESERVED",
    user: "AutoFulfillmentBot",
    details: "Reserved 1x ELEC-ANC-001 & 2x FASH-TEE-005 for order SO-7004 at WH-DFW."
  },
  {
    id: "LOG-5002",
    timestamp: "2026-09-28 11:30:22",
    action: "GRN_RECEIVED",
    user: "Marcus Vance (WH Manager)",
    details: "Dock receipt confirmed for PO-88201. Added 50x ELEC-ANC-001 & 50x ELEC-KB-002 to WH-CHI."
  },
  {
    id: "LOG-5003",
    timestamp: "2026-09-28 10:15:00",
    action: "ORDER_STATUS_CHANGE",
    user: "Elena Rostova",
    details: "Order SO-7003 transitioned from Packed to Dispatched via DHL Freight."
  },
  {
    id: "LOG-5004",
    timestamp: "2026-09-28 09:00:15",
    action: "TRANSFER_DISPATCHED",
    user: "Logistics Coordinator",
    details: "Transfer TO-2026-03 dispatched 40 units from WH-LAX to WH-EWR."
  },
  {
    id: "LOG-5005",
    timestamp: "2026-09-27 17:20:44",
    action: "CYCLE_COUNT_ADJUSTMENT",
    user: "David Chen (East Coast Hub)",
    details: "Cycle count adjustment on ELEC-KB-002: +2 units reconciled (Bin A-02-01)."
  }
];

// 8 EPICS AND 15 SPRINTS AGILE CAPSTONE CASE STUDY DATA
export const agileCaseStudy = {
  projectTitle: "Retail Inventory Management System (RIMS)",
  framework: "Scrum / Agile 2-Week Sprints",
  totalEpics: 8,
  totalSprints: 15,
  totalStoryPoints: 185,
  velocityAvg: 12.33,
  teamComposition: [
    { role: "Scrum Master", name: "Samantha Briggs, CSM", allocation: "100%" },
    { role: "Product Owner", name: "David Sterling, CSPO", allocation: "100%" },
    { role: "Tech Lead & Cloud Architect", name: "Kavita Sharma", allocation: "100%" },
    { role: "Senior Full-Stack Engineers", count: 3, allocation: "100%" },
    { role: "QA Automation Engineer", count: 1, allocation: "100%" },
    { role: "DevOps & SRE Specialist", count: 1, allocation: "50%" }
  ],
  epics: [
    {
      id: "EP-01",
      code: "EPIC-1",
      title: "Product Information Management (PIM) & Unified Catalog",
      description: "Establish centralized product catalog with SKU generation, barcode standards, cost/pricing calculations, category hierarchies, and rich product attributes.",
      businessValue: "Eliminates SKU duplication, streamlines multi-channel consistency, and provides single source of truth for 10,000+ retail SKUs.",
      totalStoryPoints: 25,
      status: "Done",
      sprintsInvolved: [1, 2],
      leadRole: "Full-Stack Dev + Product Owner"
    },
    {
      id: "EP-02",
      code: "EPIC-2",
      title: "Multi-Warehouse Facility Modeling & Dynamic Bin Topology",
      description: "Model multiple physical and virtual distribution centers with zones (fast-pick, bulk pallet, cold, secure) and bin-level location coordinate addressing.",
      businessValue: "Enables granular inventory visibility down to aisle/shelf/bin level across nationwide distribution network.",
      totalStoryPoints: 23,
      status: "Done",
      sprintsInvolved: [3, 9],
      leadRole: "Architecture Lead"
    },
    {
      id: "EP-03",
      code: "EPIC-3",
      title: "Real-Time Stock Tracking, Lot Control & Cycle Count Audits",
      description: "Engine for real-time Stock On Hand (SOH), Available to Promise (ATP), inventory reservation locking, batch/lot tracking, and variance audit reconciliation.",
      businessValue: "Prevents stockouts and overselling, maintains 99.4% inventory record accuracy, and cuts shrinkage by 40%.",
      totalStoryPoints: 26,
      status: "Done",
      sprintsInvolved: [4, 5],
      leadRole: "Senior Backend Engineer"
    },
    {
      id: "EP-04",
      code: "EPIC-4",
      title: "Supplier Relationship Management (SRM) & Procure-to-Pay",
      description: "Supplier registry with SLA lead times, vendor performance grading, automated reorder triggers, purchase order workflows, and Goods Receipt Notes (GRN).",
      businessValue: "Reduces procurement cycle time from 14 days to 48 hours and automates vendor SLA compliance tracking.",
      totalStoryPoints: 27,
      status: "Done",
      sprintsInvolved: [6, 7, 8],
      leadRole: "Full-Stack Engineer"
    },
    {
      id: "EP-05",
      code: "EPIC-5",
      title: "Omnichannel Order Ingestion & Intelligent Multi-Node Fulfillment",
      description: "Ingest orders across web, mobile, marketplaces, and POS with automated heuristic routing to the optimal warehouse based on proximity and stock availability.",
      businessValue: "Decreases average order transit time by 1.8 days and minimizes split-shipment freight costs by 22%.",
      totalStoryPoints: 28,
      status: "Done",
      sprintsInvolved: [10, 11],
      leadRole: "Fulfillment Tech Lead"
    },
    {
      id: "EP-06",
      code: "EPIC-6",
      title: "Warehouse Operations: Wave Picking, Packing Station & Dispatch",
      description: "Warehouse worker execution interfaces: wave/batch picking lists with bin routing, digital packing verification, and carrier shipping label generation.",
      businessValue: "Boosts picker throughput from 45 lines/hr to 110 lines/hr and reduces picking errors to below 0.1%.",
      totalStoryPoints: 25,
      status: "Done",
      sprintsInvolved: [12, 13],
      leadRole: "Frontend UI/UX + Operations"
    },
    {
      id: "EP-07",
      code: "EPIC-7",
      title: "Reverse Logistics: RMA Processing, Quality Inspection & Restocking",
      description: "Customer return authorization (RMA) lifecycle, condition grading (restock to shelf, rework/repair, quarantine, scrap), and refund event triggers.",
      businessValue: "Shortens return processing time from 9 days to 24 hours, recovering 35% more salvage value on customer returns.",
      totalStoryPoints: 16,
      status: "Done",
      sprintsInvolved: [14],
      leadRole: "QA & Workflow Engineer"
    },
    {
      id: "EP-08",
      code: "EPIC-8",
      title: "Executive Inventory Analytics, Demand Forecasting & Capstone Polish",
      description: "Comprehensive executive dashboard: inventory valuation (FIFO/Weighted Avg), GMROI, stock turnover rates, demand forecasting trends, and system audit trail.",
      businessValue: "Provides C-suite and supply chain executives real-time capital allocation insights and automated replenishment projections.",
      totalStoryPoints: 15,
      status: "Done",
      sprintsInvolved: [15],
      leadRole: "Data Visualization & Tech Lead"
    }
  ],
  sprints: [
    {
      sprintNumber: 1,
      name: "Sprint 1: Core Catalog Architecture & PIM Schema",
      epicId: "EP-01",
      dates: "Sprint Days 1 - 10",
      plannedPoints: 12,
      completedPoints: 12,
      goal: "Establish relational entity schemas for products, implement immutable SKU generation algorithms, and validate EAN-13/UPC barcode formatters.",
      ceremonies: {
        planning: "Agreed on core product schema, established Git branching strategy (Trunk-based development with feature flags), and defined team Definition of Done.",
        dailyStandup: "Addressed database normalization challenge for multi-attribute products; resolved by adopting flexible JSON attribute fields alongside indexed core columns.",
        review: "Demoed working SKU generator and barcode validator to retail merchandising stakeholders with 100% acceptance.",
        retrospective: {
          wentWell: "Fast consensus on database schema; great collaboration between PO and backend engineer.",
          couldImprove: "Test coverage was added towards the end rather than in tandem.",
          actionItem: "Adopt TDD approach for Sprint 2 user story implementations."
        }
      },
      stories: [
        {
          id: "US-101",
          title: "Automated SKU & Barcode Generation Engine",
          points: 5,
          status: "Done",
          asA: "Catalog Manager",
          iWant: "to generate standardized, human-readable SKUs and validate EAN-13 barcodes",
          soThat: "all incoming inventory items conform to our company-wide naming convention.",
          acceptanceCriteria: [
            "Given a category and brand, when a new product is created, the system auto-generates a unique SKU.",
            "Barcode field enforces EAN-13/UPC check-digit validation.",
            "Duplicate SKUs are rejected with descriptive error notifications."
          ]
        },
        {
          id: "US-102",
          title: "Product Cost, Selling Price & Margin Computation",
          points: 4,
          status: "Done",
          asA: "Merchandising Analyst",
          iWant: "the system to automatically calculate gross profit margin percentage",
          soThat: "we never sell items below minimum threshold margins.",
          acceptanceCriteria: [
            "Given Cost Price and Selling Price, Margin % is dynamically calculated as ((Price - Cost) / Price) * 100.",
            "Warnings highlight margins below 25%."
          ]
        },
        {
          id: "US-103",
          title: "Unit of Measure & Physical Dimension Specifiers",
          points: 3,
          status: "Done",
          asA: "Logistics Coordinator",
          iWant: "to record weight and dimensions for each product",
          soThat: "warehouse capacity and freight packaging can be accurately calculated.",
          acceptanceCriteria: [
            "Weight in kg and L x W x H dimensions are required fields on catalog items."
          ]
        }
      ]
    },
    {
      sprintNumber: 2,
      name: "Sprint 2: Product Catalog UI, Filtering & CSV Pipeline",
      epicId: "EP-01",
      dates: "Sprint Days 11 - 20",
      plannedPoints: 13,
      completedPoints: 13,
      goal: "Deliver a lightning-fast, responsive Product Catalog management interface with multi-attribute filtering, search, and bulk CSV export/import.",
      ceremonies: {
        planning: "Selected modern component architecture; designed intuitive modal forms for Add/Edit product flows.",
        dailyStandup: "Browser table rendering lagged on large test datasets; solved with virtualized pagination and debounce on search inputs.",
        review: "Product managers tested catalog search, category tagging, and exported 500-item CSV in under 1 second.",
        retrospective: {
          wentWell: "High UX aesthetic satisfaction; fast search feedback loop.",
          couldImprove: "CSV error messaging was initially too cryptic.",
          actionItem: "Include line-number-specific error tooltips in CSV import parser."
        }
      },
      stories: [
        {
          id: "US-201",
          title: "Interactive Product Directory with Real-Time Filtering",
          points: 5,
          status: "Done",
          asA: "Inventory Specialist",
          iWant: "to filter products by category, stock status, brand, and search by keyword",
          soThat: "I can immediately locate any SKU out of thousands in the catalog.",
          acceptanceCriteria: [
            "Filter pills update list instantly without full page reloads.",
            "Search matches against SKU, title, brand, and barcode."
          ]
        },
        {
          id: "US-202",
          title: "Modal-Based Product Creation and In-Place Editing",
          points: 5,
          status: "Done",
          asA: "Merchandiser",
          iWant: "an intuitive modal dialog to add new products with live preview",
          soThat: "I can onboard new inventory SKUs without navigating away from the list.",
          acceptanceCriteria: [
            "Dialog supports accessible keyboard escape (ESC) and light dismiss.",
            "Form validates mandatory fields with clear inline error states."
          ]
        },
        {
          id: "US-203",
          title: "CSV Export & Bulk Data Pipeline",
          points: 3,
          status: "Done",
          asA: "Supply Chain Manager",
          iWant: "to export our catalog to formatted CSV spreadsheets",
          soThat: "we can share inventory snapshots with external accounting systems.",
          acceptanceCriteria: [
            "Generates downloadable RFC 4180 compliant CSV files with correct UTF-8 headers."
          ]
        }
      ]
    },
    {
      sprintNumber: 3,
      name: "Sprint 3: Multi-Warehouse Facility Modeling & Bin Topology",
      epicId: "EP-02",
      dates: "Sprint Days 21 - 30",
      plannedPoints: 11,
      completedPoints: 11,
      goal: "Model nationwide distribution centers (Chicago, LA, Newark, Dallas) and build interactive visual bin location grid coordinate systems.",
      ceremonies: {
        planning: "Defined bin naming convention (Zone-Aisle-Shelf-Bin) and warehouse capacity metrics.",
        dailyStandup: "Resolved naming collision across warehouse codes; introduced unique compound key [WarehouseID + BinCode].",
        review: "Stakeholders praised the visual warehouse zone breakdown (Fast Pick vs Bulk Pallet vs Quarantine).",
        retrospective: {
          wentWell: "Strong architectural foundation for spatial warehouse layouts.",
          couldImprove: "Need more realistic seed capacity numbers.",
          actionItem: "Calibrate square footage and cubic unit constraints with warehouse operations team."
        }
      },
      stories: [
        {
          id: "US-301",
          title: "Multi-Warehouse Facility Registry & Capacity Dashboard",
          points: 5,
          status: "Done",
          asA: "VP of Supply Chain",
          iWant: "to monitor capacity utilization across all regional distribution centers",
          soThat: "I can prevent warehouse bottlenecks and balance regional workload.",
          acceptanceCriteria: [
            "Shows total capacity, used capacity, and utilization percentage per facility.",
            "Color-coded warning indicator triggers when facility exceeds 85% capacity."
          ]
        },
        {
          id: "US-302",
          title: "Bin Location Topology (Zone, Aisle, Shelf, Bin)",
          points: 6,
          status: "Done",
          asA: "Warehouse Operations Manager",
          iWant: "to assign specific bin coordinate addresses to each inventory item",
          soThat: "pickers can navigate directly to the exact shelf slot without searching.",
          acceptanceCriteria: [
            "Bins are formatted as {ZONE}-{AISLE}-{SHELF}-{BIN} (e.g., A-01-02).",
            "Zone types distinguish High-Velocity Pick, Bulk Storage, and Quarantine."
          ]
        }
      ]
    },
    {
      sprintNumber: 4,
      name: "Sprint 4: Real-Time Stock Engine & Reservation Locking",
      epicId: "EP-03",
      dates: "Sprint Days 31 - 40",
      plannedPoints: 14,
      completedPoints: 14,
      goal: "Implement concurrent stock reservation engine calculating On Hand, Reserved, and Available-to-Promise (ATP) stock in real-time.",
      ceremonies: {
        planning: "Drafted state transition model for stock states (Available -> Reserved -> Picked -> Depleted).",
        dailyStandup: "Addressed race condition where two simultaneous customer checkouts could oversell the last item; implemented atomic reservation locks.",
        review: "Demonstrated automated stock deduction upon order placement with live stock balance updates across connected views.",
        retrospective: {
          wentWell: "High reliability on atomic inventory reservation algorithm.",
          couldImprove: "Stress testing concurrency was time-consuming.",
          actionItem: "Automate load test script for concurrent order simulations."
        }
      },
      stories: [
        {
          id: "US-401",
          title: "Available-to-Promise (ATP) Dynamic Ledger",
          points: 6,
          status: "Done",
          asA: "E-Commerce Channel Manager",
          iWant: "stock availability to reflect (On Hand - Reserved Orders)",
          soThat: "customers can never purchase products that are already committed to other orders.",
          acceptanceCriteria: [
            "ATP mathematically equals Stock on Hand minus Active Reservations.",
            "Out-of-stock badges trigger automatically when ATP drops to 0."
          ]
        },
        {
          id: "US-402",
          title: "Batch / Lot Number & Expiry Tracking",
          points: 5,
          status: "Done",
          asA: "Quality Assurance Officer",
          iWant: "to assign batch lot numbers to received stock lots",
          soThat: "we can perform rapid trace-back audits in case of product recalls.",
          acceptanceCriteria: [
            "Stock records maintain batch ID and timestamp.",
            "Items can be filtered and reported by specific batch lot."
          ]
        },
        {
          id: "US-403",
          title: "Automated Low Stock & Safety Stock Threshold Warnings",
          points: 3,
          status: "Done",
          asA: "Purchasing Specialist",
          iWant: "to receive proactive visual alerts when stock breaches reorder points",
          soThat: "I can issue purchase orders before a total stockout occurs.",
          acceptanceCriteria: [
            "Presents amber warning badge when Stock on Hand <= Reorder Point.",
            "Displays red critical alert when Stock on Hand is 0."
          ]
        }
      ]
    },
    {
      sprintNumber: 5,
      name: "Sprint 5: Cycle Counting & Inventory Adjustments",
      epicId: "EP-03",
      dates: "Sprint Days 41 - 50",
      plannedPoints: 12,
      completedPoints: 12,
      goal: "Build cycle counting workflow allowing physical stock counts, variance calculations, reason-coded adjustments, and audit trail logging.",
      ceremonies: {
        planning: "Engineered standard audit log data contract and shrinkage reason codes (Damage, Theft, Spoilage, Found Goods).",
        dailyStandup: "Identified need for manager sign-off requirement for large inventory write-offs.",
        review: "Simulated warehouse cycle count discrepancy (+/- 5 units) and verified automatic ledger adjustment and audit entry.",
        retrospective: {
          wentWell: "Audit trail transparency was highly commended by the finance stakeholder.",
          couldImprove: "Form inputs needed clearer indication of positive vs negative adjustments.",
          actionItem: "Use green '+' and red '-' indicators for variance quantity inputs."
        }
      },
      stories: [
        {
          id: "US-501",
          title: "Cycle Count Physical vs System Reconciliation",
          points: 5,
          status: "Done",
          asA: "Inventory Auditor",
          iWant: "to input physical count numbers and review variances against system quantities",
          soThat: "we can quickly discover and correct discrepancies.",
          acceptanceCriteria: [
            "System calculates variance = Physical Count - System SOH.",
            "Displays dollar value impact of the discrepancy."
          ]
        },
        {
          id: "US-502",
          title: "Stock Adjustment with Standardized Reason Codes",
          points: 4,
          status: "Done",
          asA: "Warehouse Supervisor",
          iWant: "to record adjustment reason codes (Damaged, Theft, Count Discrepancy, Expired)",
          soThat: "financial accountants have audit-compliant justification for write-downs.",
          acceptanceCriteria: [
            "Adjustment requires selecting a valid reason code and entering notes.",
            "Instantly adjusts warehouse stock level without bypassing safety constraints."
          ]
        },
        {
          id: "US-503",
          title: "Immutable System Audit Log Ledger",
          points: 3,
          status: "Done",
          asA: "Compliance Officer",
          iWant: "every inventory movement, edit, and adjustment to create an immutable log entry",
          soThat: "we maintain full traceability for internal and external regulatory audits.",
          acceptanceCriteria: [
            "Logs user, timestamp, action type, and detailed payload description.",
            "Logs are viewable in a chronologically sorted real-time feed."
          ]
        }
      ]
    },
    {
      sprintNumber: 6,
      name: "Sprint 6: Supplier Directory & SLA Benchmarking",
      epicId: "EP-04",
      dates: "Sprint Days 51 - 60",
      plannedPoints: 10,
      completedPoints: 10,
      goal: "Implement comprehensive Supplier Directory with contact data, payment terms (Net 15/30/60), lead-time metrics, and supplier reliability ratings.",
      ceremonies: {
        planning: "Structured supplier data schema and defined supplier scorecard metrics (On-time delivery % and Quality acceptance rate).",
        dailyStandup: "Decided on supplier categorization matching product hierarchy.",
        review: "Procurement team reviewed supplier directory UI, preferred vendor badges, and contact cards.",
        retrospective: {
          wentWell: "Clean UI design; smooth linking between suppliers and products.",
          couldImprove: "Need easier way to see all products supplied by a specific vendor.",
          actionItem: "Add product count badge and filter-by-vendor link in supplier cards."
        }
      },
      stories: [
        {
          id: "US-601",
          title: "Supplier Master Profiles & Contract Directory",
          points: 5,
          status: "Done",
          asA: "Procurement Specialist",
          iWant: "to maintain supplier contact details, payment terms, and vendor codes",
          soThat: "our purchasing agents have direct access to validated vendor terms.",
          acceptanceCriteria: [
            "Profile stores vendor code, primary contact, email, phone, city, payment terms.",
            "Supports tagging Preferred vs Active vs On-Hold vendor statuses."
          ]
        },
        {
          id: "US-602",
          title: "Vendor SLA & Reliability Performance Scoring",
          points: 5,
          status: "Done",
          asA: "Director of Sourcing",
          iWant: "to view automated reliability score percentages for each vendor",
          soThat: "we award high-value contracts to vendors with demonstrated punctuality.",
          acceptanceCriteria: [
            "Displays reliability rating percentage with color-coded benchmark progress bars.",
            "Displays contractual lead time in days for replenishment planning."
          ]
        }
      ]
    },
    {
      sprintNumber: 7,
      name: "Sprint 7: Purchase Order Lifecycle (Procure-to-Pay)",
      epicId: "EP-04",
      dates: "Sprint Days 61 - 70",
      plannedPoints: 13,
      completedPoints: 13,
      goal: "Deliver complete Purchase Order (PO) creation workflow, multi-line item cost calculations, PO status pipeline (Draft -> Approved -> Sent -> Received).",
      ceremonies: {
        planning: "Mapped PO states and approval thresholds; designed line-item calculation widget.",
        dailyStandup: "Refined tax and freight estimation calculations to handle multi-warehouse destination orders.",
        review: "Demoed creation of new PO with 3 line items, instant margin review, and transition to 'Approved' state.",
        retrospective: {
          wentWell: "Accurate financial calculations; clear status badge color coding.",
          couldImprove: "PO status transitions needed confirmation modals to avoid accidental clicks.",
          actionItem: "Implement confirmation dialogs for high-impact state transitions."
        }
      },
      stories: [
        {
          id: "US-701",
          title: "Multi-Item Purchase Order Builder",
          points: 6,
          status: "Done",
          asA: "Purchasing Agent",
          iWant: "to create a Purchase Order with multiple line items, unit costs, and destination warehouse",
          soThat: "I can consolidate replenishment orders to minimize inbound shipping expenses.",
          acceptanceCriteria: [
            "Calculates total PO amount automatically as sum of (quantity * unitCost).",
            "Auto-populates expected delivery date based on supplier contractual lead time."
          ]
        },
        {
          id: "US-702",
          title: "Purchase Order Approval Workflow & Status Pipeline",
          points: 4,
          status: "Done",
          asA: "Finance Manager",
          iWant: "POs to follow strict lifecycle states (Draft -> Approved -> Sent to Vendor)",
          soThat: "no unauthorized capital commitments are sent to external suppliers.",
          acceptanceCriteria: [
            "Only approved POs can be sent to vendors.",
            "Status updates generate immutable audit log entries."
          ]
        },
        {
          id: "US-703",
          title: "Automated Reorder Trigger Suggestion",
          points: 3,
          status: "Done",
          asA: "Inventory Planner",
          iWant: "the system to suggest recommended reorder quantities for low-stock SKUs",
          soThat: "I don't have to manually calculate economic order quantities during stockouts.",
          acceptanceCriteria: [
            "Reorder button pre-fills suggested quantity up to maximum stock capacity."
          ]
        }
      ]
    },
    {
      sprintNumber: 8,
      name: "Sprint 8: Inbound Receiving Dock & Goods Receipt (GRN)",
      epicId: "EP-04",
      dates: "Sprint Days 71 - 80",
      plannedPoints: 14,
      completedPoints: 14,
      goal: "Implement Inbound Receiving Dock interface for warehouse clerks: inspect deliveries, record received vs ordered quantities, and auto-increment stock.",
      ceremonies: {
        planning: "Designed Goods Received Note (GRN) modal and partial receipt handling rules.",
        dailyStandup: "Addressed scenario of supplier delivering overage (more items than ordered); allowed with manager override flag.",
        review: "Executed simulated dock receipt of 50 headphones; verified stock at Chicago warehouse increased immediately from 35 to 85 units.",
        retrospective: {
          wentWell: "Seamless integration between receiving dock and real-time inventory ledger.",
          couldImprove: "Clerk needed one-click 'Receive Full PO' option for faster processing.",
          actionItem: "Add 'Auto-fill All Quantities' shortcut button in receiving modal."
        }
      },
      stories: [
        {
          id: "US-801",
          title: "Dock Receiving Inspection & Discrepancy Reporting",
          points: 6,
          status: "Done",
          asA: "Receiving Dock Clerk",
          iWant: "to verify physical carton counts against the supplier's Purchase Order",
          soThat: "short shipments or damaged goods are caught before invoices are paid.",
          acceptanceCriteria: [
            "Clerk enters received quantity per line item.",
            "Displays remaining balance and flags partial shipments."
          ]
        },
        {
          id: "US-802",
          title: "Automated Stock Ingestion upon GRN Completion",
          points: 5,
          status: "Done",
          asA: "Warehouse Manager",
          iWant: "the system to increment warehouse On-Hand stock immediately upon GRN sign-off",
          soThat: "newly arrived inventory is available for customer order fulfillment within minutes.",
          acceptanceCriteria: [
            "Completing GRN increments warehouse inventory balances atomically.",
            "PO status auto-updates to 'Received' or 'Partially Received'."
          ]
        },
        {
          id: "US-803",
          title: "Inbound Goods Receipt Note (GRN) Document Viewer",
          points: 3,
          status: "Done",
          asA: "Accounts Payable Clerk",
          iWant: "to view and print the timestamped GRN inspection report",
          soThat: "I can match the vendor's invoice with actual physical receipts (3-way matching).",
          acceptanceCriteria: [
            "Generates clean, printable GRN summary showing PO #, receiver name, and quantities."
          ]
        }
      ]
    },
    {
      sprintNumber: 9,
      name: "Sprint 9: Inter-Warehouse Stock Transfers (STO)",
      epicId: "EP-02",
      dates: "Sprint Days 81 - 90",
      plannedPoints: 12,
      completedPoints: 12,
      goal: "Build Inter-Warehouse Stock Transfer Orders (STO) to balance nationwide inventory: dispatching facility deduction, in-transit tracking, and arrival receipt.",
      ceremonies: {
        planning: "Engineered 'In-Transit' virtual state so inventory is never double-counted or lost during multi-day highway transit.",
        dailyStandup: "Ensured stock reservations take inter-warehouse transfer requirements into account.",
        review: "Dispatched transfer from Chicago to LA; observed real-time deduction from Chicago and status marked 'In-Transit' with carrier tracking.",
        retrospective: {
          wentWell: "Clean transfer order pipeline with carrier ETA visibility.",
          couldImprove: "Needed clearer indication of origin vs destination warehouse on transfer cards.",
          actionItem: "Use visual directional arrows (Origin ➔ Destination) with warehouse badges."
        }
      },
      stories: [
        {
          id: "US-901",
          title: "Stock Transfer Order Creation & Reservation",
          points: 5,
          status: "Done",
          asA: "Inventory Logistics Planner",
          iWant: "to create a transfer order moving stock between regional warehouses",
          soThat: "we can balance regional stock ahead of localized demand spikes.",
          acceptanceCriteria: [
            "Source warehouse must have sufficient Available-to-Promise stock.",
            "Reserves stock at origin immediately upon transfer creation."
          ]
        },
        {
          id: "US-902",
          title: "In-Transit Virtual Inventory Tracking & Dispatch",
          points: 4,
          status: "Done",
          asA: "Logistics Coordinator",
          iWant: "to assign carrier, tracking number, and estimated arrival date to transfers",
          soThat: "both sending and receiving facilities can track shipment location.",
          acceptanceCriteria: [
            "Deducts physical stock from source facility and marks status as 'In-Transit'.",
            "Displays carrier name and tracking link/code."
          ]
        },
        {
          id: "US-903",
          title: "Destination Warehouse Transfer Receipt & Reconciliation",
          points: 3,
          status: "Done",
          asA: "Receiving Warehouse Manager",
          iWant: "to confirm receipt of transferred goods at the destination warehouse",
          soThat: "the stock is officially added to destination inventory and transfer is closed.",
          acceptanceCriteria: [
            "Receiving action adds stock to destination warehouse bin.",
            "Transfer status transitions to 'Completed'."
          ]
        }
      ]
    },
    {
      sprintNumber: 10,
      name: "Sprint 10: Omnichannel Order Ingestion & Allocation",
      epicId: "EP-05",
      dates: "Sprint Days 91 - 100",
      plannedPoints: 13,
      completedPoints: 13,
      goal: "Implement unified sales order ingestion supporting E-Commerce, Retail POS, B2B wholesale channels, and automated inventory reservation queues.",
      ceremonies: {
        planning: "Designed customer schema, omnichannel source tags, and sales order pipeline states.",
        dailyStandup: "Tuned order priority flags (Normal vs High vs Rush) to influence warehouse pick queue priority.",
        review: "Demoed incoming orders from 3 different sales channels showing correct line item totaling and stock reservation.",
        retrospective: {
          wentWell: "Unified order model accommodates both wholesale pallet orders and single-item e-com orders.",
          couldImprove: "Order filter controls needed channel-specific quick filters.",
          actionItem: "Add channel filter chips (All, E-Com, B2B, POS, Mobile)."
        }
      },
      stories: [
        {
          id: "US-1001",
          title: "Omnichannel Sales Order Ingestion Pipeline",
          points: 5,
          status: "Done",
          asA: "Operations Director",
          iWant: "orders from web, mobile app, B2B, and stores to funnel into a single queue",
          soThat: "our fulfillment teams operate from a single unified backlog.",
          acceptanceCriteria: [
            "Orders display channel badge, customer info, items, and total amount.",
            "Order status lifecycle: Pending -> Wave Picking -> Packed -> Dispatched -> Delivered."
          ]
        },
        {
          id: "US-1002",
          title: "Instant Stock Reservation on Order Placement",
          points: 5,
          status: "Done",
          asA: "Inventory Controller",
          iWant: "incoming orders to instantly place reservations on warehouse inventory",
          soThat: "items are locked for the purchasing customer immediately.",
          acceptanceCriteria: [
            "Increments warehouse 'Reserved' count and decrements 'Available' count.",
            "Prevents duplicate allocation of identical units."
          ]
        },
        {
          id: "US-1003",
          title: "Manual Sales Order Creation & Customer Management",
          points: 3,
          status: "Done",
          asA: "Customer Service Representative",
          iWant: "to manually enter telephone or wholesale orders on behalf of clients",
          soThat: "we can support enterprise clients who order via direct purchase orders.",
          acceptanceCriteria: [
            "Modal form captures customer name, email, shipping address, channel, and items."
          ]
        }
      ]
    },
    {
      sprintNumber: 11,
      name: "Sprint 11: Intelligent Multi-Node Fulfillment Routing",
      epicId: "EP-05",
      dates: "Sprint Days 101 - 110",
      plannedPoints: 15,
      completedPoints: 15,
      goal: "Build intelligent fulfillment routing engine: automatically selects optimal warehouse based on customer delivery address, stock availability, and shipping speed.",
      ceremonies: {
        planning: "Defined regional allocation rules (East Coast orders ➔ Newark, West Coast ➔ Ontario CA, Midwest ➔ Chicago, South ➔ Dallas).",
        dailyStandup: "Solved fallback scenario when preferred regional warehouse is out of stock; routing engine automatically cascades to Central Hub.",
        review: "Executed simulated orders from New York and Los Angeles; observed automated routing to EWR and LAX warehouses respectively.",
        retrospective: {
          wentWell: "Significant milestone: automated routing reduces manual order triage to zero.",
          couldImprove: "Explainability was missing—users wanted to know WHY a warehouse was chosen.",
          actionItem: "Display routing reason badge ('Nearest Hub with 100% Stock Availability')."
        }
      },
      stories: [
        {
          id: "US-1101",
          title: "Geographic Proximity Fulfillment Routing Engine",
          points: 7,
          status: "Done",
          asA: "Logistics Architect",
          iWant: "the system to assign the closest warehouse with sufficient inventory",
          soThat: "we minimize parcel transit days and shipping zone carrier surcharges.",
          acceptanceCriteria: [
            "Matches shipping state to regional distribution territory.",
            "Verifies 100% item availability at candidate facility before locking allocation."
          ]
        },
        {
          id: "US-1102",
          title: "Stock Availability Fallback & Cascade Logic",
          points: 5,
          status: "Done",
          asA: "Fulfillment Supervisor",
          iWant: "the engine to fall back to Central Distribution Hub if regional facility is out of stock",
          soThat: "customer orders are never held in limbo when inventory exists elsewhere.",
          acceptanceCriteria: [
            "Cascades to secondary warehouse if primary lacks sufficient ATP stock.",
            "Flags orders that cannot be fulfilled from any warehouse as 'Backordered'."
          ]
        },
        {
          id: "US-1103",
          title: "Manual Warehouse Re-assignment Override",
          points: 3,
          status: "Done",
          asA: "Operations Manager",
          iWant: "the ability to manually re-route an order to a different warehouse if needed",
          soThat: "I can respond to unexpected facility closures or freight carrier strikes.",
          acceptanceCriteria: [
            "Allows supervisor to select alternative warehouse with real-time stock validation."
          ]
        }
      ]
    },
    {
      sprintNumber: 12,
      name: "Sprint 12: Warehouse Operations: Wave Picking & Route Optimization",
      epicId: "EP-06",
      dates: "Sprint Days 111 - 120",
      plannedPoints: 13,
      completedPoints: 13,
      goal: "Deliver Wave Picking interface for warehouse floor pickers: generates consolidated pick sheets with optimized bin navigation routes and digital pick confirmations.",
      ceremonies: {
        planning: "Designed high-contrast, touch-friendly picker view; organized pick items sequentially by Zone -> Aisle -> Shelf -> Bin.",
        dailyStandup: "Integrated barcode confirmation simulator to ensure picker picks the correct SKU.",
        review: "Tested picking wave of 4 orders; warehouse test user completed pick in under 3 minutes with zero route backtracking.",
        retrospective: {
          wentWell: "Picker efficiency boost; sequential bin sorting eliminated warehouse crisscrossing.",
          couldImprove: "Font size on mobile scanners needed to be larger.",
          actionItem: "Ensure high-contrast typography and large tap targets for warehouse handheld screens."
        }
      },
      stories: [
        {
          id: "US-1201",
          title: "Wave Picking Sheet Generation with Bin Path Sequencing",
          points: 6,
          status: "Done",
          asA: "Warehouse Picker",
          iWant: "pick lists to sequence items in optimal warehouse walking order",
          soThat: "I can pick all items in a single linear pass down the warehouse aisles.",
          acceptanceCriteria: [
            "Orders items strictly by Zone, Aisle, Shelf, and Bin coordinates.",
            "Displays SKU, Product Name, Target Bin, and Quantity to Pick."
          ]
        },
        {
          id: "US-1202",
          title: "Digital Item Pick Verification & Status Advancement",
          points: 4,
          status: "Done",
          asA: "Pick Line Lead",
          iWant: "pickers to confirm item picks with one click",
          soThat: "the order immediately transitions to 'Wave Picking' and moves to packing.",
          acceptanceCriteria: [
            "Checkmark toggles picked status for each line item.",
            "Once all items are confirmed picked, order automatically advances to Packed stage."
          ]
        },
        {
          id: "US-1203",
          title: "Barcode Scanner Confirmation Simulator",
          points: 3,
          status: "Done",
          asA: "Quality Assurance Auditor",
          iWant: "to simulate scanning an item barcode during picking",
          soThat: "we verify that physical barcodes match catalog SKUs 100% of the time.",
          acceptanceCriteria: [
            "Simulates barcode beep and validates matching SKU."
          ]
        }
      ]
    },
    {
      sprintNumber: 13,
      name: "Sprint 13: Packing Station & Carrier Dispatch Integration",
      epicId: "EP-06",
      dates: "Sprint Days 121 - 130",
      plannedPoints: 12,
      completedPoints: 12,
      goal: "Implement Packing Station interface: packing slip generation, carrier shipping label generation (FedEx, UPS, DHL, USPS), and one-click dispatch.",
      ceremonies: {
        planning: "Designed printable Packing Slip layout with customer address, barcode, item breakdown, and return instructions.",
        dailyStandup: "Simulated carrier tracking number generation algorithms for FedEx, UPS, and DHL formats.",
        review: "Demoed complete packing flow: generated digital packing slip, assigned UPS tracking number, marked order 'Dispatched'.",
        retrospective: {
          wentWell: "Packing slip layout looks extremely professional and ready for print.",
          couldImprove: "Add direct 'Print' browser trigger shortcut.",
          actionItem: "Add window.print() invocation with specialized CSS print media query."
        }
      },
      stories: [
        {
          id: "US-1301",
          title: "Digital Packing Slip & Shipping Invoice Generator",
          points: 5,
          status: "Done",
          asA: "Packing Station Operator",
          iWant: "to generate a clean, formatted packing slip for each dispatched package",
          soThat: "the end customer has an itemized breakdown inside their shipment box.",
          acceptanceCriteria: [
            "Packing slip displays company header, order number, date, shipping address, and item list.",
            "Includes scannable barcode and return RMA instructions."
          ]
        },
        {
          id: "US-1302",
          title: "Carrier Label Assignment & Tracking Number Generator",
          points: 4,
          status: "Done",
          asA: "Shipping Clerk",
          iWant: "the system to assign carrier-specific tracking numbers and generate shipping labels",
          soThat: "packages are ready for daily carrier pickup scans.",
          acceptanceCriteria: [
            "Assigns realistic tracking number matching carrier format (e.g. 1Z... for UPS, FXG... for FedEx).",
            "Transitions order status to 'Dispatched' and permanently deducts reserved stock."
          ]
        },
        {
          id: "US-1303",
          title: "Live Order Delivery Tracking Simulator",
          points: 3,
          status: "Done",
          asA: "Customer Support Agent",
          iWant: "to track delivery milestone progressions (Dispatched ➔ In-Transit ➔ Out for Delivery ➔ Delivered)",
          soThat: "I can accurately answer customer shipment inquiries in real time.",
          acceptanceCriteria: [
            "Displays interactive delivery timeline with carrier checkpoint timestamps."
          ]
        }
      ]
    },
    {
      sprintNumber: 14,
      name: "Sprint 14: Reverse Logistics & RMA Quality Inspection",
      epicId: "EP-07",
      dates: "Sprint Days 131 - 140",
      plannedPoints: 11,
      completedPoints: 11,
      goal: "Implement Returns & Reverse Logistics (RMA) workflow: customer return authorization, return dock condition inspection, and disposition routing (Restock, Quarantine, Scrap).",
      ceremonies: {
        planning: "Defined disposition outcomes: Grade A (Return to Active Shelf), Grade B (Refurbish / Hold), Grade C (Scrap / Salvage).",
        dailyStandup: "Ensured restocked returns increment Available stock at the inspecting warehouse while scrap logs write-offs in audit log.",
        review: "Simulated return of defective keyboard: clerk inspected unit, routed to Zone D Quarantine, and triggered customer exchange credit.",
        retrospective: {
          wentWell: "Comprehensive reverse logistics prevents returned goods from sitting indefinitely in warehouse corners.",
          couldImprove: "Reason code tracking needed customer-side vs inspector-side distinction.",
          actionItem: "Maintain separate 'Customer Stated Reason' and 'Warehouse Inspected Disposition' fields."
        }
      },
      stories: [
        {
          id: "US-1401",
          title: "Customer Return Authorization (RMA) Ingestion",
          points: 4,
          status: "Done",
          asA: "Returns Specialist",
          iWant: "to issue and track Return Merchandise Authorizations (RMA)",
          soThat: "unauthorized packages received at the dock can be properly identified.",
          acceptanceCriteria: [
            "Generates unique RMA number linked to original sales order.",
            "Captures customer return reason (Defective, Wrong Item, Buyer Remorse)."
          ]
        },
        {
          id: "US-1402",
          title: "Dock Quality Inspection & Disposition Routing",
          points: 4,
          status: "Done",
          asA: "Quality Inspector",
          iWant: "to inspect returned items and designate disposition (Restock, Quarantine, Scrap)",
          soThat: "defective units never get mixed back into pristine sellable inventory.",
          acceptanceCriteria: [
            "Selecting 'Restock to Shelf' increments warehouse Available stock.",
            "Selecting 'Quarantine' places units in Zone D without making them sellable.",
            "Selecting 'Scrap' records inventory loss write-off in audit ledger."
          ]
        },
        {
          id: "US-1403",
          title: "Reverse Logistics Metrics & Salvage Valuation",
          points: 3,
          status: "Done",
          asA: "Finance Controller",
          iWant: "to view return rate percentages and recovery salvage values",
          soThat: "we can identify problematic products with abnormally high defect rates.",
          acceptanceCriteria: [
            "Calculates return rate by product category and flags items exceeding 5% return threshold."
          ]
        }
      ]
    },
    {
      sprintNumber: 15,
      name: "Sprint 15: Executive Analytics, Burndown & Capstone Hardening",
      epicId: "EP-08",
      dates: "Sprint Days 141 - 150",
      plannedPoints: 14,
      completedPoints: 14,
      goal: "Deliver Executive Analytics dashboard (Inventory Valuation, GMROI, Turnover), Agile Burndown & Velocity visualization, and end-to-end integration hardening.",
      ceremonies: {
        planning: "Consolidated all 15 sprints' velocity data; designed interactive Chart.js Release Burndown and Velocity charts.",
        dailyStandup: "Performed end-to-end stress tests: Catalog -> PO -> GRN -> Stock Transfer -> Sales Order -> Wave Pick -> Dispatch -> RMA.",
        review: "Final Capstone Presentation to academic panel and executive stakeholders; received highest distinction for comprehensive Scrum delivery and enterprise software quality.",
        retrospective: {
          wentWell: "All 8 Epics and 185 Story Points delivered on schedule across 15 sprints with zero critical defects.",
          couldImprove: "Team worked long hours during Sprint 11 routing engine hardening.",
          actionItem: "Document architectural patterns and lessons learned into permanent Capstone Case Study portfolio artifact."
        }
      },
      stories: [
        {
          id: "US-1501",
          title: "Executive Inventory Valuation & Financial KPI Suite",
          points: 5,
          status: "Done",
          asA: "Chief Financial Officer",
          iWant: "to view total inventory asset valuation, gross margins, and stock turnover rates",
          soThat: "I can optimize working capital allocation across product categories.",
          acceptanceCriteria: [
            "Computes Total Inventory Asset Value = Sum of (On Hand * Cost Price).",
            "Calculates Potential Retail Value = Sum of (On Hand * Selling Price).",
            "Displays gross margin dollar spread across active categories."
          ]
        },
        {
          id: "US-1502",
          title: "Interactive Agile Release Burndown & Sprint Velocity Charts",
          points: 5,
          status: "Done",
          asA: "Scrum Master & Stakeholders",
          iWant: "to inspect the 15-sprint release burndown trajectory and team velocity trend",
          soThat: "we can audit Agile project delivery predictability and adherence to Scrum standards.",
          acceptanceCriteria: [
            "Renders interactive release burndown comparing Ideal vs Actual story point burn.",
            "Renders 15-sprint velocity bar chart with rolling average trendline."
          ]
        },
        {
          id: "US-1503",
          title: "System Architecture, ERD Schema & Case Study Defense Dossier",
          points: 4,
          status: "Done",
          asA: "Academic Evaluator / Capstone Reviewer",
          iWant: "to inspect the full architectural blueprint, Entity-Relationship Diagram, and Scrum ceremony logs",
          soThat: "the capstone project comprehensively demonstrates enterprise engineering and Agile mastery.",
          acceptanceCriteria: [
            "Interactive Architecture Blueprint viewer showing client, logic, state, and storage tiers.",
            "Detailed ERD schema documentation covering all 9 system entities and relationships.",
            "Full sprint-by-sprint ceremony logs accessible with a single click."
          ]
        }
      ]
    }
  ]
};

export type CloudProvider = "aws" | "azure" | "gcp" | "onpremise";

export type ResourceType = "CPU" | "GPU" | "RAM" | "PV" | "Network" | "Cloud";

export interface ResourceMetric {
  type: ResourceType;
  value: number;
  cost: number;
  unit: string;
}

export interface CloudNode {
  id: string;
  provider: CloudProvider;
  label: string;
  region: string;
  podCount: number;
  resources: ResourceMetric[];
  totalCost: number;
  savingsPercent: number;
  status: "healthy" | "warning" | "critical";
}

export interface TopologyData {
  nodes: CloudNode[];
  totalMonthlyCost: number;
  totalSavings: number;
  lastUpdated: string;
}

export interface ApiProduct {
  id: number;
  title: string;
  price: number;
  stock: number;
  rating: number;
  category: string;
}

export interface ApiResponse {
  products: ApiProduct[];
  total: number;
  skip: number;
  limit: number;
}

export type Theme = "light" | "dark";
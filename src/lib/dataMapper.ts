import type { ApiProduct, CloudNode, TopologyData, ResourceMetric, ResourceType, CloudProvider } from "@/types";

const PROVIDER_CONFIG: Record<CloudProvider, { label: string; region: string }> = {
  aws: { label: "AWS", region: "us-east-1" },
  azure: { label: "Azure", region: "eu-west-1" },
  gcp: { label: "Google Cloud", region: "asia-south1" },
  onpremise: { label: "On-Premise", region: "local-dc-1" },
};

const RESOURCE_TYPES: ResourceType[] = ["CPU", "GPU", "RAM", "PV", "Network", "Cloud"];

function deriveResources(product: ApiProduct): ResourceMetric[] {
  const seed = product.price;
  const multiplier = product.stock / 100;

  const rawValues = [
    seed * 0.4,
    seed * 0.15,
    seed * 0.25,
    seed * 0.08,
    seed * 0.07,
    seed * 0.05,
  ];

  return RESOURCE_TYPES.map((type, i) => ({
    type,
    value: Math.min(Math.round(rawValues[i] * multiplier * 10) / 10, 100),
    cost: Math.round(rawValues[i] * 1.2),
    unit: type === "CPU" ? "cores" : type === "RAM" ? "GB" : type === "GPU" ? "units" : "GB",
  }));
}

function deriveSavings(rating: number): number {
  return Math.round((rating / 5) * 60 + 10);
}

function deriveStatus(rating: number): CloudNode["status"] {
  if (rating >= 4) return "healthy";
  if (rating >= 2.5) return "warning";
  return "critical";
}

export function mapProductsToTopology(products: ApiProduct[]): TopologyData {
  const providers: CloudProvider[] = ["aws", "azure", "gcp", "onpremise"];

  const nodes: CloudNode[] = providers.map((provider, i) => {
    const product = products[i % products.length];
    const resources = deriveResources(product);
    const totalCost = resources.reduce((sum, r) => sum + r.cost, 0);

    return {
      id: `node-${provider}`,
      provider,
      label: PROVIDER_CONFIG[provider].label,
      region: PROVIDER_CONFIG[provider].region,
      podCount: Math.max(2, Math.round(product.stock / 15)),
      resources,
      totalCost,
      savingsPercent: deriveSavings(product.rating),
      status: deriveStatus(product.rating),
    };
  });

  const totalMonthlyCost = nodes.reduce((sum, n) => sum + n.totalCost, 0);
  const totalSavings = Math.round(totalMonthlyCost * 0.68); 

  return {
    nodes,
    totalMonthlyCost,
    totalSavings,
    lastUpdated: new Date().toISOString(),
  };
}
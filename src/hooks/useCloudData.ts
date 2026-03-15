import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, TopologyData } from "@/types";
import { mapProductsToTopology } from "@/lib/dataMapper";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

async function fetchCloudData(): Promise<TopologyData> {
  const response = await fetch(
    "https://dummyjson.com/products?limit=4&select=title,price,stock,rating,category",
    { next: { revalidate: 300 } }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch cloud data: ${response.status}`);
  }

  const data: ApiResponse = await response.json();

  if (!data.products || data.products.length === 0) {
    throw new Error("No products returned from API");
  }

  return mapProductsToTopology(data.products);
}

export function useCloudData() {
  const query = useQuery<TopologyData, Error>({
    queryKey: ["cloud-topology"],
    queryFn: fetchCloudData,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 2,
    retryDelay: (attempt) => attempt * 1000,
  });

  return {
    topology: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.error?.message ?? null,
    isFetching: query.isFetching,
    lastUpdated: query.dataUpdatedAt
      ? new Date(query.dataUpdatedAt).toLocaleTimeString()
      : null,
  };
}
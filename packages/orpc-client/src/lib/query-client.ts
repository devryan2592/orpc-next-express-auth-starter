import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import { serializer } from './serializer'

/** Production environment detection */
const isProduction = process.env.NODE_ENV === 'production'

/** Enhanced retry configuration for production */
const productionRetryConfig = {
  queries: {
    retry: (failureCount: number, error: any) => {
      // Don't retry aborted requests
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        return false
      }
      
      // Network errors - retry more aggressively
      if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
        return failureCount < 5
      }
      
      // Timeout errors - limited retries
      if (error?.code === 'TIMEOUT' || error?.status === 408) {
        return failureCount < 2
      }
      
      // Rate limiting - retry with backoff
      if (error?.status === 429) {
        return failureCount < 3
      }
      
      // Server errors - limited retries
      if (error?.status >= 500) {
        return failureCount < 2
      }
      
      // Client errors (except timeout and rate limit) - don't retry
      if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
        return false
      }
      
      // Default retry logic
      return failureCount < 3
    },
    retryDelay: (attemptIndex: number, error: any) => {
      // Handle rate limiting with proper delay
      if (error?.status === 429) {
        const retryAfter = error?.data?.retryAfter || 60
        return retryAfter * 1000
      }
      
      // Exponential backoff with jitter
      const baseDelay = 1000 * 2 ** attemptIndex
      const jitter = Math.random() * 0.1 * baseDelay
      return Math.min(baseDelay + jitter, 30000)
    },
  },
  mutations: {
    retry: (failureCount: number, error: any) => {
      // Don't retry aborted requests
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        return false
      }
      
      // Network errors - limited retries for mutations
      if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
        return failureCount < 2
      }
      
      // Server errors - single retry for mutations
      if (error?.status >= 500) {
        return failureCount < 1
      }
      
      // Client errors - don't retry
      if (error?.status >= 400 && error?.status < 500) {
        return false
      }
      
      return false
    },
    retryDelay: (attemptIndex: number) => {
      return Math.min(2000 * 2 ** attemptIndex, 10000)
    },
  },
}

/** Development retry configuration - more lenient for debugging */
const developmentRetryConfig = {
  queries: {
    retry: (failureCount: number, error: any) => {
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        return false
      }
      if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
        return false
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    retry: (failureCount: number, error: any) => {
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        return false
      }
      if (error?.status >= 400 && error?.status < 500) {
        return false
      }
      return failureCount < 1
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },
}

/**
 * Creates an environment-aware QueryClient with enhanced error handling,
 * retry logic, and performance optimizations for oRPC integration.
 * Automatically switches between production and development configurations.
 */
export function createQueryClient(): QueryClient {
  const retryConfig = isProduction ? productionRetryConfig : developmentRetryConfig
  
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Custom query key hashing for oRPC serialization
        queryKeyHashFn(queryKey) {
          const [json, meta] = serializer.serialize(queryKey)
          return JSON.stringify({ json, meta })
        },
        
        // Environment-aware performance optimizations
        staleTime: isProduction ? 5 * 60 * 1000 : 30 * 1000, // 5min prod, 30s dev
        gcTime: isProduction ? 30 * 60 * 1000 : 5 * 60 * 1000, // 30min prod, 5min dev
        
        // Enhanced retry configuration
        retry: retryConfig.queries.retry,
        retryDelay: retryConfig.queries.retryDelay,
        
        // Structural sharing for performance
        structuralSharing: true,
        
        // Environment-specific behavior
        refetchOnWindowFocus: !isProduction, // Only in development
        refetchOnReconnect: true,
        refetchOnMount: !isProduction, // Use cached data in production
        
        // Network mode configuration
        networkMode: 'online',
        
        // Error boundary integration
        throwOnError: false,
      },
      
      mutations: {
        // Enhanced retry configuration for mutations
        retry: retryConfig.mutations.retry,
        retryDelay: retryConfig.mutations.retryDelay,
        
        // Network mode configuration
        networkMode: 'online',
        
        // Error handling
        throwOnError: false,
      },
      
      // Server-side rendering support
      dehydrate: {
        shouldDehydrateQuery: query => 
          defaultShouldDehydrateQuery(query) || 
          query.state.status === 'pending' ||
          query.state.data !== undefined ||
          (isProduction ? query.state.error === null : true),
        serializeData(data) {
          const [json, meta] = serializer.serialize(data)
          return { json, meta }
        },
      },
      
      // Client-side hydration support
      hydrate: {
        deserializeData(data: any) {
          return serializer.deserialize(data.json, data.meta)
        },
      },
    },
  })
}

// Export the main factory function as default
export default createQueryClient
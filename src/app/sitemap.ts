// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.carsawa.africa' // Replace with your actual domain

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/cars`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dealers`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ]

  // Popular car search combinations for SEO
  const popularSearches = [
    // Price-based searches
    { price: '500000-1000000', priority: 0.9 }, // Cars under 1M (very popular)
    { price: '1000000-2000000', priority: 0.8 }, // Cars 1M-2M
    { price: '0-500000', priority: 0.7 }, // Cars under 500K
    { price: '2000000-3000000', priority: 0.6 }, // Cars 2M-3M
    
    // Brand + price combinations (most searched)
    { brand: 'Toyota', price: '500000-1000000', priority: 0.9 },
    { brand: 'Honda', price: '500000-1000000', priority: 0.8 },
    { brand: 'Nissan', price: '500000-1000000', priority: 0.8 },
    { brand: 'Mazda', price: '500000-1000000', priority: 0.7 },
    { brand: 'Subaru', price: '1000000-2000000', priority: 0.7 },
    { brand: 'BMW', price: '2000000-3000000', priority: 0.6 },
    { brand: 'Mercedes-Benz', price: '3000000-5000000', priority: 0.6 },
    
    // Popular brands alone
    { brand: 'Toyota', priority: 0.8 },
    { brand: 'Honda', priority: 0.7 },
    { brand: 'Nissan', priority: 0.7 },
    { brand: 'Mazda', priority: 0.6 },
    { brand: 'Subaru', priority: 0.6 },
    
    // Body types + price
    { bodyType: 'SUV', price: '1000000-2000000', priority: 0.7 },
    { bodyType: 'Sedan', price: '500000-1000000', priority: 0.7 },
    { bodyType: 'Hatchback', price: '0-500000', priority: 0.6 },
    
    // Popular body types
    { bodyType: 'SUV', priority: 0.6 },
    { bodyType: 'Sedan', priority: 0.6 },
    { bodyType: 'Hatchback', priority: 0.5 },
    
    // Year combinations
    { modelYear: '2020', priority: 0.6 },
    { modelYear: '2019', priority: 0.5 },
    { modelYear: '2018', priority: 0.5 },
    
    // Transmission
    { transmission: 'Automatic', priority: 0.5 },
    { transmission: 'Manual', priority: 0.4 },
    
    // Fuel type
    { fuelType: 'Petrol', priority: 0.4 },
    { fuelType: 'Hybrid', priority: 0.5 },
  ]

  // Generate URLs for popular searches
  const searchPages = popularSearches.map((params) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'priority') {
        searchParams.set(key, value as string)
      }
    })
    
    return {
      url: `${baseUrl}/cars?${searchParams.toString()}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: params.priority || 0.5,
    }
  })

  return [...staticPages, ...searchPages]
}

// Alternative: Generate dynamic sitemap that includes actual car listings
export async function generateDynamicSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.carsawa.africa'
  
  try {
    
    return sitemap()
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error)
    return sitemap() // Fall back to static sitemap
  }
}
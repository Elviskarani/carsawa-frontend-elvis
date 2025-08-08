// app/cars/metadata.ts
import { Metadata } from 'next'

interface SEOParams {
  brand?: string;
  price?: string;
  bodyType?: string;
  modelYear?: string;
  search?: string;
  page?: string;
}

export function generateMetadata({ searchParams }: { searchParams: SEOParams }): Metadata {
  const { brand, price, bodyType, modelYear, search, page } = searchParams;
  
  // Generate dynamic title based on filters
  const generateTitle = (): string => {
    const parts = [];
    
    if (brand) parts.push(brand);
    
    if (price) {
      const priceLabels: Record<string, string> = {
        '0-500000': 'Under KES 500K',
        '500000-1000000': 'Under KES 1M',
        '1000000-2000000': 'KES 1M - 2M',
        '2000000-3000000': 'KES 2M - 3M',
        '3000000-5000000': 'KES 3M - 5M',
        '5000000-8000000': 'KES 5M - 8M',
        '8000000-12000000': 'KES 8M - 12M',
        '12000000-20000000': 'KES 12M - 20M',
        '20000000+': 'Above KES 20M'
      };
      parts.push(priceLabels[price] || 'Cars');
    }
    
    if (bodyType) parts.push(bodyType);
    if (modelYear) parts.push(`${modelYear} Model`);
    if (search) parts.push(`"${search}"`);
    
    const title = parts.length > 0 ? parts.join(' ') + ' Cars' : 'Cars';
    const pageText = page && parseInt(page) > 1 ? ` - Page ${page}` : '';
    
    return `${title} for Sale in Kenya${pageText} | YourCarSite`;
  };

  // Generate dynamic description
  const generateDescription = (): string => {
    let description = 'Find ';
    
    if (brand && price) {
      const priceText = price.includes('1000000-2000000') ? 'under KES 2 million' :
                       price.includes('500000-1000000') ? 'under KES 1 million' :
                       price.includes('0-500000') ? 'under KES 500,000' : 'in your budget';
      description += `${brand} cars ${priceText} in Kenya. `;
    } else if (price) {
      const priceText = price.includes('1000000-2000000') ? 'cars under KES 2 million' :
                       price.includes('500000-1000000') ? 'cars under KES 1 million' :
                       price.includes('0-500000') ? 'cars under KES 500,000' : 'cars in your price range';
      description += `${priceText} in Kenya. `;
    } else if (brand) {
      description += `${brand} cars for sale in Kenya. `;
    } else {
      description += 'cars for sale in Kenya. ';
    }
    
    description += 'Browse verified listings from trusted dealers and owners. Compare prices, view photos, and contact sellers directly. Best car deals in Kenya with transparent pricing.';
    
    return description;
  };

  // Generate keywords
  const generateKeywords = (): string => {
    const keywords = ['cars for sale kenya', 'buy cars kenya', 'car dealers kenya', 'used cars kenya'];
    
    if (brand) {
      keywords.push(`${brand} cars kenya`, `${brand} for sale kenya`);
    }
    
    if (price) {
      if (price.includes('1000000')) {
        keywords.push('cars under 1 million kenya', 'affordable cars kenya');
      }
      if (price.includes('500000')) {
        keywords.push('cars under 500k kenya', 'cheap cars kenya');
      }
    }
    
    if (bodyType) {
      keywords.push(`${bodyType} cars kenya`, `${bodyType} for sale kenya`);
    }
    
    keywords.push('nairobi cars', 'mombasa cars', 'car marketplace kenya');
    
    return keywords.join(', ');
  };

  const title = generateTitle();
  const description = generateDescription();
  const keywords = generateKeywords();

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Carsawa' }],
    creator: 'Carsawa',
    publisher: 'Carsawa',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_KE',
      url: `https://www.carsawa.africa/cars${Object.keys(searchParams).length > 0 ? '?' + new URLSearchParams(searchParams as any).toString() : ''}`,
      title,
      description,
      siteName: 'Carsawa',
      images: [
        {
          url: '/carsawa.png', // Add your default OG image
          width: 1200,
          height: 630,
          alt: 'Cars for Sale in Kenya',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@carsawake', // Add your Twitter handle
      creator: '@carsawa',
      images: ['/carsawa.png'],
    },
    alternates: {
      canonical: `https://www.carsawa.africa/cars${Object.keys(searchParams).length > 0 ? '?' + new URLSearchParams(searchParams as any).toString() : ''}`,
    },
    other: {
      'theme-color': '#ffffff',
      'color-scheme': 'light',
    },
  };
}
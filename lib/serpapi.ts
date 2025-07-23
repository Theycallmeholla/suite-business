// lib/serpapi.ts

import { PlacesClient } from "@googlemaps/places";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const DATAFORSEO_API_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_API_PASSWORD = process.env.DATAFORSEO_PASSWORD;

const googleMapsClient = new PlacesClient({
  apiKey: GOOGLE_MAPS_API_KEY || "",
});

interface SerpApiResult {
  title: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  // Add other relevant fields from DataForSEO SerpAPI
  [key: string]: any
}

export async function searchGooglePlaces(query: string): Promise<SerpApiResult[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY is not set');
  }

  try {
    const response = await googleMapsClient.searchText({
      textQuery: query,
      languageCode: 'en',
      regionCode: 'us',
      // locationRestriction: {
      //   rectangle: {
      //     high: {
            
      //       latitude: 40.7128,
      //       longitude: -74.0060,
      //     },
      //     low: {
      //       latitude: 40.7128,
      //       longitude: -74.0060,
      //     }
      //   }
      // }
    }, {
      otherArgs: {
        headers: {
          'X-Goog-FieldMask': "*"
        }
      }
    });
      const result: any = [];

      response.forEach((res: any) => (
        res?.places?.forEach((place: any) => {
          result.push({
            title: place.displayName,
            address: place.formattedAddress,
            ...place
          })
        })
      ));


      return result;
      
  } catch (error: any) {
    console.error('Error searching Google Places:', error.response?.data || error.message);
    throw new Error(`Failed to search Google Places: ${error.message}`);
  }
}

export async function searchDataForSEOSerp(query: string): Promise<SerpApiResult[]> {
  if (!DATAFORSEO_API_LOGIN || !DATAFORSEO_API_PASSWORD) {
    throw new Error('DATAFORSEO_API_LOGIN or DATAFORSEO_API_PASSWORD is not set');
  }

  const auth = Buffer.from(`${DATAFORSEO_API_LOGIN}:${DATAFORSEO_API_PASSWORD}`).toString('base64');

  try {
    const response = await fetch(
      'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            keyword: query,
            location_code: 2840,
            language_code: 'en',
            device: 'desktop',
            os: 'windows',
            depth: 10,
            group_organic_results: true,
            load_async_ai_overview: true,
          },
        ]),
      }
    );

    const data = await response.json();

    if (data.status_code === 20000) {
      const results: SerpApiResult[] = [];
      data.tasks.forEach((task: any) => {
        task.result.forEach((result: any) => {
          result.items.forEach((item: any) => {
            if (item.type === 'organic') {
              results.push({
                title: item.title,
                address: item.snippet,
                website: item.url,
                rating: item.rating,
                reviews: item.reviews,
                ...item
                // Extract other relevant fields from DataForSEO
              });
            }
          });
        });
      });
      return results;
    } else {
      throw new Error(`DataForSEO API Error: ${data.status_code} - ${data.status_message}`);
    }
  } catch (error: any) {
    console.error('Error searching DataForSEO Serp:', error);
    throw new Error(`Failed to search DataForSEO Serp: ${error.message}`);
  }
}

// You can add more functions here for other DataForSEO APIs like Local Pack, Knowledge Graph, etc.

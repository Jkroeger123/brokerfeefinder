import "server-only";

import type { GoogleGeocodingResponse, AddressComponent } from "./types/maps";

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string;
  state: string;
  zipCode: string;
  streetNumber: string;
  route: string;
  neighborhood?: string;
  country: string;
}

class GeocodingError extends Error {
  constructor(
    message: string,
    public status?: GoogleGeocodingResponse["status"],
  ) {
    super(message);
    this.name = "GeocodingError";
  }
}

function getAddressComponent(
  components: AddressComponent[],
  type: AddressComponent["types"][number],
  useShortName = false,
): string {
  const component = components.find((comp) => comp.types.includes(type));
  return component
    ? useShortName
      ? component.short_name
      : component.long_name
    : "";
}

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address,
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
    );

    const data = (await response.json()) as GoogleGeocodingResponse;

    if (data.status !== "OK") {
      throw new GeocodingError(
        `Geocoding failed: ${data.error_message ?? data.status}`,
        data.status,
      );
    }

    const result = data.results[0]!;
    const { lat, lng } = result.geometry.location;
    const components = result.address_components;

    // Extract address components with proper typing
    const geocodeResult: GeocodeResult = {
      latitude: lat,
      longitude: lng,
      formattedAddress: result.formatted_address,
      streetNumber: getAddressComponent(components, "street_number"),
      route: getAddressComponent(components, "route"),
      neighborhood: getAddressComponent(components, "neighborhood"),
      city: getAddressComponent(components, "locality"),
      state: getAddressComponent(
        components,
        "administrative_area_level_1",
        true,
      ),
      zipCode: getAddressComponent(components, "postal_code"),
      country: getAddressComponent(components, "country"),
    };

    // Validation
    if (!geocodeResult.city || !geocodeResult.state) {
      throw new GeocodingError(
        "Invalid address: missing city or state information",
      );
    }

    return geocodeResult;
  } catch (error) {
    if (error instanceof GeocodingError) {
      throw error;
    }

    // Type guard for fetch errors
    if (error instanceof Error) {
      throw new GeocodingError("Failed to geocode address: " + error.message);
    }

    throw new GeocodingError("An unknown error occurred during geocoding");
  }
}

export type { GeocodeResult, GeocodingError };

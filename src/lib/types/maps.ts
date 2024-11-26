export interface GoogleGeocodingResponse {
  results: GoogleGeocodingResult[];
  status: GoogleGeocodingStatus;
  error_message?: string;
  plus_code?: {
    compound_code: string;
    global_code: string;
  };
}

export type GoogleGeocodingStatus =
  | "OK"
  | "ZERO_RESULTS"
  | "OVER_DAILY_LIMIT"
  | "OVER_QUERY_LIMIT"
  | "REQUEST_DENIED"
  | "INVALID_REQUEST"
  | "UNKNOWN_ERROR";

export interface GoogleGeocodingResult {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: {
    location: LatLngLiteral;
    location_type: LocationType;
    viewport: {
      northeast: LatLngLiteral;
      southwest: LatLngLiteral;
    };
    bounds?: {
      northeast: LatLngLiteral;
      southwest: LatLngLiteral;
    };
  };
  place_id: string;
  plus_code?: {
    compound_code: string;
    global_code: string;
  };
  types: string[];
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: AddressType[];
}

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export type LocationType =
  | "ROOFTOP"
  | "RANGE_INTERPOLATED"
  | "GEOMETRIC_CENTER"
  | "APPROXIMATE";

export type AddressType =
  | "street_number"
  | "route"
  | "subpremise"
  | "premise"
  | "neighborhood"
  | "sublocality"
  | "sublocality_level_1"
  | "sublocality_level_2"
  | "sublocality_level_3"
  | "sublocality_level_4"
  | "sublocality_level_5"
  | "locality"
  | "administrative_area_level_1"
  | "administrative_area_level_2"
  | "administrative_area_level_3"
  | "administrative_area_level_4"
  | "administrative_area_level_5"
  | "country"
  | "postal_code"
  | "postal_code_suffix";

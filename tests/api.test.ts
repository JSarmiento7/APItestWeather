import { test, expect } from '@playwright/test';
import { config } from '@config/config';  // Import the config using the alias

// Helper function to handle API requests with error handling
const fetchApi = async (url: string) => {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${data.message || 'Unknown error'}`);
    }

    return { response, data };
  } catch (error: unknown) {
    console.error(`Error fetching URL: ${url}`, error);
    throw error;  // Rethrow the error for the test to fail
  }
};

// Helper to catch errors and simplify output
const handleError = (error: unknown) => {
  // Check if the error is an instance of Error, then safely access error properties
  if (error instanceof Error) {
    console.error(`Test failed due to error: ${error.message}`);
  } else {
    // If the error is not an instance of Error, log a generic message
    console.error('Test failed due to an unknown error');
  }
  throw error; // Rethrow so the test still fails
};

// Happy path: Check weather using city name
test('Check weather using city name', async () => {
  const { baseUrl: geocodingBaseUrl } = config.baseCalls.geocoding;
  const { key } = config;
  const city = config.cityName;

  try {
    // Step 1: Use geocoding API to get the lat and lon of the city
    const geocodingUrl = `${geocodingBaseUrl}${city}&appid=${key}`;
    const { response: geocodingResponse, data: geocodingData } = await fetchApi(geocodingUrl);
    
    expect(geocodingResponse.status).toBe(200);
    expect(geocodingData.length).toBeGreaterThan(0);  // Ensure at least one result
    const { lat, lon } = geocodingData[0];  // Get lat and lon from the first result

    // Step 2: Use the coordinates to call the One Call API
    const { baseUrl: oneCallBaseUrl } = config.baseCalls.oneCall;
    const oneCallUrl = `${oneCallBaseUrl}lat=${lat}&lon=${lon}&appid=${key}`;

    const { response: oneCallResponse, data: oneCallData } = await fetchApi(oneCallUrl);
    
    expect(oneCallResponse.status).toBe(200);
    expect(oneCallData).toHaveProperty('current');
    expect(oneCallData.current).toHaveProperty('temp');
    expect(oneCallData.current).toHaveProperty('weather');

    console.log(`Successfully retrieved weather data for ${city}`);
  } catch (error: unknown) {
    handleError(error); // Handle and simplify error output
  }
});

// Edge Case - Check weather using sea coordinates
test('Check weather using sea coordinates', async () => {
  const { baseUrl } = config.baseCalls.oneCall;
  const { key } = config;
  const lat = config.coordinates.sea.lat;
  const lon = config.coordinates.sea.lon;

  const url = `${baseUrl}lat=${lat}&lon=${lon}&appid=${key}`;  // Construct the URL using the config

  try {
    const { response, data } = await fetchApi(url);
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('current');  // Check if the 'current' field exists in the response
    console.log(`Successfully retrieved weather data for coordinates (Lat: ${lat}, Lon: ${lon})`);
  } catch (error: unknown) {
    handleError(error); // Handle and simplify error output
  }
});

// Edge Case - Expected wrong coordinates for One Call API
test('Check weather using expected wrong coordinates', async () => {
  const { baseUrl } = config.baseCalls.oneCall;
  const { key } = config;
  const lat = config.coordinates.sea.lat;
  const lon = "190";  // Invalid longitude

  const url = `${baseUrl}lat=${lat}&lon=${lon}&appid=${key}`;  // Construct the URL using the config

  // Make the API request
  const response = await fetch(url);
  const data = await response.json();

  // Check if the error status is returned
  expect(response.status).toBe(400);
});

// Edge Case - User input had a typo in city, should return error code
test('Check weather using city name with typo', async () => {
  const { baseUrl: geocodingBaseUrl } = config.baseCalls.geocoding;
  const { key } = config;
  const city = config.typoName;

  try {
    // Step 1: Use geocoding API to get the lat and lon of the city
    const geocodingUrl = `${geocodingBaseUrl}${city}&appid=${key}`;
    const { response: geocodingResponse, data: geocodingData } = await fetchApi(geocodingUrl);
    
    expect(geocodingResponse.status).toBe(200);
    expect(geocodingData.length).toBeGreaterThan(0);  // Ensure at least one result
    const { lat, lon } = geocodingData[0];  // Get lat and lon from the first result

    // Step 2: Use the coordinates to call the One Call API
    const { baseUrl: oneCallBaseUrl } = config.baseCalls.oneCall;
    const oneCallUrl = `${oneCallBaseUrl}lat=${lat}&lon=${lon}&appid=${key}`;

    const { response: oneCallResponse, data: oneCallData } = await fetchApi(oneCallUrl);
    
    expect(oneCallResponse.status).toBe(200);
    expect(oneCallData).toHaveProperty('current');
    expect(oneCallData.current).toHaveProperty('temp');
    expect(oneCallData.current).toHaveProperty('weather');

    console.log(`Successfully retrieved weather data for ${city}`);
  } catch (error: unknown) {
    handleError(error); // Handle and simplify error output
  }
});



# Location Module Documentation

This module provides location data services for both the frontend dashboard and mobile app. It serves static data files through API endpoints without requiring database storage.

## File Structure

```
src/api/location/
├── controllers/
│   └── location.js          # API request handlers
├── data/                    # Location data files
│   ├── index.js             # Main location data service
│   ├── README.md            # Data documentation
│   └── states/              # State-specific data files
│       └── chhattisgarh.js  # Chhattisgarh location data
├── routes/
│   └── location.js          # API endpoint definitions
└── services/
    └── location.js          # Business logic services
```

## API Endpoints

### Base URL
```
https://your-backend-url.com/api/location
```

### Available Endpoints

#### 1. Get All States
```http
GET /location/states
```

**Response:**
```json
{
  "data": [
    {
      "id": "chhattisgarh",
      "name": "Chhattisgarh",
      "code": "CG",
      "isActive": true
    }
  ],
  "meta": {
    "total": 1
  }
}
```

#### 2. Get Districts for a State
```http
GET /location/states/{stateId}/districts
```

**Response:**
```json
{
  "data": [
    {
      "name": "BALOD",
      "citiesCount": 286
    },
    {
      "name": "RAIPUR",
      "citiesCount": 450
    }
  ],
  "meta": {
    "stateId": "chhattisgarh",
    "stateName": "Chhattisgarh",
    "total": 27
  }
}
```

#### 3. Get Cities for a District
```http
GET /location/states/{stateId}/districts/{districtName}/cities
```

**Response:**
```json
{
  "data": [
    {
      "name": "Gabdi",
      "pincode": "491225"
    },
    {
      "name": "Hadgahan",
      "pincode": "491225"
    }
  ],
  "meta": {
    "stateId": "chhattisgarh",
    "stateName": "Chhattisgarh",
    "districtName": "BALOD",
    "total": 286
  }
}
```

#### 4. Search Cities in a State
```http
GET /location/states/{stateId}/cities/search?q={searchTerm}&limit={limit}
```

**Parameters:**
- `q`: Search term (minimum 2 characters)
- `limit`: Maximum results (default: 50)

**Response:**
```json
{
  "data": [
    {
      "name": "Gariaband",
      "pincode": "493889",
      "district": "GARIABAND"
    }
  ],
  "meta": {
    "stateId": "chhattisgarh",
    "stateName": "Chhattisgarh",
    "searchTerm": "gar",
    "total": 145,
    "hasMore": true
  }
}
```

#### 5. Get City by Pincode
```http
GET /location/pincode/{pincode}
```

**Response:**
```json
{
  "data": {
    "pincode": "491225",
    "city": "Gabdi",
    "district": "BALOD",
    "state": "Chhattisgarh",
    "stateId": "chhattisgarh"
  }
}
```

#### 6. Validate Pincode in State
```http
GET /location/validate/states/{stateId}/pincode/{pincode}
```

**Response:**
```json
{
  "data": {
    "pincode": "491225",
    "stateId": "chhattisgarh",
    "stateName": "Chhattisgarh",
    "isValid": true,
    "city": "Gabdi",
    "district": "BALOD",
    "state": "Chhattisgarh"
  }
}
```

#### 7. Get Complete State Data
```http
GET /location/states/{stateId}/complete
```

Returns the complete dataset for a state (useful for development/testing).

## Frontend Integration Examples

### React Native (Mobile App)
```javascript
// utils/locationApi.js
const API_BASE = 'https://your-backend-url.com/api';

export const locationApi = {
  getStates: async () => {
    const response = await fetch(`${API_BASE}/location/states`);
    return response.json();
  },

  getDistricts: async (stateId) => {
    const response = await fetch(`${API_BASE}/location/states/${stateId}/districts`);
    return response.json();
  },

  getCities: async (stateId, districtName) => {
    const response = await fetch(`${API_BASE}/location/states/${stateId}/districts/${encodeURIComponent(districtName)}/cities`);
    return response.json();
  },

  searchCities: async (stateId, query) => {
    const response = await fetch(`${API_BASE}/location/states/${stateId}/cities/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  validatePincode: async (stateId, pincode) => {
    const response = await fetch(`${API_BASE}/location/validate/states/${stateId}/pincode/${pincode}`);
    return response.json();
  }
};

// Usage in signup form
import { locationApi } from '../utils/locationApi';

const [states, setStates] = useState([]);
const [districts, setDistricts] = useState([]);
const [cities, setCities] = useState([]);

useEffect(() => {
  locationApi.getStates().then(response => {
    setStates(response.data);
  });
}, []);

const handleStateChange = async (stateId) => {
  const response = await locationApi.getDistricts(stateId);
  setDistricts(response.data);
  setCities([]); // Reset cities
};

const handleDistrictChange = async (stateId, districtName) => {
  const response = await locationApi.getCities(stateId, districtName);
  setCities(response.data);
};
```

### React Dashboard
```javascript
// hooks/useLocation.ts
import { useQuery } from '@tanstack/react-query';
import { locationApi } from '../utils/locationApi';

export const useStates = () => {
  return useQuery({
    queryKey: ['location', 'states'],
    queryFn: locationApi.getStates,
  });
};

export const useDistricts = (stateId: string) => {
  return useQuery({
    queryKey: ['location', 'districts', stateId],
    queryFn: () => locationApi.getDistricts(stateId),
    enabled: !!stateId,
  });
};

export const useCities = (stateId: string, districtName: string) => {
  return useQuery({
    queryKey: ['location', 'cities', stateId, districtName],
    queryFn: () => locationApi.getCities(stateId, districtName),
    enabled: !!stateId && !!districtName,
  });
};

// Usage in component
const LocationSelector = () => {
  const { data: states } = useStates();
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  const { data: districts } = useDistricts(selectedState);
  const { data: cities } = useCities(selectedState, selectedDistrict);

  return (
    <div>
      <select onChange={(e) => setSelectedState(e.target.value)}>
        <option value="">Select State</option>
        {states?.data.map(state => (
          <option key={state.id} value={state.id}>{state.name}</option>
        ))}
      </select>
      
      <select onChange={(e) => setSelectedDistrict(e.target.value)}>
        <option value="">Select District</option>
        {districts?.data.map(district => (
          <option key={district.name} value={district.name}>{district.name}</option>
        ))}
      </select>
      
      <select>
        <option value="">Select City</option>
        {cities?.data.map(city => (
          <option key={city.name} value={city.name}>
            {city.name} - {city.pincode}
          </option>
        ))}
      </select>
    </div>
  );
};
```

## Adding New States

1. Create a new state data file in `src/api/location/data/states/{stateName}.js`
2. Follow the same structure as `chhattisgarh.js`:
   ```javascript
   export const STATE_NAME_DATA = {
     state: "State Name",
     districts: [
       {
         name: "DISTRICT_NAME",
         pincodes: [
           {
             name: "City Name",
             pincode: "123456"
           }
         ]
       }
     ]
   };
   ```
3. Update `src/api/location/data/index.js`:
   - Add the state to the `STATES` array
   - Add the state data to `STATE_DATA_MAP`

## Features

- **No Database Required**: Serves static data files
- **Fast Response**: Data is loaded in memory
- **Scalable**: Easy to add new states
- **Search Functionality**: City name search with fuzzy matching
- **Validation**: Pincode validation for specific states
- **Autocomplete Ready**: Optimized for dropdown and autocomplete UIs
- **Mobile & Web Compatible**: Same API works for both platforms
- **Modular Structure**: All location data contained within the location module

## Performance Notes

- Data is loaded into memory on server start
- Very fast response times for all operations
- Suitable for datasets up to several MB
- Consider implementing caching headers for production

## Current Data Coverage

- **Chhattisgarh**: 27 districts, 6000+ cities/villages with pincodes
- **Future**: Ready to add more states as data becomes available
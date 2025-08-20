# Location Data Module

This directory contains all location data files for the location API module.

## Structure

```
src/api/location/data/
├── index.js              # Main location data service
├── README.md             # This file
└── states/               # State-specific data files
    └── chhattisgarh.js   # Chhattisgarh location data
```

## Adding New States

1. Create a new state data file in `states/{stateName}.js`
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
3. Update `index.js`:
   - Add the state to the `STATES` array
   - Add the state data to `STATE_DATA_MAP`

## Data Format

Each state data file should export an object with:
- `state`: State name
- `districts`: Array of district objects
  - `name`: District name
  - `pincodes`: Array of city objects
    - `name`: City/village name
    - `pincode`: 6-digit pincode

## Current Coverage

- **Chhattisgarh**: 27 districts, 6000+ cities/villages
- **Ready for expansion**: Framework ready for more states 
# Manual Business Category Reset Guide

## Current Situation
The business categories currently have non-sequential IDs due to Strapi's auto-incrementing behavior:
- ID: 2, Name: Electronics
- ID: 5, Name: test  
- ID: 7, Name: tesrt2
- ID: 9, Name: test34
- ID: 11, Name: Fashion
- ID: 13, Name: Home & Garden
- ID: 15, Name: Sports & Outdoors

## Problem
The frontend expects sequential IDs (1, 2, 3, 4) but the actual IDs are scattered due to other content types using the lower IDs.

## Solution: Manual Reset Through Admin Panel

### Step 1: Access Admin Panel
1. Go to `http://192.168.1.101:1337/admin`
2. Login with admin credentials:
   - Email: `admin@gmail.com`
   - Password: `Admin@123`

### Step 2: Delete All Business Categories
1. Navigate to **Content Manager** → **Business Category**
2. Select all business categories (check the boxes)
3. Click **Delete** and confirm
4. This will permanently delete all business categories

### Step 3: Create New Business Categories with Sequential IDs
1. Click **Create new entry**
2. Create the following categories in order:

#### Category 1 (ID: 1)
- **Name:** Electronics
- **Description:** Electronic devices and gadgets
- **Is Active:** ✅ (checked)
- **Sort Order:** 1

#### Category 2 (ID: 2)
- **Name:** Fashion
- **Description:** Clothing and accessories
- **Is Active:** ✅ (checked)
- **Sort Order:** 2

#### Category 3 (ID: 3)
- **Name:** Home & Garden
- **Description:** Home improvement and garden products
- **Is Active:** ✅ (checked)
- **Sort Order:** 3

#### Category 4 (ID: 4)
- **Name:** Sports & Outdoors
- **Description:** Sports equipment and outdoor gear
- **Is Active:** ✅ (checked)
- **Sort Order:** 4

### Step 4: Verify the Reset
1. Check that all business categories now have sequential IDs (1, 2, 3, 4)
2. Test the signup form to ensure business category selection works correctly

## Alternative: Accept Current IDs

If manual reset is not preferred, the frontend can work with the current IDs:
- ID: 2 (Electronics)
- ID: 5 (test)
- ID: 7 (tesrt2)
- ID: 9 (test34)
- ID: 11 (Fashion)
- ID: 13 (Home & Garden)
- ID: 15 (Sports & Outdoors)

The signup form will automatically use these actual IDs, which is perfectly fine for functionality.

## Recommendation
**Option 1:** Perform manual reset for clean sequential IDs (1, 2, 3, 4)
**Option 2:** Keep current IDs and ensure frontend works with actual IDs

Both approaches will work correctly - it's a matter of preference for ID organization. 
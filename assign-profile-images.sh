#!/bin/bash

API_URL="http://localhost:1337"
API_TOKEN="e84e26b9a4c2d8f27bde949afc61d52117e19563be11d5d9ebc8598313d72d1b49d230e28458cfcee1bccd7702ca542a929706c35cde1a62b8f0ab6f185ae74c9ce64c0d8782c15bf4186c29f4fc5c7fdd4cfdd00938a59a636a32cb243b9ca7c94242438ff5fcd2fadbf40a093ea593e96808af49ad97cbeaed977e319614b5"

echo "🔄 Assigning profile images to vendors..."

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
sleep 10

# Test server connection
echo "🔍 Testing server connection..."
if curl -s -f "$API_URL/api/vendors/1" > /dev/null; then
    echo "✅ Server is ready"
else
    echo "❌ Server not ready, please start the Strapi server first"
    exit 1
fi

# Assign coffee beans image to FreshMart (ID: 1)
echo "📸 Assigning coffee beans image to FreshMart..."
FRESHMART_RESPONSE=$(curl -s -w "%{http_code}" -X PUT \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": {"profileImage": 30}}' \
  "$API_URL/api/vendors/1")

HTTP_CODE="${FRESHMART_RESPONSE: -3}"
RESPONSE_BODY="${FRESHMART_RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Assigned coffee beans image to FreshMart (ID: 1)"
else
    echo "❌ Failed to assign image to FreshMart (HTTP: $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
fi

# Assign beautiful picture to CityBakery (ID: 2)
echo "📸 Assigning beautiful picture to CityBakery..."
CITYBAKERY_RESPONSE=$(curl -s -w "%{http_code}" -X PUT \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": {"profileImage": 8}}' \
  "$API_URL/api/vendors/2")

HTTP_CODE="${CITYBAKERY_RESPONSE: -3}"
RESPONSE_BODY="${CITYBAKERY_RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Assigned beautiful picture to CityBakery (ID: 2)"
else
    echo "❌ Failed to assign image to CityBakery (HTTP: $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
fi

# Verify the updates
echo ""
echo "📋 Verifying updates..."

echo "FreshMart profile image:"
curl -s -H "Authorization: Bearer $API_TOKEN" "$API_URL/api/vendors/1?populate=profileImage" | jq -r '.data.profileImage.id // "null"'

echo "CityBakery profile image:"
curl -s -H "Authorization: Bearer $API_TOKEN" "$API_URL/api/vendors/2?populate=profileImage" | jq -r '.data.profileImage.id // "null"'

echo ""
echo "🎉 Profile images assignment completed!" 
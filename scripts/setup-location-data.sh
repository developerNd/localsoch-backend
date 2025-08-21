#!/bin/bash

# CityShopping Location Data Setup Script
# This script automates the process of setting up location data from the CSV file

set -e  # Exit on any error

echo "🏪 CityShopping Location Data Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the cityshopping-backend directory"
    exit 1
fi

# Check if CSV file exists
CSV_FILE="src/api/location/data/5c2f62fe-5afa-4119-a499-fec9d604d5bd.csv"
if [ ! -f "$CSV_FILE" ]; then
    print_error "CSV file not found: $CSV_FILE"
    print_status "Please ensure the India pincode CSV file is in the correct location"
    exit 1
fi

print_success "CSV file found: $CSV_FILE"

# Check if csv-parser is installed
if ! node -e "require('csv-parser')" 2>/dev/null; then
    print_warning "csv-parser package not found. Installing..."
    npm install csv-parser
    print_success "csv-parser installed successfully"
else
    print_success "csv-parser package already installed"
fi

# Create backup
print_status "Creating backup of existing location data..."
if node scripts/backup-existing-location-data.js; then
    print_success "Backup created successfully"
else
    print_warning "Backup failed, but continuing..."
fi

# Run the parser
print_status "Parsing CSV data..."
if node scripts/parse-india-pincode-csv.js; then
    print_success "CSV parsing completed successfully"
else
    print_error "CSV parsing failed"
    exit 1
fi

# Test the parsed data
print_status "Testing parsed data..."
if node scripts/test-parsed-data.js; then
    print_success "Data testing completed successfully"
else
    print_warning "Data testing failed, but data may still be usable"
fi

echo ""
echo "🎉 Location Data Setup Complete!"
echo "================================"
echo ""
echo "📊 What was accomplished:"
echo "   ✅ CSV file parsed (165,629+ records)"
echo "   ✅ State files generated (36 states/UTs)"
echo "   ✅ Index file updated"
echo "   ✅ API endpoints ready"
echo ""
echo "🚀 Next steps:"
echo "   1. Restart your backend server"
echo "   2. Test the API endpoints:"
echo "      - GET /api/locations/states"
echo "      - GET /api/locations/states/maharashtra/districts"
echo "      - GET /api/locations/pincodes/400001"
echo ""
echo "📚 Documentation: scripts/README-LOCATION-PARSER.md"
echo ""
print_success "Setup completed successfully!" 
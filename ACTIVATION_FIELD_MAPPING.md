# Activation Field Mapping Documentation

This document outlines the field mapping between the backend `ActivationDTO` and the frontend Vue components.

## Backend DTO Structure (com.tonetracker.tonertracker_api.model.ActivationDTO)

### Required Fields
- `name` (String, max 200 chars) - Activation name
- `clientId` (Long) - Client ID reference
- `startDate` (LocalDate) - Start date in yyyy-MM-dd format
- `endDate` (LocalDate) - End date in yyyy-MM-dd format  
- `startTime` (LocalTime) - Start time in HH:mm format
- `endTime` (LocalTime) - End time in HH:mm format
- `locationName` (String, max 200 chars) - Location/venue name
- `streetAddress` (String, max 200 chars) - Street address
- `latitude` (BigDecimal, -90 to 90) - Latitude coordinate
- `longitude` (BigDecimal, -180 to 180) - Longitude coordinate
- `status` (ActivationStatus enum) - PLANNED, ACTIVE, COMPLETED, CANCELLED

### Optional Fields
- `id` (Long) - Auto-generated ID
- `city` (String, max 50 chars) - City name
- `zipCode` (String, max 10 chars) - Zip/postal code
- `activationManagerId` (Long) - Staff ID of activation manager
- `activationManagerName` (String) - Read-only manager name
- `assignedPromoterIds` (List<Long>) - List of promoter IDs
- `assignedPromoters` (List<PromoterSummaryDTO>) - Read-only promoter details
- `briefDescription` (String, max 2000 chars) - Brief description
- `briefDocumentPath` (String) - Path to uploaded PDF brief
- `centralLatitude` (BigDecimal) - Calculated central latitude
- `centralLongitude` (BigDecimal) - Calculated central longitude

### Performance/Analytics Fields (Read-only)
- `clientCompanyName` (String) - Client company name
- `clientBrandName` (String) - Client brand name
- `totalRevenueUSD` (BigDecimal) - Total revenue in USD
- `totalRevenueZWL` (BigDecimal) - Total revenue in ZWL
- `totalUnitsSold` (Integer) - Total units sold
- `totalCustomerEngagements` (Integer) - Total customer interactions
- `totalHoursWorked` (Integer) - Total hours worked
- `performancePercentage` (BigDecimal) - Performance percentage
- `dateCreated` (OffsetDateTime) - Creation timestamp
- `lastUpdated` (OffsetDateTime) - Last update timestamp

## Frontend Field Mapping

### CreateActivation.vue
**Step 1: Basic Information**
- `formData.name` → `name`
- `formData.clientId` → `clientId`
- `formData.status` → `status`
- `formData.briefDescription` → `briefDescription`

**Step 2: Schedule & Location**
- `formData.startDate` → `startDate` (Date object converted to yyyy-MM-dd)
- `formData.endDate` → `endDate` (Date object converted to yyyy-MM-dd)
- `formData.startTime` → `startTime` (Date object converted to HH:mm)
- `formData.endTime` → `endTime` (Date object converted to HH:mm)
- `formData.locationName` → `locationName`
- `formData.streetAddress` → `streetAddress`
- `formData.city` → `city`
- `formData.zipCode` → `zipCode`
- `formData.latitude` → `latitude`
- `formData.longitude` → `longitude`

**Step 3: Team Assignment**
- `formData.activationManagerId` → `activationManagerId`
- `formData.assignedPromoterIds` → `assignedPromoterIds`

### EditActivation.vue
Uses identical field mapping as CreateActivation.vue but loads existing data first.

Additional features:
- File upload for `briefDocumentPath`
- Validation matching backend constraints
- Progress tracking through 4 steps

### ActivationDetails.vue
**Display Fields:**
- Shows all DTO fields in appropriate sections
- Uses computed properties for formatting
- Displays performance metrics and analytics
- Shows team assignment details
- Includes coordinate display and map integration

**Key Display Mappings:**
- `activation.clientCompanyName` - Company name in header
- `activation.locationName` - Location in header and details
- `activation.totalRevenueUSD` - Revenue display
- `activation.performancePercentage` - Performance progress bar
- `activation.totalCustomerEngagements` - Engagement metrics
- `activation.totalHoursWorked` - Hours worked display

## Status Enum Values
Frontend status options map to backend `ActivationStatus` enum:
- `'PLANNED'` → `PLANNED`
- `'ACTIVE'` → `ACTIVE` 
- `'COMPLETED'` → `COMPLETED`
- `'CANCELLED'` → `CANCELLED`

## Date/Time Formatting
- **Frontend to Backend**: Date objects converted using `toISOString().split('T')[0]` for dates and `toTimeString().slice(0, 5)` for times
- **Backend to Frontend**: ISO strings parsed as Date objects for Calendar components

## Validation Rules
Frontend validation mirrors backend Jakarta validation:
- Required field validation matches `@NotNull` and `@NotBlank` annotations
- String length validation matches `@Size` constraints
- Numeric range validation matches `@DecimalMin` and `@DecimalMax` constraints

## API Integration Points
- **Create**: `POST /api/activations` with DTO structure
- **Update**: `PUT /api/activations/{id}` with DTO structure  
- **Get**: `GET /api/activations/{id}` returns DTO structure
- **File Upload**: Separate endpoint for `briefDocumentPath` file handling

This mapping ensures consistency between frontend and backend data structures and provides a clear reference for developers working on either side of the application.
# Updated API Endpoints for Activation Management

This document contains the corrected API endpoints used in the activation management system.

## Fixed API Endpoints

### User Management - Activation Managers

**CORRECTED ENDPOINT:**
```javascript
userService.getUsersByRole('ACTIVATION_MANAGER', { size: 100 })
// Maps to: GET /api/users/by-role?role=ACTIVATION_MANAGER&size=100
// Backend: UserResource.java:76-80
// Returns: Array of users with ACTIVATION_MANAGER role
```

**Response Format:**
```json
[
  {
    "id": 1,
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@company.com",
    "role": "ACTIVATION_MANAGER",
    "active": true
  }
]
```

### Other API Endpoints

#### Client Management
```javascript
clientService.getClients({ size: 100 })
// Maps to: GET /api/clients?size=100
// Returns: Paginated response with client data
```

#### Promoter Management
```javascript
promoterService.getPromoters({ size: 100 })
// Maps to: GET /api/promoters?size=100
// Returns: Paginated response with promoter data
```

#### Activation Management
```javascript
// Create activation
activationService.createActivation(activationData)
// Maps to: POST /api/activations

// Get activation details
activationService.getActivation(id)
// Maps to: GET /api/activations/{id}

// Update activation
activationService.updateActivation(id, updateData)
// Maps to: PUT /api/activations/{id}
```

## Updated Code Changes

### 1. Added new method to userService (api.js):
```javascript
async getUsersByRole(role, params = {}) {
    const queryParams = { role, ...params }
    return await apiService.get('/users/by-role', { params: queryParams })
}
```

### 2. Updated CreateActivation.vue:
```javascript
// BEFORE:
userService.getUsers({ role: 'ACTIVATION_MANAGER', size: 100 })

// AFTER:
userService.getUsersByRole('ACTIVATION_MANAGER', { size: 100 })
```

### 3. Updated EditActivation.vue:
```javascript
// BEFORE:
userService.getUsers({ role: 'ACTIVATION_MANAGER' })

// AFTER:
userService.getUsersByRole('ACTIVATION_MANAGER')
```

## Data Transformation

The response handling remains the same for all endpoints:

```javascript
// Transform managers data from by-role endpoint
managerOptions.value = (managersResponse.data || managersResponse || []).map(manager => ({
  label: `${manager.firstName} ${manager.lastName}`,
  value: manager.id
}))
```

Note: The by-role endpoint may return a direct array instead of a paginated response, so the code handles both formats.

## Benefits of Correct Endpoint Usage

✅ **Proper Backend Integration**: Uses the actual endpoint implemented in UserResource.java  
✅ **Performance**: Dedicated endpoint for role-based queries is more efficient  
✅ **Consistency**: Follows backend API design patterns  
✅ **Maintainability**: Uses the correct RESTful endpoint structure  

## Testing Recommendations

1. **Verify Endpoint Response**: Test `/api/users/by-role?role=ACTIVATION_MANAGER` directly
2. **Check Data Format**: Ensure response format matches expectations
3. **Error Handling**: Test with invalid roles and network failures
4. **Performance**: Compare response times with the corrected endpoint

This update ensures the frontend uses the correct backend API endpoints as implemented in your Java Spring Boot application.
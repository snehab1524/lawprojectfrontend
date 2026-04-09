# Get Legal Advice Section Fixes

## Issues Found:
1. Hardcoded clientId=1 in frontend/backend
2. No auth protection on routes
3. Model missing lawyerId, answer field
4. No error handling/loading states
5. Routes not mounted? (check server.js)
6. Pages not in App.jsx routes

## Plan:
1. Update model + add associations
2. Add auth to controller/routes
3. Fix frontend to use current user ID + adviceApi.js
4. Add lawyer answer endpoint
5. Add routes to App.jsx
6. Test

Proceed step-by-step.

# ZundeNova AI Integration Testing Guide

## Overview
This document outlines the testing procedures for the comprehensive FastAPI AI service integration with the ZundeNova platform.

## Test Environment Setup

### 1. Start All Services
```bash
# From project root
docker-compose up --build
```

### 2. Verify Service Health
```bash
# Check Node.js API
curl http://localhost:3001/health

# Check FastAPI AI Service
curl http://localhost:8000/health

# Check FastAPI AI Service health via Node.js proxy
curl -H "Authorization: Bearer demo-token" http://localhost:3001/api/ai/health/fastapi
```

## API Endpoint Testing

### 1. Vision Diagnostics
```bash
# Test vision diagnosis endpoint
curl -X POST http://localhost:3001/api/ai/vision/diagnose \
  -H "Content-Type: multipart/form-data" \
  -H "Authorization: Bearer demo-token" \
  -F "image=@test-plant-image.jpg" \
  -F "cropType=maize" \
  -F "location={\"lat\":-1.2921,\"lon\":36.8219}"
```

### 2. NDVI Analysis
```bash
# Test NDVI analysis endpoint
curl -X POST http://localhost:3001/api/ai/geo/ndvi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-token" \
  -d '{
    "fieldId": "test_field_001",
    "date": "2024-01-15",
    "bbox": [36.8, -1.3, 36.9, -1.2]
  }'
```

### 3. Enhanced AI Chat
```bash
# Test enhanced AI chat endpoint
curl -X POST http://localhost:3001/api/ai/chat/enhanced \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-token" \
  -d '{
    "text": "My maize plants have yellow leaves. What should I do?",
    "language": "en",
    "farmId": "test_farm_001"
  }'
```

## Frontend Testing

### 1. Web Application
- Navigate to http://localhost:3000/diagnostics
- Test vision diagnostics component
- Navigate to http://localhost:3000/ndvi
- Test NDVI analysis component
- Test enhanced AI chat in existing chat component

### 2. Mobile Application
- Start Expo development server: `cd apps/mobile && pnpm start`
- Test enhanced diagnostic screen
- Test AI service integration with offline storage
- Verify fallback mechanisms when services are unavailable

## Integration Testing

### 1. Service Communication
- Verify Node.js API can communicate with FastAPI service
- Test fallback mechanisms when FastAPI service is unavailable
- Verify proper error handling and user feedback

### 2. Offline Functionality
- Test offline storage of AI results
- Verify cached results are used when services are unavailable
- Test synchronization when services come back online

### 3. Authentication & Authorization
- Verify all AI endpoints require authentication
- Test with invalid tokens
- Verify proper error responses

## Performance Testing

### 1. Load Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test vision diagnosis endpoint
ab -n 100 -c 10 -H "Authorization: Bearer demo-token" \
  -p test-payload.json -T application/json \
  http://localhost:3001/api/ai/vision/diagnose
```

### 2. Response Time Testing
- Vision diagnosis: < 5 seconds
- NDVI analysis: < 3 seconds
- AI chat: < 2 seconds

## Error Handling Testing

### 1. Service Unavailability
- Stop FastAPI service and test fallback mechanisms
- Verify graceful degradation to mock responses
- Test error messages are user-friendly

### 2. Invalid Inputs
- Test with invalid image formats
- Test with malformed NDVI requests
- Test with empty chat messages

## Security Testing

### 1. Authentication
- Test endpoints without authentication tokens
- Test with expired or invalid tokens
- Verify proper 401/403 responses

### 2. Input Validation
- Test with oversized images
- Test with malicious payloads
- Verify proper input sanitization

## Monitoring & Logging

### 1. Service Logs
```bash
# View Node.js API logs
docker-compose logs api

# View FastAPI service logs
docker-compose logs ai-service
```

### 2. Health Monitoring
- Monitor service health endpoints
- Check for memory leaks during extended testing
- Verify proper resource cleanup

## Expected Results

### 1. Vision Diagnostics
```json
{
  "diseases": [
    {
      "label": "Healthy Plant",
      "score": 0.85,
      "treatment_uri": "https://zundenova.com/treatments/healthy"
    }
  ],
  "severity": "low",
  "explainability": {
    "saliency_uri": "https://zundenova.com/explain/mock-saliency.png"
  },
  "trace_id": "uuid-string"
}
```

### 2. NDVI Analysis
```json
{
  "ndvi_mean": 0.67,
  "ndvi_std": 0.12,
  "map_uri": "https://zundenova.com/maps/field.png",
  "advice": "Your field shows healthy vegetation growth."
}
```

### 3. AI Chat
```json
{
  "answer": "Based on your query about farming...",
  "citations": ["https://zundenova.com/docs/agronomy"],
  "confidence": 0.82,
  "handoff": null
}
```

## Troubleshooting

### Common Issues
1. **ONNX Runtime not found**: Service falls back to mock implementation
2. **Authentication failures**: Check token format and expiration
3. **Service communication errors**: Verify Docker network connectivity
4. **Image processing errors**: Check image format and size limits

### Debug Commands
```bash
# Check service connectivity
docker-compose exec api ping ai-service

# View detailed logs
docker-compose logs --follow ai-service

# Test FastAPI service directly
curl http://localhost:8000/
```

## Success Criteria
- All API endpoints respond correctly
- Frontend components integrate seamlessly
- Offline functionality works as expected
- Error handling is graceful and informative
- Performance meets specified requirements
- Security measures are properly implemented

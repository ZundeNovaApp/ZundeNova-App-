import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/:location', async (req: AuthenticatedRequest, res) => {
  try {
    const { location } = req.params;
    
    const weatherData = {
      location,
      temperature: 26,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      pressure: 1013,
      uvIndex: 6,
      visibility: 10,
      dewPoint: 18,
      forecast: [
        { 
          day: 'Today', 
          high: 28, 
          low: 18, 
          condition: 'Sunny',
          humidity: 60,
          windSpeed: 10,
          precipitation: 0
        },
        { 
          day: 'Tomorrow', 
          high: 30, 
          low: 20, 
          condition: 'Partly Cloudy',
          humidity: 65,
          windSpeed: 12,
          precipitation: 10
        },
        { 
          day: 'Day 3', 
          high: 27, 
          low: 19, 
          condition: 'Light Rain',
          humidity: 75,
          windSpeed: 15,
          precipitation: 60
        },
        { 
          day: 'Day 4', 
          high: 25, 
          low: 17, 
          condition: 'Thunderstorms',
          humidity: 80,
          windSpeed: 20,
          precipitation: 85
        },
        { 
          day: 'Day 5', 
          high: 29, 
          low: 21, 
          condition: 'Sunny',
          humidity: 55,
          windSpeed: 8,
          precipitation: 0
        }
      ],
      alerts: [
        {
          type: 'rainfall',
          severity: 'moderate',
          message: 'Heavy rainfall expected in 2 days. Consider harvesting mature crops.',
          validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000)
        }
      ],
      soilMoisture: {
        current: 45,
        optimal: 60,
        recommendation: 'Consider irrigation in the next 24 hours'
      },
      plantingAdvice: {
        suitable: ['maize', 'beans', 'tomatoes'],
        notSuitable: ['wheat'],
        generalAdvice: 'Good conditions for planting drought-resistant crops'
      }
    };
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather service error:', error);
    res.status(500).json({ error: 'Weather data unavailable' });
  }
});

router.get('/:location/alerts', async (req: AuthenticatedRequest, res) => {
  try {
    const { location } = req.params;
    
    const alerts = [
      {
        id: '1',
        type: 'pest_risk',
        severity: 'high',
        title: 'Fall Armyworm Alert',
        message: 'High risk of fall armyworm infestation in maize crops. Monitor fields closely.',
        location,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        recommendations: [
          'Scout fields daily for egg masses',
          'Apply biological control agents',
          'Consider early harvest if infestation is severe'
        ]
      },
      {
        id: '2',
        type: 'weather',
        severity: 'moderate',
        title: 'Heavy Rainfall Warning',
        message: 'Heavy rainfall expected in 48 hours. Prepare drainage systems.',
        location,
        validFrom: new Date(Date.now() + 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 72 * 60 * 60 * 1000),
        recommendations: [
          'Clear drainage channels',
          'Harvest mature crops if possible',
          'Secure livestock shelter'
        ]
      }
    ];
    
    res.json(alerts);
  } catch (error) {
    console.error('Weather alerts error:', error);
    res.status(500).json({ error: 'Weather alerts unavailable' });
  }
});

export { router as weatherRoutes };

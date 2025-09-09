import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/diagnose', async (req: AuthenticatedRequest, res) => {
  try {
    const { symptoms, animalType, age, breed, weight, temperature, appetite } = req.body;
    
    if (!symptoms || !animalType) {
      return res.status(400).json({ error: 'Symptoms and animal type are required' });
    }
    
    const severityScore = calculateSeverityScore(symptoms);
    const urgencyLevel = determineUrgency(symptoms, severityScore);
    
    const diagnosis = {
      animalType,
      symptoms,
      animalDetails: {
        age,
        breed,
        weight,
        temperature,
        appetite
      },
      likelyConditions: generateConditions(symptoms, animalType),
      recommendations: generateRecommendations(symptoms, animalType, severityScore),
      urgency: urgencyLevel,
      severityScore,
      vetConsultationRequired: shouldConsultVet(symptoms, severityScore),
      followUpRequired: true,
      estimatedRecoveryTime: getRecoveryEstimate(symptoms, animalType),
      preventiveMeasures: getPreventiveMeasures(animalType),
      nutritionalAdvice: getNutritionalAdvice(symptoms, animalType),
      quarantineRequired: shouldQuarantine(symptoms)
    };
    
    res.json(diagnosis);
  } catch (error) {
    console.error('Livestock diagnosis error:', error);
    res.status(500).json({ error: 'Livestock diagnosis failed' });
  }
});

router.get('/health-records/:animalId', async (req: AuthenticatedRequest, res) => {
  try {
    const { animalId } = req.params;
    
    const healthRecord = {
      animalId,
      owner: req.user!.uid,
      basicInfo: {
        name: 'Bessie',
        type: 'cattle',
        breed: 'Holstein',
        age: '3 years',
        weight: '450 kg',
        gender: 'female'
      },
      vaccinations: [
        {
          vaccine: 'FMD (Foot and Mouth Disease)',
          date: '2024-01-15',
          nextDue: '2024-07-15',
          veterinarian: 'Dr. Sarah Mwangi'
        },
        {
          vaccine: 'Anthrax',
          date: '2024-02-10',
          nextDue: '2025-02-10',
          veterinarian: 'Dr. Sarah Mwangi'
        }
      ],
      treatments: [
        {
          date: '2024-03-20',
          condition: 'Mastitis',
          treatment: 'Antibiotic therapy',
          veterinarian: 'Dr. James Ochieng',
          outcome: 'Recovered'
        }
      ],
      reproductiveHistory: [
        {
          event: 'Calving',
          date: '2023-08-15',
          details: 'Healthy female calf born'
        }
      ],
      nutritionPlan: {
        dailyFeed: '25 kg grass, 3 kg concentrate',
        supplements: ['Mineral lick', 'Vitamin A'],
        waterRequirement: '40-50 liters/day'
      }
    };
    
    res.json(healthRecord);
  } catch (error) {
    console.error('Health records error:', error);
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
});

router.post('/health-records/:animalId/treatments', async (req: AuthenticatedRequest, res) => {
  try {
    const { animalId } = req.params;
    const { condition, treatment, veterinarian, notes } = req.body;
    
    const treatmentRecord = {
      id: Date.now().toString(),
      animalId,
      date: new Date(),
      condition,
      treatment,
      veterinarian,
      notes,
      owner: req.user!.uid,
      status: 'ongoing'
    };
    
    res.status(201).json(treatmentRecord);
  } catch (error) {
    console.error('Treatment record error:', error);
    res.status(500).json({ error: 'Failed to create treatment record' });
  }
});

function calculateSeverityScore(symptoms: string[]): number {
  const severityMap: { [key: string]: number } = {
    'fever': 3,
    'difficulty_breathing': 4,
    'loss_of_appetite': 2,
    'lethargy': 2,
    'coughing': 2,
    'diarrhea': 3,
    'vomiting': 3,
    'lameness': 2,
    'swelling': 2,
    'discharge': 2
  };
  
  return symptoms.reduce((total, symptom) => {
    return total + (severityMap[symptom] || 1);
  }, 0);
}

function determineUrgency(symptoms: string[], severityScore: number): string {
  const criticalSymptoms = ['difficulty_breathing', 'severe_bleeding', 'unconscious'];
  
  if (symptoms.some(s => criticalSymptoms.includes(s))) {
    return 'critical';
  }
  
  if (severityScore >= 8) return 'high';
  if (severityScore >= 5) return 'medium';
  return 'low';
}

function generateConditions(symptoms: string[], animalType: string): any[] {
  const conditions = [
    {
      condition: 'Respiratory Infection',
      probability: symptoms.includes('coughing') ? 0.75 : 0.3,
      severity: 'moderate',
      description: 'Common bacterial or viral infection affecting the respiratory system'
    },
    {
      condition: 'Nutritional Deficiency',
      probability: symptoms.includes('loss_of_appetite') ? 0.6 : 0.2,
      severity: 'mild',
      description: 'Lack of essential nutrients in diet'
    },
    {
      condition: 'Parasitic Infection',
      probability: symptoms.includes('diarrhea') ? 0.65 : 0.25,
      severity: 'moderate',
      description: 'Internal or external parasite infestation'
    }
  ];
  
  return conditions.sort((a, b) => b.probability - a.probability);
}

function generateRecommendations(symptoms: string[], animalType: string, severityScore: number): string[] {
  const recommendations = [
    'Isolate animal from herd to prevent spread',
    'Provide clean, fresh water at all times',
    'Ensure proper ventilation in housing',
    'Monitor temperature and appetite daily'
  ];
  
  if (symptoms.includes('fever')) {
    recommendations.push('Apply cooling measures if temperature is high');
  }
  
  if (symptoms.includes('coughing')) {
    recommendations.push('Reduce dust in environment');
  }
  
  if (severityScore >= 6) {
    recommendations.push('Consult veterinarian within 24 hours');
  }
  
  return recommendations;
}

function shouldConsultVet(symptoms: string[], severityScore: number): boolean {
  const criticalSymptoms = ['difficulty_breathing', 'fever', 'severe_bleeding'];
  return symptoms.some(s => criticalSymptoms.includes(s)) || severityScore >= 6;
}

function getRecoveryEstimate(symptoms: string[], animalType: string): string {
  if (symptoms.includes('difficulty_breathing')) return '7-14 days with treatment';
  if (symptoms.includes('fever')) return '3-7 days with treatment';
  return '2-5 days with proper care';
}

function getPreventiveMeasures(animalType: string): string[] {
  return [
    'Maintain regular vaccination schedule',
    'Provide balanced nutrition',
    'Ensure clean water supply',
    'Regular health check-ups',
    'Proper housing and ventilation',
    'Quarantine new animals before introducing to herd'
  ];
}

function getNutritionalAdvice(symptoms: string[], animalType: string): string[] {
  const advice = [
    'Provide high-quality forage',
    'Ensure adequate protein intake',
    'Add mineral supplements as needed'
  ];
  
  if (symptoms.includes('loss_of_appetite')) {
    advice.push('Offer palatable feeds to encourage eating');
    advice.push('Consider liquid nutrition if necessary');
  }
  
  return advice;
}

function shouldQuarantine(symptoms: string[]): boolean {
  const contagiousSymptoms = ['fever', 'coughing', 'diarrhea', 'discharge'];
  return symptoms.some(s => contagiousSymptoms.includes(s));
}

export { router as livestockRoutes };

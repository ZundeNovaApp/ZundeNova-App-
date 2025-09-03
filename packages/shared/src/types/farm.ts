export interface Farm {
  id: string;
  ownerId: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  size: number;
  sizeUnit: 'hectares' | 'acres';
  soilType?: string;
  crops: Crop[];
  livestock: Livestock[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Crop {
  id: string;
  farmId: string;
  name: string;
  variety?: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  area: number;
  status: 'planted' | 'growing' | 'harvested' | 'failed';
  notes?: string;
  lifecycle?: CropLifecycle;
}

export interface CropLifecycle {
  id: string;
  cropId: string;
  stages: LifecycleStage[];
  currentStage: string;
  plantingSchedule: PlantingSchedule;
  treatmentHistory: Treatment[];
  yieldPrediction?: YieldPrediction;
}

export interface LifecycleStage {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'fertilizer' | 'irrigation' | 'pesticide' | 'harvest' | 'monitoring';
  dueDate: Date;
  completed: boolean;
  reminderSent: boolean;
  products?: string[];
  notes?: string;
}

export interface PlantingSchedule {
  id: string;
  cropId: string;
  plantingDate: Date;
  fertilizerApplications: FertilizerApplication[];
  irrigationSchedule: IrrigationSchedule;
  sprayingSchedule: SprayingSchedule;
  harvestWindow: { start: Date; end: Date };
}

export interface FertilizerApplication {
  id: string;
  type: string;
  product: string;
  quantity: number;
  unit: string;
  applicationDate: Date;
  method: string;
  completed: boolean;
}

export interface IrrigationSchedule {
  id: string;
  method: 'drip' | 'sprinkler' | 'flood' | 'manual';
  frequency: string;
  duration: number;
  waterRequirement: number;
  schedule: IrrigationEvent[];
}

export interface IrrigationEvent {
  id: string;
  date: Date;
  duration: number;
  waterAmount: number;
  completed: boolean;
  weatherConditions?: string;
}

export interface SprayingSchedule {
  id: string;
  applications: SprayApplication[];
  safetyWindows: SafetyWindow[];
}

export interface SprayApplication {
  id: string;
  product: string;
  targetPest: string;
  applicationDate: Date;
  method: string;
  dosage: number;
  unit: string;
  completed: boolean;
  weatherConditions?: string;
}

export interface SafetyWindow {
  product: string;
  withdrawalPeriod: number;
  unit: 'days' | 'weeks';
  lastApplication: Date;
  safeHarvestDate: Date;
}

export interface Treatment {
  id: string;
  date: Date;
  type: 'preventive' | 'curative' | 'nutritional';
  product: string;
  dosage: number;
  method: string;
  targetIssue: string;
  effectiveness?: number;
  notes?: string;
}

export interface YieldPrediction {
  id: string;
  cropId: string;
  predictedYield: number;
  unit: string;
  confidence: number;
  factors: PredictionFactor[];
  lastUpdated: Date;
}

export interface PredictionFactor {
  factor: string;
  impact: number;
  description: string;
}

export interface Livestock {
  id: string;
  farmId: string;
  type: 'cattle' | 'goats' | 'sheep' | 'poultry' | 'pigs' | 'other';
  breed?: string;
  count: number;
  healthStatus: 'healthy' | 'sick' | 'recovering' | 'quarantined';
  lastCheckup?: Date;
  notes?: string;
  individuals?: LivestockIndividual[];
  herdManagement?: HerdManagement;
}

export interface LivestockIndividual {
  id: string;
  uniqueId: string;
  name?: string;
  birthDate?: Date;
  gender: 'male' | 'female';
  breed: string;
  parentIds?: string[];
  healthRecord: HealthRecord;
  weightHistory: WeightRecord[];
  reproductiveHistory?: ReproductiveRecord[];
  currentWeight?: number;
  estimatedWeight?: number;
}

export interface HealthRecord {
  id: string;
  animalId: string;
  vaccinations: Vaccination[];
  treatments: MedicalTreatment[];
  checkups: HealthCheckup[];
  currentStatus: 'healthy' | 'sick' | 'recovering' | 'quarantined' | 'deceased';
  chronicConditions?: string[];
}

export interface Vaccination {
  id: string;
  vaccine: string;
  date: Date;
  nextDue?: Date;
  batchNumber?: string;
  veterinarian?: string;
  notes?: string;
}

export interface MedicalTreatment {
  id: string;
  condition: string;
  medication: string;
  dosage: string;
  startDate: Date;
  endDate?: Date;
  veterinarian?: string;
  effectiveness?: number;
  notes?: string;
}

export interface HealthCheckup {
  id: string;
  date: Date;
  veterinarian?: string;
  weight?: number;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  bodyConditionScore?: number;
  findings: string[];
  recommendations: string[];
  nextCheckupDate?: Date;
}

export interface WeightRecord {
  id: string;
  date: Date;
  weight: number;
  method: 'scale' | 'tape' | 'visual_estimate' | 'camera_estimate';
  notes?: string;
}

export interface ReproductiveRecord {
  id: string;
  type: 'breeding' | 'pregnancy' | 'birth' | 'weaning';
  date: Date;
  partnerId?: string;
  offspring?: string[];
  complications?: string;
  notes?: string;
}

export interface HerdManagement {
  id: string;
  livestockId: string;
  feedingSchedule: FeedingSchedule;
  breedingProgram?: BreedingProgram;
  healthProtocols: HealthProtocol[];
  mortalityTracking: MortalityRecord[];
}

export interface FeedingSchedule {
  id: string;
  feedType: string;
  quantity: number;
  unit: string;
  frequency: string;
  feedingTimes: string[];
  seasonalAdjustments?: SeasonalAdjustment[];
}

export interface SeasonalAdjustment {
  season: 'dry' | 'wet' | 'winter' | 'summer';
  adjustmentFactor: number;
  notes?: string;
}

export interface BreedingProgram {
  id: string;
  objectives: string[];
  breedingSeasons: BreedingSeason[];
  geneticGoals: string[];
  selectionCriteria: SelectionCriteria[];
}

export interface BreedingSeason {
  id: string;
  startDate: Date;
  endDate: Date;
  targetAnimals: string[];
  expectedOutcomes: number;
}

export interface SelectionCriteria {
  trait: string;
  weight: number;
  targetValue: number;
  unit: string;
}

export interface HealthProtocol {
  id: string;
  name: string;
  description: string;
  frequency: string;
  procedures: string[];
  requiredSupplies: string[];
}

export interface MortalityRecord {
  id: string;
  animalId: string;
  date: Date;
  cause: string;
  age: number;
  weight?: number;
  veterinaryReport?: string;
  preventiveMeasures?: string[];
}

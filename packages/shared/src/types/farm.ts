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
}

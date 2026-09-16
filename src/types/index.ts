export type ProductCategory = 
  | 'toilet' 
  | 'smart_toilet' 
  | 'vanity' 
  | 'faucet' 
  | 'shower' 
  | 'bathtub' 
  | 'mirror' 
  | 'tile' 
  | 'accessory';

export type DesignTheme = 
  | 'minimalist_modern' 
  | 'japanese_zen' 
  | 'classic_luxury' 
  | 'contemporary';

export interface ProductDimensions {
  width: number; // in mm
  depth: number; // in mm
  height: number; // in mm
}

export interface KohlerProduct {
  id: string;
  sku: string;
  name: string;
  series?: string;
  category: ProductCategory;
  subCategory?: string;
  price: number; // USD
  dimensions: ProductDimensions;
  material: string;
  finish: string;
  colour: string;
  styles: string[];
  features: string[];
  image: string;
  model3d?: string;
  description?: string;
  specifications?: Record<string, string>;
  isBathroomOnly: boolean; // strict filter ensuring no kitchen products
}

export interface ThemeConfig {
  id: DesignTheme;
  name: string;
  tagline: string;
  description: string;
  colours: string[];
  materials: string[];
  finishes: string[];
  tilePattern: string;
  lightingType: string;
  ambientLightColor: string;
  accentLightColor: string;
  previewImage: string;
  designNotes: string;
}

export interface SpaceDetails {
  length: number; // meters
  width: number;  // meters
  height: number; // meters
  unit: 'm' | 'ft';
}

export interface BudgetRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export interface OptimizerSelection {
  toilet: KohlerProduct;
  vanity: KohlerProduct;
  faucet: KohlerProduct;
  shower: KohlerProduct;
  bathtub?: KohlerProduct;
  mirror: KohlerProduct;
  tile: KohlerProduct;
  accessories: KohlerProduct[];
}

export interface SpaceFitReport {
  fitsOverall: boolean;
  vanityFit: boolean;
  toiletFit: boolean;
  showerFit: boolean;
  bathtubFit?: boolean;
  notes: string[];
}

export interface DesignPlan {
  id: string;
  space: SpaceDetails;
  theme: ThemeConfig;
  budget: BudgetRange;
  products: OptimizerSelection;
  totalCost: number;
  remainingBudget: number;
  spaceFit: SpaceFitReport;
  timestamp: string;
}

import { KohlerProduct } from '../types';

const modelByProductId: Record<string, string> = {
  KOH_VANITY_001: '/models/vanity/seagrove_vanity_30.glb',
  KOH_FAUCET_002: '/models/faucets/harken_vanity_options.glb',
  KOH_SHOWER_001: '/models/shower/venza_shower_faucet.glb',
  KOH_MIRROR_001: '/models/mirrors/essential_round_mirror.glb',
};

const modelByCategory: Partial<Record<KohlerProduct['category'], string>> = {
  vanity: '/models/vanity/seagrove_vanity_30.glb',
  faucet: '/models/faucets/parallel_wall_faucet.glb',
  shower: '/models/shower/july_shower_trim.glb',
  mirror: '/models/mirrors/essential_rectangular_mirror.glb',
  bathtub: '/models/tubs/evok_freestanding_bath.glb',
};

export function getProductModelUrl(product: KohlerProduct): string | undefined {
  return modelByProductId[product.id] ?? modelByCategory[product.category];
}

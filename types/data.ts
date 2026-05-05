export const ATTRIBUTE_DEFINITIONS = [
  { key: "fall_protection_ppe", label: "Fall protection PPE" },
  { key: "hearing_protection", label: "Hearing protection" },
  { key: "hand_and_arm_protection", label: "Hand and arm protection" },
  { key: "foot_and_leg_protection", label: "Foot and leg protection" },
  { key: "eye_and_face_protection", label: "Eye and face protection" },
  { key: "respiratory_protection", label: "Respiratory protection" },
  { key: "head_protection", label: "Head protection" },
  { key: "protective_clothing", label: "Protective clothing" },
  { key: "workplace_safety_equipment_non_worn", label: "Workplace safety equipment non worn" },
  { key: "consumables_and_disposables", label: "Consumables and disposables" },
  { key: "manufacturing", label: "Manufacturing" },
  { key: "distribution", label: "Distribution" },
] as const;

export type CompanyAttributeKey = (typeof ATTRIBUTE_DEFINITIONS)[number]["key"];

export type CompanyRecord = {
  sector_code: string;
  bvd_code: string;
  nombre: string | null;
  webpage: string | null;
  nif: string | null;
  bvd_id: string | null;
  pais: string | null;
  provincia: string | null;
  localidade: string | null;
  concelho: string | null;
  distrito: string | null;
  fecha_fundacion: string | null;
  situacion_actual: string | null;
  ultimo_ano_disponible: string | null;
  latest_period_end: string | null;
  empleados: number | null;
  propietario: string | null;
  propietario_final_global: string | null;
  cae_codigo: string | null;
  cae_descripcion: string | null;
  actividad_descripcion: string | null;
  english_trade_description: string | null;
  t_o: number | null;
  cagr: number | null;
  ebitda: number | null;
  ebitda_pct: number | null;
  net_debt: number | null;
  nd_ebitda: number | null;
  wc: number | null;
  wc_t_o: number | null;
  vendas_total: number | null;
  prestacao_servicos_total: number | null;
  volume_negocios: number | null;
  ebit: number | null;
  resultado_liquido: number | null;
  total_capital_proprio: number | null;
  financiamentos_obtidos_nao_correntes: number | null;
  financiamentos_obtidos_correntes: number | null;
  caixa_depositos_bancarios: number | null;
  fluxos_caixa_operacionais: number | null;
  fluxos_caixa_investimento: number | null;
  fluxos_caixa_financiamento: number | null;
  total_ativo: number | null;
  inventarios: number | null;
  margem_bruta: number | null;
  clientes: number | null;
  fornecedores: number | null;
  dividendos: number | null;
  t_o_sub: number | null;
  source_dashboard: boolean;
  source_sabi: boolean;
  raw_json_sabi: Record<string, unknown> | null;
};

export type CompanyDirectoryRecord = Pick<
  CompanyRecord,
  | "sector_code"
  | "bvd_code"
  | "nombre"
  | "webpage"
  | "nif"
  | "pais"
  | "provincia"
  | "localidade"
  | "concelho"
  | "distrito"
  | "fecha_fundacion"
  | "situacion_actual"
  | "ultimo_ano_disponible"
  | "latest_period_end"
  | "empleados"
  | "propietario"
  | "propietario_final_global"
  | "cae_codigo"
  | "cae_descripcion"
  | "actividad_descripcion"
  | "english_trade_description"
  | "t_o"
  | "cagr"
  | "ebitda"
  | "ebitda_pct"
  | "net_debt"
  | "nd_ebitda"
  | "wc_t_o"
>;

export type CompanyAttributeRecord = {
  sector_code: string;
  bvd_code: string;
  attribute_key: CompanyAttributeKey;
  attribute_label: string;
  value: boolean;
};

export type CompanyDirectoryRow = CompanyDirectoryRecord & {
  attributes: Record<CompanyAttributeKey, boolean>;
  displayRegion: string;
};

export type CompanyHistoryPoint = {
  id: number;
  sector_code: string;
  bvd_code: string;
  metric_key: "volume_negocios" | "net_debt" | "ebitda" | "ebit" | "empleados";
  metric_label: string;
  period_offset: number;
  value: number | null;
};

export type CompanyHistorySeries = {
  metricKey: CompanyHistoryPoint["metric_key"];
  metricLabel: string;
  data: Array<{
    periodOffset: number;
    yearLabel: string;
    value: number;
  }>;
};

export type KpiStat = {
  label: string;
  value: string;
  helper: string;
};

export type DistributionItem = {
  label: string;
  value: number;
  share: number;
};

export type OverviewStats = {
  kpis: KpiStat[];
  countryDistribution: DistributionItem[];
  regionDistribution: DistributionItem[];
  attributeDistribution: DistributionItem[];
  topRevenueCompanies: CompanyDirectoryRow[];
  topEbitdaCompanies: CompanyDirectoryRow[];
  bubblePoints: SectorBubblePoint[];
  bubbleIncludedCount: number;
  totalCompanyCount: number;
};

export type GeographyCountryScope = "all" | "spain" | "portugal";

export type GeographyMapRegion = {
  regionKey: string;
  name: string;
  country: "SPAIN" | "PORTUGAL";
  companyCount: number;
  shareOfScope: number;
  geometry: {
    type: string;
    coordinates?: unknown;
    geometries?: unknown;
  };
};

export type GeographyRankingItem = {
  regionKey: string;
  name: string;
  country: "SPAIN" | "PORTUGAL";
  companyCount: number;
  shareOfScope: number;
};

export type GeographyPageData = {
  scope: GeographyCountryScope;
  totalCompanies: number;
  mappedCompanies: number;
  unmappedCompanies: number;
  activeRegions: number;
  kpis: KpiStat[];
  regions: GeographyMapRegion[];
  ranking: GeographyRankingItem[];
  unmatchedRegions: Array<{
    label: string;
    count: number;
  }>;
};

export type SectorBubblePoint = {
  bvd_code: string;
  nombre: string;
  pais: string;
  propietario: string | null;
  x: number;
  y: number;
  z: number;
};

export type OwnershipGroupSummary = {
  owner: string;
  companyCount: number;
  companies: CompanyDirectoryRow[];
  totalRevenue: number;
  totalEbitda: number;
  totalNetDebt: number;
  totalEmployees: number;
  averageEbitdaPct: number | null;
};

export type CompaniesSearchParams = {
  q?: string;
  country?: string;
  region?: string;
  owner?: string;
  attributes?: string;
  revenueMin?: string;
  revenueMax?: string;
  ebitdaMin?: string;
  ebitdaMax?: string;
  ebitdaPctMin?: string;
  ebitdaPctMax?: string;
  netDebtMin?: string;
  netDebtMax?: string;
  employeesMin?: string;
  employeesMax?: string;
  sort?: string;
  page?: string;
  selected?: string;
};

export type GeographySearchParams = {
  scope?: string;
};

export type CompanyFilters = {
  q: string;
  country: string;
  region: string;
  owner: string;
  attributes: CompanyAttributeKey[];
  revenueMin: number | null;
  revenueMax: number | null;
  ebitdaMin: number | null;
  ebitdaMax: number | null;
  ebitdaPctMin: number | null;
  ebitdaPctMax: number | null;
  netDebtMin: number | null;
  netDebtMax: number | null;
  employeesMin: number | null;
  employeesMax: number | null;
  sort: string;
  page: number;
  selected: string | null;
};

export type CompanyFilterOptions = {
  countries: string[];
  regions: string[];
  owners: string[];
};

export type CompanyListResult = {
  items: CompanyDirectoryRow[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filterOptions: CompanyFilterOptions;
  filters: CompanyFilters;
  selectedCompany: CompanyDirectoryRow | null;
  selectedCompanyHistory: CompanyHistorySeries[];
};

import { ATTRIBUTE_DEFINITIONS, type CompanyAttributeKey, type CompanyHistoryPoint } from "@/types/data";

export const LOCALES = ["en", "es", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE_NAME = "sector-dashboard-locale";

const NUMBER_LOCALES: Record<Locale, string> = {
  en: "en-IE",
  es: "es-ES",
  pt: "pt-PT",
};

type MessageCatalog = {
  metadata: {
    title: string;
    description: string;
  };
  language: {
    label: string;
    options: Record<Locale, string>;
  };
  sidebar: {
    badge: string;
    title: string;
    description: string;
    nav: {
      overview: string;
      companies: string;
      geography: string;
      ownershipGroups: string;
    };
  };
  brand: {
    poweredBy: string;
  };
  overview: {
    eyebrow: string;
    bubbleTitle: string;
    bubbleDescription: (included: number, total: number) => string;
    countryTitle: string;
    countryDescription: string;
    regionTitle: string;
    regionDescription: string;
    attributeTitle: string;
    attributeDescription: string;
    topRevenueTitle: string;
    topEbitdaTitle: string;
  };
  geography: {
    eyebrow: string;
    title: string;
    description: string;
    scopeLabel: string;
    scopeOptions: {
      all: string;
      spain: string;
      portugal: string;
    };
    mapTitle: string;
    mapDescription: (mapped: number, total: number) => string;
    mapLegend: string;
    unmappedNote: (count: number, labels: string) => string;
    rankingTitle: string;
    rankingDescription: string;
    noRanking: string;
    ranking: {
      region: string;
      country: string;
      companies: string;
      share: string;
    };
    tooltip: {
      region: string;
      country: string;
      companies: string;
      share: string;
    };
    kpis: {
      mappedCompanies: { label: string; helper: string };
      unmappedCompanies: { label: string; helper: string };
      coverage: { label: string; helper: string };
      activeRegions: { label: string; helper: string };
    };
  };
  companiesPage: {
    eyebrow: string;
    title: string;
    showing: (shown: number, total: number) => string;
    clearSelection: string;
  };
  ownershipPage: {
    eyebrow: string;
    title: string;
    description: string;
    empty: string;
  };
  filters: {
    companySearch: string;
    companySearchPlaceholder: string;
    country: string;
    allCountries: string;
    region: string;
    allRegions: string;
    owner: string;
    allOwners: string;
    revenueMin: string;
    revenueMax: string;
    ebitdaMin: string;
    ebitdaMax: string;
    ebitdaPctMin: string;
    ebitdaPctMax: string;
    netDebtMin: string;
    netDebtMax: string;
    employeesMin: string;
    employeesMax: string;
    sectorAttributes: string;
    apply: string;
    reset: string;
    andLogic: string;
  };
  companiesTable: {
    company: string;
    revenue: string;
    ebitda: string;
    employees: string;
    cagr: string;
    country: string;
    region: string;
    owner: string;
    unnamedCompany: string;
  };
  companyDetail: {
    empty: string;
    badge: string;
    noOwner: string;
    visitWebsite: string;
    revenue: string;
    ebitda: string;
    ebitdaPct: string;
    netDebt: string;
    employees: string;
    cagr: string;
    ndEbitda: string;
    wcTo: string;
    sectorAttributes: string;
    noAttributes: string;
    nif: string;
    foundationDate: string;
    currentStatus: string;
    latestYearAvailable: string;
    latestPeriodEnd: string;
    ultimateOwner: string;
    caeCode: string;
    descriptionProfile: string;
    historicalMetrics: string;
    historicalDescription: string;
    noHistoricalData: string;
  };
  ranking: {
    viewAll: string;
    company: string;
    country: string;
    metric: string;
    metricSummary: (ebitdaPct: string, employees: string) => string;
  };
  ownershipCard: {
    badge: string;
    summary: (companyCount: number, averageEbitdaPct: string) => string;
    revenue: string;
    ebitda: string;
    netDebt: string;
    employees: string;
    company: string;
    country: string;
    region: string;
    unnamedCompany: string;
  };
  charts: {
    distribution: {
      companies: string;
      share: string;
    };
    bubble: {
      country: string;
      turnover: string;
      cagr: string;
      ebitdaPct: string;
      owner: string;
      noOwner: string;
    };
    history: {
      year: string;
      value: string;
    };
  };
  kpis: {
    totalCompanies: { label: string; helper: string };
    totalRevenue: { label: string; helper: string };
    totalEbitda: { label: string; helper: string };
    medianEbitdaPct: { label: string; helper: string };
    totalEmployees: { label: string; helper: string };
    averageCagr: { label: string; helper: string };
  };
  metrics: Record<CompanyHistoryPoint["metric_key"], string>;
  attributes: Record<CompanyAttributeKey, string>;
};

const messages: Record<Locale, MessageCatalog> = {
  en: {
    metadata: {
      title: "Iberian PPE and Workplace Safety Sector",
      description:
        "The Iberian PPE and workplace safety sector is a robust market spanning Spain and Portugal, dedicated to upholding rigorous EU safety standards through high-quality protective gear and health services. This industry is currently fueled by a strong industrial landscape and a growing corporate emphasis on employee well-being, risk prevention, and ESG compliance. From traditional manufacturing to modern construction, the sector continues to evolve by integrating innovative technology to keep the region's workforce safe and productive.",
    },
    language: {
      label: "Language",
      options: { en: "EN", es: "ES", pt: "PT" },
    },
    sidebar: {
      badge: "Public Dashboard",
      title: "Iberian PPE and Workplace Safety Sector",
      description: "PPE suppliers, manufacturers, distributors, and workplace safety specialists across Spain and Portugal.",
      nav: {
        overview: "Overview",
        companies: "Companies",
        geography: "Geography",
        ownershipGroups: "Ownership Groups",
      },
    },
    brand: {
      poweredBy: "powered by",
    },
    overview: {
      eyebrow: "Sector overview",
      bubbleTitle: "Sector bubble view",
      bubbleDescription: (included, total) =>
        `Each bubble is a company. X-axis is CAGR, Y-axis is EBITDA %, and bubble size is turnover. ${included} of ${total} companies have all required values.`,
      countryTitle: "Country distribution",
      countryDescription: "Company count and share of the overall dataset by country.",
      regionTitle: "Province / district distribution",
      regionDescription: "Top regions across the current dashboard scope, using province first and district as fallback.",
      attributeTitle: "Attribute distribution",
      attributeDescription: "Count and share of companies tagged for each sector attribute.",
      topRevenueTitle: "Top companies by revenue",
      topEbitdaTitle: "Top companies by EBITDA",
    },
    geography: {
      eyebrow: "Geography",
      title: "Regional distribution across Iberia",
      description:
        "A province-level view for Spain and a district-level view for mainland Portugal, built from the company region fields already present in the dashboard.",
      scopeLabel: "Country scope",
      scopeOptions: {
        all: "All Iberia",
        spain: "Spain",
        portugal: "Portugal",
      },
      mapTitle: "Regional concentration map",
      mapDescription: (mapped, total) =>
        `${mapped} of ${total} companies are matched to a province or district polygon in the current scope.`,
      mapLegend: "Darker regions contain more companies within the selected scope.",
      unmappedNote: (count, labels) =>
        labels
          ? `${count} companies remain outside the map boundaries or do not match a region name. Top unmatched labels: ${labels}.`
          : `${count} companies remain outside the map boundaries or do not match a region name.`,
      rankingTitle: "Top mapped regions",
      rankingDescription: "Regions ranked by company count within the selected geographic scope.",
      noRanking: "No mapped regions are available for the current scope.",
      ranking: {
        region: "Region",
        country: "Country",
        companies: "Companies",
        share: "Share",
      },
      tooltip: {
        region: "Region",
        country: "Country",
        companies: "Companies",
        share: "Share",
      },
      kpis: {
        mappedCompanies: { label: "Mapped companies", helper: "Matched to a region boundary" },
        unmappedCompanies: { label: "Unmapped companies", helper: "Missing or unmatched regions" },
        coverage: { label: "Coverage", helper: "Mapped share of the selected scope" },
        activeRegions: { label: "Active regions", helper: "Regions with at least one company" },
      },
    },
    companiesPage: {
      eyebrow: "Companies explorer",
      title: "Search, filter, and inspect companies",
      showing: (shown, total) => `Showing ${shown} of ${total} matching companies.`,
      clearSelection: "Clear selection",
    },
    ownershipPage: {
      eyebrow: "Ownership groups",
      title: "Groups built from repeated proprietors",
      description:
        "A group is any proprietor that appears in at least two companies. This view stays intentionally simple: grouped cards, aggregated metrics, and a clear list of member companies.",
      empty: "No ownership groups were detected under the current rule.",
    },
    filters: {
      companySearch: "Company search",
      companySearchPlaceholder: "Search by company name",
      country: "Country",
      allCountries: "All countries",
      region: "Province / district",
      allRegions: "All regions",
      owner: "Owner / proprietor",
      allOwners: "All owners",
      revenueMin: "Revenue min",
      revenueMax: "Revenue max",
      ebitdaMin: "EBITDA min",
      ebitdaMax: "EBITDA max",
      ebitdaPctMin: "EBITDA % min",
      ebitdaPctMax: "EBITDA % max",
      netDebtMin: "Net debt min",
      netDebtMax: "Net debt max",
      employeesMin: "Employees min",
      employeesMax: "Employees max",
      sectorAttributes: "Sector attributes",
      apply: "Apply filters",
      reset: "Reset",
      andLogic: "Attribute filters use AND logic when several are selected.",
    },
    companiesTable: {
      company: "Company",
      revenue: "Revenue",
      ebitda: "EBITDA",
      employees: "Employees",
      cagr: "CAGR",
      country: "Country",
      region: "Region",
      owner: "Owner",
      unnamedCompany: "Unnamed company",
    },
    companyDetail: {
      empty: "Select a company to open the detail view.",
      badge: "Company detail",
      noOwner: "No owner",
      visitWebsite: "Visit website",
      revenue: "Revenue",
      ebitda: "EBITDA",
      ebitdaPct: "EBITDA %",
      netDebt: "Net debt",
      employees: "Employees",
      cagr: "CAGR",
      ndEbitda: "N/D EBITDA",
      wcTo: "WC / T/o",
      sectorAttributes: "Sector attributes",
      noAttributes: "No attributes flagged.",
      nif: "NIF",
      foundationDate: "Foundation date",
      currentStatus: "Current status",
      latestYearAvailable: "Latest year available",
      latestPeriodEnd: "Latest period end",
      ultimateOwner: "Ultimate owner",
      caeCode: "CAE code",
      descriptionProfile: "Description and profile",
      historicalMetrics: "Historical metrics",
      historicalDescription: "Latest-to-prior year trends. Empty series are hidden automatically.",
      noHistoricalData: "No historical data available for this company.",
    },
    ranking: {
      viewAll: "View all",
      company: "Company",
      country: "Country",
      metric: "Metric",
      metricSummary: (ebitdaPct, employees) => `EBITDA % ${ebitdaPct} / ${employees} employees`,
    },
    ownershipCard: {
      badge: "Ownership group",
      summary: (companyCount, averageEbitdaPct) => `${companyCount} companies / Avg. EBITDA % ${averageEbitdaPct}`,
      revenue: "Revenue",
      ebitda: "EBITDA",
      netDebt: "Net debt",
      employees: "Employees",
      company: "Company",
      country: "Country",
      region: "Region",
      unnamedCompany: "Unnamed company",
    },
    charts: {
      distribution: {
        companies: "Companies",
        share: "Share",
      },
      bubble: {
        country: "Country",
        turnover: "Turnover",
        cagr: "CAGR",
        ebitdaPct: "EBITDA %",
        owner: "Owner",
        noOwner: "-",
      },
      history: {
        year: "Year",
        value: "Value",
      },
    },
    kpis: {
      totalCompanies: { label: "Total companies", helper: "Dashboard sector scope" },
      totalRevenue: { label: "Total revenue", helper: "Sum of turnover" },
      totalEbitda: { label: "Total EBITDA", helper: "Aggregate EBITDA" },
      medianEbitdaPct: { label: "Median EBITDA %", helper: "Median across companies" },
      totalEmployees: { label: "Total employees", helper: "Latest headcount" },
      averageCagr: { label: "Average CAGR", helper: "Average across companies" },
    },
    metrics: {
      volume_negocios: "Revenue",
      net_debt: "Net debt",
      ebitda: "EBITDA",
      ebit: "EBIT",
      empleados: "Employees",
    },
    attributes: {
      fall_protection_ppe: "Fall protection PPE",
      hearing_protection: "Hearing protection",
      hand_and_arm_protection: "Hand and arm protection",
      foot_and_leg_protection: "Foot and leg protection",
      eye_and_face_protection: "Eye and face protection",
      respiratory_protection: "Respiratory protection",
      head_protection: "Head protection",
      protective_clothing: "Protective clothing",
      workplace_safety_equipment_non_worn: "Workplace safety equipment non worn",
      consumables_and_disposables: "Consumables and disposables",
      manufacturing: "Manufacturing",
      distribution: "Distribution",
    },
  },
  es: {
    metadata: {
      title: "Sector Iberico de EPI y Seguridad Laboral",
      description:
        "El sector iberico de EPI y seguridad laboral abarca Espana y Portugal, con equipos de proteccion, servicios de salud laboral y soluciones de seguridad alineadas con estandares europeos exigentes. Esta impulsado por la actividad industrial, la prevencion de riesgos, el bienestar de los empleados y el cumplimiento ESG.",
    },
    language: {
      label: "Idioma",
      options: { en: "EN", es: "ES", pt: "PT" },
    },
    sidebar: {
      badge: "Dashboard público",
      title: "Sector Iberico de EPI y Seguridad Laboral",
      description:
        "Fabricantes, distribuidores y especialistas en seguridad laboral de Espana y Portugal analizados en un solo lugar.",
      nav: {
        overview: "Resumen",
        companies: "Compañías",
        geography: "Geografía",
        ownershipGroups: "Grupos de propiedad",
      },
    },
    brand: {
      poweredBy: "impulsado por",
    },
    overview: {
      eyebrow: "Resumen del sector",
      bubbleTitle: "Vista de burbujas del sector",
      bubbleDescription: (included, total) =>
        `Cada burbuja es una compañía. El eje X es el CAGR, el eje Y es el EBITDA %, y el tamaño de la burbuja es la facturación. ${included} de ${total} compañías tienen todos los valores necesarios.`,
      countryTitle: "Distribución por país",
      countryDescription: "Número de compañías y peso sobre el total del dataset por país.",
      regionTitle: "Distribución por provincia / distrito",
      regionDescription: "Principales regiones dentro del alcance actual del dashboard, usando provincia primero y distrito como alternativa.",
      attributeTitle: "Distribución de atributos",
      attributeDescription: "Número y porcentaje de compañías etiquetadas en cada atributo sectorial.",
      topRevenueTitle: "Top compañías por ingresos",
      topEbitdaTitle: "Top compañías por EBITDA",
    },
    geography: {
      eyebrow: "Geografía",
      title: "Distribución regional en Iberia",
      description:
        "Vista por provincia en España y por distrito en Portugal continental, construida a partir de los campos de región que ya existen en el dashboard.",
      scopeLabel: "Alcance geográfico",
      scopeOptions: {
        all: "Toda Iberia",
        spain: "España",
        portugal: "Portugal",
      },
      mapTitle: "Mapa de concentración regional",
      mapDescription: (mapped, total) =>
        `${mapped} de ${total} compañías están asociadas a un polígono de provincia o distrito dentro del alcance actual.`,
      mapLegend: "Las regiones más oscuras concentran más compañías dentro del alcance seleccionado.",
      unmappedNote: (count, labels) =>
        labels
          ? `${count} compañías quedan fuera del mapa o no coinciden con un nombre de región. Principales etiquetas no mapeadas: ${labels}.`
          : `${count} compañías quedan fuera del mapa o no coinciden con un nombre de región.`,
      rankingTitle: "Top regiones mapeadas",
      rankingDescription: "Regiones ordenadas por número de compañías dentro del alcance geográfico seleccionado.",
      noRanking: "No hay regiones mapeadas disponibles para el alcance actual.",
      ranking: {
        region: "Región",
        country: "País",
        companies: "Compañías",
        share: "Peso",
      },
      tooltip: {
        region: "Región",
        country: "País",
        companies: "Compañías",
        share: "Peso",
      },
      kpis: {
        mappedCompanies: { label: "Compañías mapeadas", helper: "Con región asociada al mapa" },
        unmappedCompanies: { label: "Compañías no mapeadas", helper: "Regiones vacías o sin coincidencia" },
        coverage: { label: "Cobertura", helper: "Peso mapeado dentro del alcance" },
        activeRegions: { label: "Regiones activas", helper: "Regiones con al menos una compañía" },
      },
    },
    companiesPage: {
      eyebrow: "Explorador de compañías",
      title: "Buscar, filtrar e inspeccionar compañías",
      showing: (shown, total) => `Mostrando ${shown} de ${total} compañías que cumplen los filtros.`,
      clearSelection: "Quitar selección",
    },
    ownershipPage: {
      eyebrow: "Grupos de propiedad",
      title: "Grupos formados por propietarios repetidos",
      description:
        "Un grupo es cualquier propietario que aparece en al menos dos compañías. Esta vista se mantiene intencionadamente simple: tarjetas agrupadas, métricas agregadas y una lista clara de compañías miembros.",
      empty: "No se han detectado grupos de propiedad con la regla actual.",
    },
    filters: {
      companySearch: "Búsqueda de compañía",
      companySearchPlaceholder: "Buscar por nombre de compañía",
      country: "País",
      allCountries: "Todos los países",
      region: "Provincia / distrito",
      allRegions: "Todas las regiones",
      owner: "Propietario",
      allOwners: "Todos los propietarios",
      revenueMin: "Ingresos mín.",
      revenueMax: "Ingresos máx.",
      ebitdaMin: "EBITDA mín.",
      ebitdaMax: "EBITDA máx.",
      ebitdaPctMin: "EBITDA % mín.",
      ebitdaPctMax: "EBITDA % máx.",
      netDebtMin: "Deuda neta mín.",
      netDebtMax: "Deuda neta máx.",
      employeesMin: "Empleados mín.",
      employeesMax: "Empleados máx.",
      sectorAttributes: "Atributos sectoriales",
      apply: "Aplicar filtros",
      reset: "Restablecer",
      andLogic: "Los filtros de atributos usan lógica AND cuando se seleccionan varios.",
    },
    companiesTable: {
      company: "Compañía",
      revenue: "Ingresos",
      ebitda: "EBITDA",
      employees: "Empleados",
      cagr: "CAGR",
      country: "País",
      region: "Región",
      owner: "Propietario",
      unnamedCompany: "Compañía sin nombre",
    },
    companyDetail: {
      empty: "Selecciona una compañía para abrir la vista de detalle.",
      badge: "Detalle de compañía",
      noOwner: "Sin propietario",
      visitWebsite: "Visitar web",
      revenue: "Ingresos",
      ebitda: "EBITDA",
      ebitdaPct: "EBITDA %",
      netDebt: "Deuda neta",
      employees: "Empleados",
      cagr: "CAGR",
      ndEbitda: "N/D EBITDA",
      wcTo: "WC / T/o",
      sectorAttributes: "Atributos sectoriales",
      noAttributes: "No hay atributos marcados.",
      nif: "NIF",
      foundationDate: "Fecha de constitución",
      currentStatus: "Situación actual",
      latestYearAvailable: "Último año disponible",
      latestPeriodEnd: "Cierre del último periodo",
      ultimateOwner: "Propietario final",
      caeCode: "Código CAE",
      descriptionProfile: "Descripción y perfil",
      historicalMetrics: "Métricas históricas",
      historicalDescription: "Tendencias desde el último año hacia atrás. Las series vacías se ocultan automáticamente.",
      noHistoricalData: "No hay datos históricos disponibles para esta compañía.",
    },
    ranking: {
      viewAll: "Ver todo",
      company: "Compañía",
      country: "País",
      metric: "Métrica",
      metricSummary: (ebitdaPct, employees) => `EBITDA % ${ebitdaPct} / ${employees} empleados`,
    },
    ownershipCard: {
      badge: "Grupo de propiedad",
      summary: (companyCount, averageEbitdaPct) => `${companyCount} compañías / EBITDA % medio ${averageEbitdaPct}`,
      revenue: "Ingresos",
      ebitda: "EBITDA",
      netDebt: "Deuda neta",
      employees: "Empleados",
      company: "Compañía",
      country: "País",
      region: "Región",
      unnamedCompany: "Compañía sin nombre",
    },
    charts: {
      distribution: {
        companies: "Compañías",
        share: "Peso",
      },
      bubble: {
        country: "País",
        turnover: "Facturación",
        cagr: "CAGR",
        ebitdaPct: "EBITDA %",
        owner: "Propietario",
        noOwner: "-",
      },
      history: {
        year: "Año",
        value: "Valor",
      },
    },
    kpis: {
      totalCompanies: { label: "Total compañías", helper: "Alcance sectorial del dashboard" },
      totalRevenue: { label: "Ingresos totales", helper: "Suma de facturación" },
      totalEbitda: { label: "EBITDA total", helper: "EBITDA agregado" },
      medianEbitdaPct: { label: "EBITDA % mediano", helper: "Mediana entre compañías" },
      totalEmployees: { label: "Empleados totales", helper: "Plantilla del último año" },
      averageCagr: { label: "CAGR medio", helper: "Media entre compañías" },
    },
    metrics: {
      volume_negocios: "Ingresos",
      net_debt: "Deuda neta",
      ebitda: "EBITDA",
      ebit: "EBIT",
      empleados: "Empleados",
    },
    attributes: {
      fall_protection_ppe: "EPI anticaidas",
      hearing_protection: "Proteccion auditiva",
      hand_and_arm_protection: "Proteccion de manos y brazos",
      foot_and_leg_protection: "Proteccion de pies y piernas",
      eye_and_face_protection: "Proteccion ocular y facial",
      respiratory_protection: "Proteccion respiratoria",
      head_protection: "Proteccion craneal",
      protective_clothing: "Ropa de proteccion",
      workplace_safety_equipment_non_worn: "Equipos de seguridad no portados",
      consumables_and_disposables: "Consumibles y desechables",
      manufacturing: "Fabricacion",
      distribution: "Distribucion",
    },
  },
  pt: {
    metadata: {
      title: "Setor Iberico de EPI e Seguranca no Trabalho",
      description:
        "O setor iberico de EPI e seguranca no trabalho abrange Espanha e Portugal, com equipamentos de protecao, servicos de saude laboral e solucoes de seguranca alinhadas com normas europeias exigentes. E impulsionado pela atividade industrial, prevencao de riscos, bem-estar dos trabalhadores e cumprimento ESG.",
    },
    language: {
      label: "Idioma",
      options: { en: "EN", es: "ES", pt: "PT" },
    },
    sidebar: {
      badge: "Painel público",
      title: "Setor Iberico de EPI e Seguranca no Trabalho",
      description:
        "Fabricantes, distribuidores e especialistas em seguranca laboral de Espanha e Portugal analisados num so lugar.",
      nav: {
        overview: "Visão geral",
        companies: "Empresas",
        geography: "Geografia",
        ownershipGroups: "Grupos de propriedade",
      },
    },
    brand: {
      poweredBy: "desenvolvido por",
    },
    overview: {
      eyebrow: "Visão geral do setor",
      bubbleTitle: "Vista de bolhas do setor",
      bubbleDescription: (included, total) =>
        `Cada bolha é uma empresa. O eixo X é o CAGR, o eixo Y é o EBITDA %, e o tamanho da bolha é o volume de negócios. ${included} de ${total} empresas têm todos os valores necessários.`,
      countryTitle: "Distribuição por país",
      countryDescription: "Número de empresas e peso sobre o total do dataset por país.",
      regionTitle: "Distribuição por província / distrito",
      regionDescription: "Principais regiões dentro do âmbito atual do dashboard, usando província primeiro e distrito como alternativa.",
      attributeTitle: "Distribuição de atributos",
      attributeDescription: "Número e percentagem de empresas marcadas com cada atributo setorial.",
      topRevenueTitle: "Top empresas por receita",
      topEbitdaTitle: "Top empresas por EBITDA",
    },
    geography: {
      eyebrow: "Geografia",
      title: "Distribuição regional na Iberia",
      description:
        "Vista por província em Espanha e por distrito em Portugal continental, construída a partir dos campos de região já existentes no dashboard.",
      scopeLabel: "Âmbito geográfico",
      scopeOptions: {
        all: "Toda a Iberia",
        spain: "Espanha",
        portugal: "Portugal",
      },
      mapTitle: "Mapa de concentração regional",
      mapDescription: (mapped, total) =>
        `${mapped} de ${total} empresas estão associadas a um polígono de província ou distrito dentro do âmbito atual.`,
      mapLegend: "As regiões mais escuras concentram mais empresas dentro do âmbito selecionado.",
      unmappedNote: (count, labels) =>
        labels
          ? `${count} empresas ficam fora do mapa ou não coincidem com um nome de região. Principais etiquetas não mapeadas: ${labels}.`
          : `${count} empresas ficam fora do mapa ou não coincidem com um nome de região.`,
      rankingTitle: "Top regiões mapeadas",
      rankingDescription: "Regiões ordenadas pelo número de empresas dentro do âmbito geográfico selecionado.",
      noRanking: "Não existem regiões mapeadas disponíveis para o âmbito atual.",
      ranking: {
        region: "Região",
        country: "País",
        companies: "Empresas",
        share: "Peso",
      },
      tooltip: {
        region: "Região",
        country: "País",
        companies: "Empresas",
        share: "Peso",
      },
      kpis: {
        mappedCompanies: { label: "Empresas mapeadas", helper: "Com região associada ao mapa" },
        unmappedCompanies: { label: "Empresas não mapeadas", helper: "Regiões vazias ou sem correspondência" },
        coverage: { label: "Cobertura", helper: "Peso mapeado dentro do âmbito" },
        activeRegions: { label: "Regiões ativas", helper: "Regiões com pelo menos uma empresa" },
      },
    },
    companiesPage: {
      eyebrow: "Explorador de empresas",
      title: "Pesquisar, filtrar e analisar empresas",
      showing: (shown, total) => `A mostrar ${shown} de ${total} empresas que cumprem os filtros.`,
      clearSelection: "Limpar seleção",
    },
    ownershipPage: {
      eyebrow: "Grupos de propriedade",
      title: "Grupos construídos a partir de proprietários repetidos",
      description:
        "Um grupo é qualquer proprietário que aparece em pelo menos duas empresas. Esta vista mantém-se intencionalmente simples: cartões agrupados, métricas agregadas e uma lista clara das empresas membro.",
      empty: "Não foram detetados grupos de propriedade com a regra atual.",
    },
    filters: {
      companySearch: "Pesquisa de empresa",
      companySearchPlaceholder: "Pesquisar por nome da empresa",
      country: "País",
      allCountries: "Todos os países",
      region: "Província / distrito",
      allRegions: "Todas as regiões",
      owner: "Proprietário",
      allOwners: "Todos os proprietários",
      revenueMin: "Receita mín.",
      revenueMax: "Receita máx.",
      ebitdaMin: "EBITDA mín.",
      ebitdaMax: "EBITDA máx.",
      ebitdaPctMin: "EBITDA % mín.",
      ebitdaPctMax: "EBITDA % máx.",
      netDebtMin: "Dívida líquida mín.",
      netDebtMax: "Dívida líquida máx.",
      employeesMin: "Empregados mín.",
      employeesMax: "Empregados máx.",
      sectorAttributes: "Atributos setoriais",
      apply: "Aplicar filtros",
      reset: "Repor",
      andLogic: "Os filtros de atributos usam lógica AND quando são selecionados vários.",
    },
    companiesTable: {
      company: "Empresa",
      revenue: "Receita",
      ebitda: "EBITDA",
      employees: "Empregados",
      cagr: "CAGR",
      country: "País",
      region: "Região",
      owner: "Proprietário",
      unnamedCompany: "Empresa sem nome",
    },
    companyDetail: {
      empty: "Selecione uma empresa para abrir a vista de detalhe.",
      badge: "Detalhe da empresa",
      noOwner: "Sem proprietário",
      visitWebsite: "Visitar website",
      revenue: "Receita",
      ebitda: "EBITDA",
      ebitdaPct: "EBITDA %",
      netDebt: "Dívida líquida",
      employees: "Empregados",
      cagr: "CAGR",
      ndEbitda: "N/D EBITDA",
      wcTo: "WC / T/o",
      sectorAttributes: "Atributos setoriais",
      noAttributes: "Sem atributos assinalados.",
      nif: "NIF",
      foundationDate: "Data de fundação",
      currentStatus: "Situação atual",
      latestYearAvailable: "Último ano disponível",
      latestPeriodEnd: "Fim do último período",
      ultimateOwner: "Proprietário final",
      caeCode: "Código CAE",
      descriptionProfile: "Descrição e perfil",
      historicalMetrics: "Métricas históricas",
      historicalDescription: "Tendências do último ano para trás. As séries vazias são ocultadas automaticamente.",
      noHistoricalData: "Não existem dados históricos disponíveis para esta empresa.",
    },
    ranking: {
      viewAll: "Ver tudo",
      company: "Empresa",
      country: "País",
      metric: "Métrica",
      metricSummary: (ebitdaPct, employees) => `EBITDA % ${ebitdaPct} / ${employees} empregados`,
    },
    ownershipCard: {
      badge: "Grupo de propriedade",
      summary: (companyCount, averageEbitdaPct) => `${companyCount} empresas / EBITDA % médio ${averageEbitdaPct}`,
      revenue: "Receita",
      ebitda: "EBITDA",
      netDebt: "Dívida líquida",
      employees: "Empregados",
      company: "Empresa",
      country: "País",
      region: "Região",
      unnamedCompany: "Empresa sem nome",
    },
    charts: {
      distribution: {
        companies: "Empresas",
        share: "Peso",
      },
      bubble: {
        country: "País",
        turnover: "Volume de negócios",
        cagr: "CAGR",
        ebitdaPct: "EBITDA %",
        owner: "Proprietário",
        noOwner: "-",
      },
      history: {
        year: "Ano",
        value: "Valor",
      },
    },
    kpis: {
      totalCompanies: { label: "Total de empresas", helper: "Âmbito setorial do dashboard" },
      totalRevenue: { label: "Receita total", helper: "Soma do volume de negócios" },
      totalEbitda: { label: "EBITDA total", helper: "EBITDA agregado" },
      medianEbitdaPct: { label: "EBITDA % mediano", helper: "Mediana entre empresas" },
      totalEmployees: { label: "Empregados totais", helper: "Headcount do último ano" },
      averageCagr: { label: "CAGR médio", helper: "Média entre empresas" },
    },
    metrics: {
      volume_negocios: "Receita",
      net_debt: "Dívida líquida",
      ebitda: "EBITDA",
      ebit: "EBIT",
      empleados: "Empregados",
    },
    attributes: {
      fall_protection_ppe: "EPI antiqueda",
      hearing_protection: "Protecao auditiva",
      hand_and_arm_protection: "Protecao de maos e bracos",
      foot_and_leg_protection: "Protecao de pes e pernas",
      eye_and_face_protection: "Protecao ocular e facial",
      respiratory_protection: "Protecao respiratoria",
      head_protection: "Protecao da cabeca",
      protective_clothing: "Vestuario de protecao",
      workplace_safety_equipment_non_worn: "Equipamento de seguranca nao usado no corpo",
      consumables_and_disposables: "Consumiveis e descartaveis",
      manufacturing: "Fabricacao",
      distribution: "Distribuicao",
    },
  },
};

const repairedMessages = new Map<Locale, MessageCatalog>();

function repairMojibake(value: string) {
  if (!/[ÃÂâ]/.test(value)) {
    return value;
  }

  try {
    const bytes = Uint8Array.from(value, (character) => character.charCodeAt(0) & 0xff);
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return value;
  }
}

function repairCatalogValue<T>(value: T): T {
  if (typeof value === "string") {
    return repairMojibake(value) as T;
  }

  if (typeof value === "function" || value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => repairCatalogValue(item)) as T;
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [key, repairCatalogValue(nestedValue)]),
    ) as T;
  }

  return value;
}

export function resolveLocale(input: string | null | undefined): Locale {
  if (input && LOCALES.includes(input as Locale)) {
    return input as Locale;
  }

  return "en";
}

export function getMessages(locale: Locale) {
  const cached = repairedMessages.get(locale);
  if (cached) {
    return cached;
  }

  const repaired = repairCatalogValue(messages[locale]);
  repairedMessages.set(locale, repaired);
  return repaired;
}

export function getNumberLocale(locale: Locale) {
  return NUMBER_LOCALES[locale];
}

export function getAttributeLabel(locale: Locale, attributeKey: CompanyAttributeKey) {
  return messages[locale].attributes[attributeKey];
}

export function getAttributeDefinitions(locale: Locale) {
  return ATTRIBUTE_DEFINITIONS.map((attribute) => ({
    ...attribute,
    label: getAttributeLabel(locale, attribute.key),
  }));
}

export function getMetricLabel(locale: Locale, metricKey: CompanyHistoryPoint["metric_key"]) {
  return messages[locale].metrics[metricKey];
}

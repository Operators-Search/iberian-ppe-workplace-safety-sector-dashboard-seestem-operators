import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { getSectorCode, getSupabaseServiceRoleKey, getSupabaseUrl } from "../lib/env";
import { ATTRIBUTE_DEFINITIONS, type CompanyAttributeKey } from "../types/data";

loadEnvConfig(process.cwd());

const SECTOR_NAME = "Iberian PPE and Workplace Safety Sector";
const SECTOR_SLUG = "iberian-ppe-and-workplace-safety-sector";
const SECTOR_DESCRIPTION =
  "The Iberian PPE and workplace safety sector spans Spain and Portugal, upholding rigorous EU safety standards through protective gear, workplace safety equipment, and health services.";
const DASHBOARD_SHEET_NAME = "DashBoard";
const SABI_SHEET_NAME = "AUX - BD SABI";
const DASHBOARD_STANDARD_COLUMNS = [
  "NAME",
  "WEBPAGE",
  "NIF",
  "BvD Code",
  "Country",
  "State",
  "Date of Establishment",
  "Employees",
  "Owner",
  "Turnover (k€)",
  "CAGR",
  "EBITDA (k€)",
  "EBITDA %",
  "NET DEBT (k€)",
  "ND/EBITDA",
  "Working Capital (k€)",
  "WC/T/o",
] as const;
const EXPECTED_ATTRIBUTE_COLUMNS = ATTRIBUTE_DEFINITIONS.map((attribute) => attribute.label);
const DASHBOARD_STANDARD_COLUMNS_NORMALIZED = DASHBOARD_STANDARD_COLUMNS.map((label) =>
  normalizeHeader(label).toLowerCase(),
);
const EXPECTED_ATTRIBUTE_COLUMNS_NORMALIZED = EXPECTED_ATTRIBUTE_COLUMNS.map((label) => normalizeHeader(label).toLowerCase());
const FALSE_ATTRIBUTE_SYMBOL = String.fromCodePoint(0x2bbd);
const TRUE_ATTRIBUTE_SYMBOLS = new Set([
  String.fromCodePoint(0x2713),
  String.fromCodePoint(0x2714),
  String.fromCodePoint(0x2611),
  String.fromCodePoint(0x2705),
]);
const FALSE_ATTRIBUTE_SYMBOLS = new Set([FALSE_ATTRIBUTE_SYMBOL, "x", "X"]);
const HISTORY_METRICS = [
  { key: "volume_negocios", sourceLabel: "Volume de Negocios", label: "Revenue", isMonetary: true },
  { key: "net_debt", sourceLabel: "Net Debt", label: "Net Debt", isMonetary: true },
  { key: "ebitda", sourceLabel: "EBITDA", label: "EBITDA", isMonetary: true },
  { key: "ebit", sourceLabel: "EBIT", label: "EBIT", isMonetary: true },
  { key: "empleados", sourceLabel: "Empregados", label: "Employees", isMonetary: false },
] as const;
const CHUNK_SIZE = 200;
const THOUSAND_EUR_TO_EUR = 1000;

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type DashboardCompanyRow = {
  bvdCode: string;
  nombre: string | null;
  webpage: string | null;
  nif: string | null;
  pais: string | null;
  provincia: string | null;
  fechaFundacion: string | null;
  empleados: number | null;
  propietario: string | null;
  t_o: number | null;
  cagr: number | null;
  ebitda: number | null;
  ebitda_pct: number | null;
  net_debt: number | null;
  nd_ebitda: number | null;
  wc: number | null;
  wc_t_o: number | null;
  attributes: Array<{
    attribute_key: CompanyAttributeKey;
    attribute_label: string;
    value: boolean;
  }>;
};

type SabiRow = {
  bvdCode: string;
  values: Record<string, unknown>;
  rawJson: Record<string, JsonValue>;
};

type CompanyUpsert = {
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
  raw_json_sabi: Record<string, JsonValue> | null;
};

type CompanyAttributeInsert = {
  sector_code: string;
  bvd_code: string;
  attribute_key: CompanyAttributeKey;
  attribute_label: string;
  value: boolean;
};

type CompanyHistoryInsert = {
  sector_code: string;
  bvd_code: string;
  metric_key: string;
  metric_label: string;
  period_offset: number;
  value: number;
};

function resolveInputPath(fileName: string) {
  const candidates = [
    path.join(process.cwd(), fileName),
    path.join(process.cwd(), "data", "input", fileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Could not find ${fileName} in data/input or the project root.`);
}

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .replace(/\r?\n/g, " | ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u20ac|\u00e2\u201a\u00ac/g, "EUR")
    .replace(/\s+/g, " ")
    .trim();
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const stringValue = String(value)
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
  return stringValue ? stringValue : null;
}

function fromExcelSerialDate(value: number) {
  const excelEpochUtcMs = Date.UTC(1899, 11, 30);
  const wholeDays = Math.floor(value);
  return new Date(excelEpochUtcMs + wholeDays * 24 * 60 * 60 * 1000);
}

function toNullableDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number" && Number.isFinite(value) && value >= 20000 && value <= 70000) {
    return fromExcelSerialDate(value).toISOString().slice(0, 10);
  }

  const stringValue = String(value).trim();
  if (/^\d{5}$/.test(stringValue)) {
    return fromExcelSerialDate(Number(stringValue)).toISOString().slice(0, 10);
  }
  const parsed = new Date(stringValue);
  if (Number.isNaN(parsed.valueOf())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const normalized = String(value).replace(/,/g, "").trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNullableMonetaryValue(value: unknown): number | null {
  const parsed = toNullableNumber(value);
  if (parsed === null) {
    return null;
  }

  return parsed * THOUSAND_EUR_TO_EUR;
}

function getValueByNormalizedPrefix(rowObject: Record<string, unknown>, prefix: string) {
  const normalizedPrefix = normalizeHeader(prefix).toLowerCase();
  const matchingKey = Object.keys(rowObject).find((key) => key.startsWith(normalizedPrefix));
  return matchingKey ? rowObject[matchingKey] : null;
}

function toJsonValue(value: unknown): JsonValue {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (Array.isArray(value)) {
    return value.map(toJsonValue);
  }

  switch (typeof value) {
    case "string":
      return value;
    case "number":
      return Number.isFinite(value) ? value : null;
    case "boolean":
      return value;
    case "object":
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [key, toJsonValue(nestedValue)]),
      );
    default:
      return String(value);
  }
}

function getSabiValue(row: SabiRow | undefined, header: string) {
  return row?.values[header];
}

function parseBooleanAttribute(label: string, value: unknown) {
  const normalized = toNullableString(value)?.normalize("NFKC");

  if (!normalized || FALSE_ATTRIBUTE_SYMBOLS.has(normalized)) {
    return false;
  }

  if (TRUE_ATTRIBUTE_SYMBOLS.has(normalized)) {
    return true;
  }

  console.warn(`Unexpected attribute symbol for "${label}": ${normalized}. Treating as false.`);
  return false;
}

function readDashboardRows(filePath: string): DashboardCompanyRow[] {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheet = workbook.Sheets[DASHBOARD_SHEET_NAME] ?? workbook.Sheets[workbook.SheetNames[0]];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
    raw: true,
  });

  const headers = (matrix[1] ?? []).map((cell) => String(cell ?? "").trim());
  const normalizedHeaders = headers.map((header) => normalizeHeader(header).toLowerCase());
  const standardColumns = normalizedHeaders.slice(0, DASHBOARD_STANDARD_COLUMNS.length);
  const attributeColumns = headers.slice(DASHBOARD_STANDARD_COLUMNS.length);
  const normalizedAttributeColumns = normalizedHeaders.slice(DASHBOARD_STANDARD_COLUMNS.length);
  const attributeKeyByLabel = new Map(
    ATTRIBUTE_DEFINITIONS.map((attribute) => [normalizeHeader(attribute.label).toLowerCase(), attribute.key]),
  );

  if (JSON.stringify(standardColumns) !== JSON.stringify(DASHBOARD_STANDARD_COLUMNS_NORMALIZED)) {
    throw new Error(
      `Dashboard standard columns do not match the expected layout.\nExpected: ${DASHBOARD_STANDARD_COLUMNS.join(", ")}\nReceived: ${standardColumns.join(", ")}`,
    );
  }

  if (JSON.stringify(normalizedAttributeColumns) !== JSON.stringify(EXPECTED_ATTRIBUTE_COLUMNS_NORMALIZED)) {
    throw new Error(
      `Dashboard attribute columns do not match the expected sector attributes.\nExpected: ${EXPECTED_ATTRIBUTE_COLUMNS.join(", ")}\nReceived: ${attributeColumns.join(", ")}`,
    );
  }

  return matrix
    .slice(2)
    .filter((row) => row.some((cell) => toNullableString(cell)))
    .map((row) => {
      const rowObject: Record<string, unknown> = Object.fromEntries(
        normalizedHeaders.map((header, index) => [header, row[index] ?? null]),
      );
      const bvdCode = toNullableString(rowObject["bvd code"]);

      if (!bvdCode) {
        throw new Error("Encountered a Dashboard row without BvD Code.");
      }

      const attributes = attributeColumns.map((label, index) => {
        const attributeKey = attributeKeyByLabel.get(normalizedAttributeColumns[index]);

        if (!attributeKey) {
          throw new Error(`Unexpected Dashboard attribute column: ${label}`);
        }

        return {
          attribute_key: attributeKey,
          attribute_label: label,
          value: parseBooleanAttribute(label, rowObject[normalizedAttributeColumns[index]]),
        };
      });
      return {
        bvdCode,
        nombre: toNullableString(rowObject["name"]),
        webpage: toNullableString(rowObject["webpage"]),
        nif: toNullableString(rowObject["nif"]),
        pais: toNullableString(rowObject["country"]),
        provincia: toNullableString(rowObject["state"]),
        fechaFundacion: toNullableDate(rowObject["date of establishment"]),
        empleados: toNullableNumber(rowObject["employees"]),
        propietario: toNullableString(rowObject["owner"]),
        t_o: toNullableMonetaryValue(getValueByNormalizedPrefix(rowObject, "turnover")),
        cagr: toNullableNumber(rowObject["cagr"]),
        ebitda: toNullableMonetaryValue(getValueByNormalizedPrefix(rowObject, "ebitda")),
        ebitda_pct: toNullableNumber(rowObject["ebitda %"]),
        net_debt: toNullableMonetaryValue(getValueByNormalizedPrefix(rowObject, "net debt")),
        nd_ebitda: toNullableNumber(rowObject["nd/ebitda"]),
        wc: toNullableMonetaryValue(getValueByNormalizedPrefix(rowObject, "working capital")),
        wc_t_o: toNullableNumber(rowObject["wc/t/o"]),
        attributes,
      };
    });
}

function readSabiRows(filePath: string) {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheet = workbook.Sheets[SABI_SHEET_NAME] ?? workbook.Sheets[workbook.SheetNames[0]];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: null,
    raw: true,
  });

  const originalHeaders = (matrix[0] ?? []).map((cell) => String(cell ?? "").trim());
  const normalizedHeaders = originalHeaders.map(normalizeHeader);
  const byCode = new Map<string, SabiRow>();

  for (const row of matrix.slice(1)) {
    const values = Object.fromEntries(normalizedHeaders.map((header, index) => [header, row[index] ?? null]));
    const rawJson = Object.fromEntries(
      normalizedHeaders.map((header, index) => [header, toJsonValue(row[index] ?? null)]),
    );
    const bvdCode = toNullableString(values["BvD Code"]);

    if (!bvdCode) {
      continue;
    }

    byCode.set(bvdCode, {
      bvdCode,
      values,
      rawJson,
    });
  }

  return byCode;
}

function createCompanyRecord(
  sectorCode: string,
  dashboardRow: DashboardCompanyRow,
  sabiRow: SabiRow | undefined,
): CompanyUpsert {
  const latestPeriodEnd =
    toNullableDate(getSabiValue(sabiRow, "latest_period_end")) ??
    toNullableDate(getSabiValue(sabiRow, "Ultimo Ano Disponivel"));

  return {
    sector_code: sectorCode,
    bvd_code: dashboardRow.bvdCode,
    nombre: dashboardRow.nombre ?? toNullableString(getSabiValue(sabiRow, "Nome")),
    webpage: dashboardRow.webpage ?? toNullableString(getSabiValue(sabiRow, "Endereco Internet")),
    nif: dashboardRow.nif,
    bvd_id: toNullableString(getSabiValue(sabiRow, "BvD ID")),
    pais: dashboardRow.pais ?? toNullableString(getSabiValue(sabiRow, "Pais")),
    provincia: dashboardRow.provincia,
    localidade: toNullableString(getSabiValue(sabiRow, "Localidade")),
    concelho: toNullableString(getSabiValue(sabiRow, "Concelho")),
    distrito: toNullableString(getSabiValue(sabiRow, "Distrito")),
    fecha_fundacion: dashboardRow.fechaFundacion ?? toNullableDate(getSabiValue(sabiRow, "Data Fundacao")),
    situacion_actual: toNullableString(getSabiValue(sabiRow, "Situacao Actual")),
    ultimo_ano_disponible: toNullableDate(getSabiValue(sabiRow, "Ultimo Ano Disponivel")),
    latest_period_end: latestPeriodEnd,
    empleados: dashboardRow.empleados ?? toNullableNumber(getSabiValue(sabiRow, "Empregados | Ultimo ano disp.")),
    propietario: dashboardRow.propietario,
    propietario_final_global: toNullableString(getSabiValue(sabiRow, "Proprietario final global - Nome")),
    cae_codigo: toNullableString(getSabiValue(sabiRow, "Codigo da CAE Rev.3 Principal")),
    cae_descripcion: toNullableString(getSabiValue(sabiRow, "Descricao da CAE Rev.3 Principal")),
    actividad_descripcion: toNullableString(getSabiValue(sabiRow, "Descricao da Actividade")),
    english_trade_description: toNullableString(getSabiValue(sabiRow, "English trade description")),
    t_o: dashboardRow.t_o,
    cagr: dashboardRow.cagr,
    ebitda:
      dashboardRow.ebitda ?? toNullableMonetaryValue(getSabiValue(sabiRow, "EBITDA | th EUR | Ultimo ano disp.")),
    ebitda_pct: dashboardRow.ebitda_pct,
    net_debt:
      dashboardRow.net_debt ??
      toNullableMonetaryValue(getSabiValue(sabiRow, "Net Debt | th EUR | Ultimo ano disp.")),
    nd_ebitda: dashboardRow.nd_ebitda,
    wc: dashboardRow.wc,
    wc_t_o: dashboardRow.wc_t_o,
    vendas_total: toNullableMonetaryValue(getSabiValue(sabiRow, "Vendas total | th EUR | Ultimo ano disp.")),
    prestacao_servicos_total: toNullableMonetaryValue(
      getSabiValue(sabiRow, "Prestacao servicos - Total | th EUR | Ultimo ano disp."),
    ),
    volume_negocios: toNullableMonetaryValue(getSabiValue(sabiRow, "Volume de Negocios | th EUR | Ultimo ano disp.")),
    ebit: toNullableMonetaryValue(getSabiValue(sabiRow, "EBIT | th EUR | Ultimo ano disp.")),
    resultado_liquido: toNullableMonetaryValue(
      getSabiValue(sabiRow, "Resultado Liquido do Exercicio | th EUR | Ultimo ano disp."),
    ),
    total_capital_proprio: toNullableMonetaryValue(
      getSabiValue(sabiRow, "Total do capital proprio | th EUR | Ultimo ano disp."),
    ),
    financiamentos_obtidos_nao_correntes: toNullableMonetaryValue(
      getSabiValue(sabiRow, "Financiamentos obtidos nao correntes | th EUR | Ultimo ano disp."),
    ),
    financiamentos_obtidos_correntes: toNullableMonetaryValue(
      getSabiValue(sabiRow, "Financiamentos obtidos correntes | th EUR | Ultimo ano disp."),
    ),
    caixa_depositos_bancarios: toNullableMonetaryValue(
      getSabiValue(sabiRow, "Caixa e depositos bancarios | th EUR | Ultimo ano disp."),
    ),
    fluxos_caixa_operacionais: toNullableMonetaryValue(
      getSabiValue(sabiRow, "Fluxos de caixa das actividades operacionais | th EUR | Ultimo ano disp."),
    ),
    fluxos_caixa_investimento: toNullableMonetaryValue(
      getSabiValue(sabiRow, "Fluxos de caixa das actividades de investimento | th EUR | Ultimo ano disp."),
    ),
    fluxos_caixa_financiamento: toNullableMonetaryValue(
      getSabiValue(sabiRow, "Fluxos de caixa das actividades de financiamento | th EUR | Ultimo ano disp."),
    ),
    total_ativo: toNullableMonetaryValue(getSabiValue(sabiRow, "Total do activo | th EUR | Ultimo ano disp.")),
    inventarios: toNullableMonetaryValue(getSabiValue(sabiRow, "Inventarios | th EUR | Ultimo ano disp.")),
    margem_bruta: toNullableMonetaryValue(getSabiValue(sabiRow, "Margem Bruta | th EUR | Ultimo ano disp.")),
    clientes: toNullableMonetaryValue(getSabiValue(sabiRow, "Clientes | th EUR | Ultimo ano disp.")),
    fornecedores: toNullableMonetaryValue(getSabiValue(sabiRow, "Fornecedores | th EUR | Ultimo ano disp.")),
    dividendos: toNullableMonetaryValue(getSabiValue(sabiRow, "Dividendos | th EUR | Ultimo ano disp.")),
    t_o_sub: toNullableNumber(getSabiValue(sabiRow, "T/o Sub")),
    source_dashboard: true,
    source_sabi: Boolean(sabiRow),
    raw_json_sabi: sabiRow?.rawJson ?? null,
  };
}

function createHistoryRows(sectorCode: string, bvdCode: string, sabiRow: SabiRow | undefined): CompanyHistoryInsert[] {
  if (!sabiRow) {
    return [];
  }

  const rows: CompanyHistoryInsert[] = [];

  for (const metric of HISTORY_METRICS) {
    for (let periodOffset = 0; periodOffset <= 7; periodOffset += 1) {
      const header =
        periodOffset === 0
          ? `${metric.sourceLabel} | th EUR | Ultimo ano disp.`
          : `${metric.sourceLabel} | th EUR | Ano - ${periodOffset}`;
      const employeeHeader =
        periodOffset === 0
          ? `${metric.sourceLabel} | Ultimo ano disp.`
          : `${metric.sourceLabel} | Ano - ${periodOffset}`;
      const value =
        metric.isMonetary
          ? toNullableMonetaryValue(getSabiValue(sabiRow, header))
          : toNullableNumber(getSabiValue(sabiRow, employeeHeader));

      if (value === null) {
        continue;
      }

      rows.push({
        sector_code: sectorCode,
        bvd_code: bvdCode,
        metric_key: metric.key,
        metric_label: metric.label,
        period_offset: periodOffset,
        value,
      });
    }
  }

  return rows;
}

async function runBatched<T>(items: T[], callback: (chunk: T[]) => Promise<void>) {
  for (let index = 0; index < items.length; index += CHUNK_SIZE) {
    const chunk = items.slice(index, index + CHUNK_SIZE);
    await callback(chunk);
  }
}

async function main() {
  const sectorCode = getSectorCode();
  const dashboardPath = resolveInputPath("Dashboard.xlsx");
  const sabiPath = resolveInputPath("SABI.xlsx");

  console.log(`Importing sector ${sectorCode} (${SECTOR_NAME})`);
  console.log(`Reading Dashboard from ${dashboardPath}`);
  console.log(`Reading SABI from ${sabiPath}`);

  const dashboardRows = readDashboardRows(dashboardPath);
  const sabiRows = readSabiRows(sabiPath);
  const importedCodes = new Set(dashboardRows.map((row) => row.bvdCode));

  const companyRecords: CompanyUpsert[] = [];
  const attributeRecords: CompanyAttributeInsert[] = [];
  const historyRecords: CompanyHistoryInsert[] = [];

  for (const dashboardRow of dashboardRows) {
    const sabiRow = sabiRows.get(dashboardRow.bvdCode);
    companyRecords.push(createCompanyRecord(sectorCode, dashboardRow, sabiRow));
    attributeRecords.push(
      ...dashboardRow.attributes.map((attribute) => ({
        sector_code: sectorCode,
        bvd_code: dashboardRow.bvdCode,
        ...attribute,
      })),
    );
    historyRecords.push(...createHistoryRows(sectorCode, dashboardRow.bvdCode, sabiRow));
  }

  const supabase = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error: sectorError } = await supabase.from("sectors").upsert(
    {
      sector_code: sectorCode,
      name: SECTOR_NAME,
      slug: SECTOR_SLUG,
      description: SECTOR_DESCRIPTION,
    },
    { onConflict: "sector_code" },
  );
  if (sectorError) {
    throw new Error(`Failed to upsert sector. Apply the SQL migration first. Supabase said: ${sectorError.message}`);
  }

  await runBatched([...importedCodes], async (chunk) => {
    const { error: attributeDeleteError } = await supabase
      .from("company_attributes")
      .delete()
      .eq("sector_code", sectorCode)
      .in("bvd_code", chunk);
    if (attributeDeleteError) {
      throw new Error(`Failed to clear existing company attributes: ${attributeDeleteError.message}`);
    }

    const { error: historyDeleteError } = await supabase
      .from("company_financial_history")
      .delete()
      .eq("sector_code", sectorCode)
      .in("bvd_code", chunk);
    if (historyDeleteError) {
      throw new Error(`Failed to clear existing company financial history: ${historyDeleteError.message}`);
    }
  });

  await runBatched(companyRecords, async (chunk) => {
    const { error } = await supabase.from("companies").upsert(chunk, { onConflict: "sector_code,bvd_code" });
    if (error) {
      throw new Error(`Failed to upsert companies: ${error.message}`);
    }
  });

  await runBatched(attributeRecords, async (chunk) => {
    const { error } = await supabase.from("company_attributes").upsert(chunk, {
      onConflict: "sector_code,bvd_code,attribute_key",
    });
    if (error) {
      throw new Error(`Failed to upsert company attributes: ${error.message}`);
    }
  });

  await runBatched(historyRecords, async (chunk) => {
    const { error } = await supabase.from("company_financial_history").upsert(chunk, {
      onConflict: "sector_code,bvd_code,metric_key,period_offset",
    });
    if (error) {
      throw new Error(`Failed to upsert company financial history: ${error.message}`);
    }
  });

  const { data: existingCompanies, error: existingCompaniesError } = await supabase
    .from("companies")
    .select("bvd_code")
    .eq("sector_code", sectorCode);
  if (existingCompaniesError) {
    throw new Error(`Failed to read current company codes: ${existingCompaniesError.message}`);
  }

  const staleCodes = (existingCompanies ?? [])
    .map((row) => row.bvd_code as string)
    .filter((bvdCode) => !importedCodes.has(bvdCode));

  await runBatched(staleCodes, async (chunk) => {
    const { error } = await supabase.from("companies").delete().eq("sector_code", sectorCode).in("bvd_code", chunk);
    if (error) {
      throw new Error(`Failed to remove stale companies: ${error.message}`);
    }
  });

  console.log("Import complete.");
  console.log(`Companies upserted: ${companyRecords.length}`);
  console.log(`Attribute rows upserted: ${attributeRecords.length}`);
  console.log(`History rows upserted: ${historyRecords.length}`);
  console.log(`SABI-only rows ignored: ${Math.max(0, sabiRows.size - dashboardRows.length)}`);
  console.log(`Stale companies removed: ${staleCodes.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

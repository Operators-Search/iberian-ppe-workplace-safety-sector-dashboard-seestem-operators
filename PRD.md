# PRD — The Iberian Freight Forwarding Sector Dashboard

## 1. Objetivo
Crear una web app pública, simple y visual, para analizar el sector **The Iberian freight forwarding sector** a partir de dos archivos Excel cargados manualmente.

La app debe permitir:
- entender rápidamente el sector,
- explorar y filtrar compañías,
- identificar grupos de empresas por propietario,
- visualizar métricas financieras agregadas y atributos sectoriales.

## 2. Alcance de la v1
La v1 tendrá **3 secciones principales** en una navegación lateral izquierda:
1. **Overview** del sector
2. **Companies** (listado y exploración de compañías)
3. **Ownership Groups** (agrupación por propietario)

La app será **read-only**, sin panel de administración y sin edición desde interfaz.

## 3. Stack tecnológico
- **Frontend:** Next.js
- **Hosting:** Vercel
- **Base de datos:** Supabase Postgres
- **Estilo/UI:** simple, limpio, orientado a dashboard
- **Importación de datos:** manual, a partir de los 2 Excel preparados

## 4. Usuarios
Usuario público con acceso de consulta.

## 5. Fuentes de datos
### Archivo 1: Dashboard.xlsx
Contiene una fila por compañía y mezcla:
- datos generales,
- métricas financieras resumidas,
- atributos sectoriales.

### Archivo 2: SABI.xlsx
Contiene muchas columnas financieras adicionales por compañía.

## 6. Regla clave de negocio
El identificador único de cada compañía será siempre **BvD Code**.

En el archivo **Dashboard.xlsx**:
- desde **A** hasta **Q** se tratará como dato estándar,
- todo lo que venga después se tratará como **atributo booleano** del sector.

Para este sector, los atributos booleanos son:
- Ocean freight
- Air freight
- Road freight
- Rail intermodal
- Customs clearance
- Temperature controlled cold chain
- Pharma or GDP related
- Dangerous goods chemicals

Regla de importación de atributos:
- `✓` = `true`
- `⮽`, `x`, `X` o vacío = `false`

## 7. Objetivos funcionales
### 7.1 Overview
Mostrar una visión general del sector con métricas y gráficos simples.

Debe incluir al menos:
- número total de compañías,
- ingresos totales del sector,
- EBITDA total del sector,
- EBITDA % medio o mediano,
- deuda neta total o agregada cuando aplique,
- distribución por país,
- distribución por provincia,
- distribución por atributos sectoriales,
- ranking top compañías por ingresos,
- ranking top compañías por EBITDA.

### 7.2 Companies
Pantalla para explorar todas las compañías.

Debe incluir:
- tabla principal con búsqueda,
- filtros,
- ordenación,
- vista de detalle al seleccionar una compañía.

Filtros mínimos:
- texto libre por nombre,
- país,
- provincia,
- propietario,
- atributos booleanos,
- rangos de variables financieras clave.

Detalle de compañía:
- datos generales,
- métricas financieras principales,
- atributos sectoriales,
- datos ampliados disponibles desde SABI si existen.

### 7.3 Ownership Groups
Pantalla para detectar concentración sectorial por propietario.

Regla:
- si un mismo valor de **Propietario** aparece en **2 o más compañías**, se considera un **grupo**.

Cada grupo debe mostrar:
- nombre del propietario,
- número de compañías del grupo,
- lista de compañías que cuelgan de ese propietario,
- ingresos totales del grupo,
- EBITDA total del grupo,
- deuda neta total del grupo,
- otras métricas agregadas disponibles.

Visualización:
- una vista simple tipo árbol/lista jerárquica o tarjetas expandibles,
- no hace falta construir un organigrama societario complejo.

## 8. Diseño funcional de navegación
Sidebar izquierda con 3 entradas:
- Overview
- Companies
- Ownership Groups

Comportamiento:
- app de una sola experiencia continua,
- navegación rápida entre vistas,
- diseño desktop-first.

## 9. Requisitos de producto
- interfaz simple,
- construcción rápida,
- mantenimiento sencillo,
- datos públicos de lectura,
- buen rendimiento con dataset pequeño/medio,
- estructura preparada para reutilizarse en otros sectores más adelante, aunque la v1 será solo para este sector.

## 10. Modelo de datos propuesto
### Tabla: companies
Campos principales provenientes de Dashboard y/o SABI:
- bvd_code (PK)
- nombre
- webpage
- nif
- pais
- provincia
- localidade
- concelho
- distrito
- fecha_fundacion
- situacion_actual
- ultimo_ano_disponible
- empleados
- propietario
- propietario_final_global
- cae_codigo
- cae_descripcion
- actividad_descripcion
- english_trade_description
- t_o
- cagr
- ebitda
- ebitda_pct
- net_debt
- nd_ebitda
- wc
- wc_t_o
- source_dashboard boolean
- source_sabi boolean
- raw_json_sabi opcional para columnas extra no normalizadas
- created_at
- updated_at

### Tabla: company_attributes
- id
- bvd_code (FK -> companies)
- attribute_key
- attribute_label
- value boolean

Para esta v1, los atributos a cargar serán los 7 definidos.

### Tabla opcional: company_financial_history
Para mantener la app simple pero útil, se recomienda guardar histórico solo de un subconjunto clave de SABI.

Campos:
- id
- bvd_code (FK -> companies)
- metric_key
- metric_label
- period_offset
- value

Donde:
- `period_offset = 0` es último año disponible
- `period_offset = 1..7` son años anteriores

Métricas históricas recomendadas para v1:
- volume_negocios
- net_debt
- ebitda
- ebit
- empleados

## 11. Regla de consolidación de datos
- La unión entre ambos archivos se hará por **BvD Code**.
- Si una compañía existe en ambos archivos, se combinarán sus datos.
- Si una columna del Excel no aporta valor para la app v1, se puede ignorar.
- En caso de conflicto entre columnas equivalentes, se priorizará:
  1. **Dashboard.xlsx** para campos ya preparados del dashboard sectorial
  2. **SABI.xlsx** para enriquecer detalle e histórico financiero
- Se dejará trazabilidad mínima del origen del dato por archivo.

### Columnas de SABI a usar en v1
#### Identificación y perfil
- BvD Code
- Nome
- Último Ano Disponível
- Data Fundação
- Situação Actual
- Proprietário final global - Nome
- País
- Localidade
- Concelho
- Distrito
- Código da CAE Rev.3 Principal
- Descrição da CAE Rev.3 Principal
- Descrição da Actividade
- English trade description
- Endereço Internet
- BvD ID

#### Financieras latest year
- Vendas total
- Prestação serviços - Total
- Volume de Negócios
- Net Debt
- EBITDA
- EBIT
- Resultado Líquido do Exercício
- Total do capital próprio
- Financiamentos obtidos não correntes
- Financiamentos obtidos correntes
- Caixa e depósitos bancários
- Fluxos de caixa das actividades operacionais
- Fluxos de caixa das actividades de investimento
- Fluxos de caixa das actividades de financiamento
- Total do activo
- Inventários
- Margem Bruta
- Clientes
- Fornecedores
- Dividendos
- Empregados
- T/o Sub
- latest_period_end

#### Históricos a usar en v1
- Volume de Negócios (Ano - 1 a Ano - 7)
- Net Debt (Ano - 1 a Ano - 7)
- EBITDA (Ano - 1 a Ano - 7)
- EBIT (Ano - 1 a Ano - 7)
- Empregados (Ano - 1 a Ano - 7)

#### Columnas de SABI que se pueden ignorar en v1
Para mantener la construcción simple, no es necesario normalizar en esta primera versión:
- detalle histórico completo de ventas por mercado
- detalle histórico completo de prestación de servicios por mercado
- resultado líquido histórico completo
- capital propio histórico completo
- deuda corriente/no corriente histórica completa
- caja histórica completa
- flujos de caja históricos completos
- activo total histórico completo
- inventarios históricos completos
- margen bruta histórica completa
- clientes históricos completos
- proveedores históricos completos
- dividendos históricos completos
- Shareholder1..4 y Share1..4
- Ganhos/perdas imputados de subsidiárias, associadas e empreendimentos conjuntos

Estas columnas pueden guardarse en `raw_json_sabi` si interesa preservarlas sin usarlas en la interfaz.

## 12. Importación de datos
La importación será **manual**.

Proceso esperado:
1. subir o colocar los 2 Excel en el proyecto,
2. ejecutar script de parseo,
3. normalizar nombres de columnas,
4. convertir atributos booleanos del Dashboard,
5. seleccionar solo las columnas útiles de SABI para v1,
6. hacer merge por BvD Code,
7. cargar tablas en Supabase.

No habrá en v1:
- panel de subida desde UI,
- edición manual desde frontend,
- automatización programada.

## 13. Métricas agregadas
La app debe poder calcular al menos:
- total compañías,
- total ingresos,
- total EBITDA,
- EBITDA medio/mediano,
- total net debt,
- media/mediana de ND/EBITDA,
- total empleados,
- conteo por atributo,
- porcentaje de compañías por atributo,
- número de grupos por propietario,
- top grupos por ingresos,
- top grupos por EBITDA.

Con SABI, además se podrán mostrar en v1:
- evolución histórica de ingresos,
- evolución histórica de EBITDA,
- evolución histórica de net debt,
- evolución histórica de empleados,
- mix simple entre ventas y prestación de servicios cuando exista dato.

## 14. Visualizaciones sugeridas
### Overview
- KPI cards
- barras para top compañías
- barras para atributos
- donut o barras para país/provincia
- tabla resumen

### Companies
- tabla con filtros
- panel lateral o página detalle

### Ownership Groups
- tabla de grupos
- tarjetas expandibles
- vista jerárquica simple
- barras de top grupos

## 15. Reglas de UX
- no sobrecargar la interfaz,
- priorizar claridad frente a complejidad,
- filtros visibles y fáciles de resetear,
- tooltips o etiquetas comprensibles,
- formato consistente en importes, porcentajes y ratios,
- soportar valores vacíos sin romper vistas.

## 16. Requisitos no funcionales
- app pública,
- lectura rápida,
- responsive básico,
- tiempo de carga razonable,
- consultas simples y mantenibles,
- código limpio para que luego Codex lo implemente fácilmente.

## 17. Seguridad y acceso
- acceso público de lectura,
- sin login en v1,
- Supabase configurado para exponer solo lo necesario de lectura pública.

## 18. Fuera de alcance en v1
- edición de datos desde la app,
- múltiples sectores en la misma interfaz,
- benchmark entre sectores,
- autenticación de usuarios,
- exportaciones complejas,
- generación automática de informes,
- visualización societaria legal avanzada,
- ETL automático recurrente.

## 19. Decisiones cerradas
- Sector inicial único: **The Iberian freight forwarding sector**
- Importación: **manual**
- Identificador único: **BvD Code**
- Grupos: por coincidencia de **Propietario** en 2 o más compañías
- App: **simple, pública y read-only**
- Se usarán los **2 Excel preparados** y se ignorarán columnas no útiles

## 20. Supuestos operativos
- Los nombres de propietario vienen suficientemente limpios para agrupar sin una lógica compleja de matching.
- Las métricas agregadas de grupo se calcularán como suma de las compañías del mismo propietario presentes en el dataset.
- Los datos del sector no necesitan actualización automática frecuente en v1.

## 21. Entregables esperados para desarrollo
Codex deberá generar:
- app Next.js desplegable en Vercel,
- esquema SQL para Supabase,
- script de importación de los 2 Excel,
- páginas/vistas de Overview, Companies y Ownership Groups,
- componentes de filtros y tablas,
- consultas para métricas agregadas,
- README con pasos de instalación, variables de entorno e importación.

## 22. Criterios de aceptación
La v1 estará bien si:
- carga correctamente ambos Excel,
- usa BvD Code como clave única,
- trata correctamente como booleanos los 7 atributos definidos,
- muestra overview con KPIs y gráficos básicos,
- permite buscar y filtrar compañías,
- permite abrir detalle de compañía,
- detecta grupos por propietario con 2 o más compañías,
- agrega métricas financieras por grupo,
- funciona como app pública en Vercel con datos en Supabase,
- mantiene una experiencia simple y clara.

## 23. Recomendación de implementación
Hacer una **v1 muy ligera**, con:
- tablas limpias,
- pocos gráficos pero útiles,
- importación robusta,
- ownership groups sencillos,
- sin intentar modelar toda la complejidad de SABI en esta fase.

Eso permitirá tener una primera versión funcional rápida y luego iterar.

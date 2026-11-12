
"""
╔══════════════════════════════════════════════════════════════╗
║        ETL PIPELINE — HAPPY WORLD DASHBOARD 🌍              ║
║        World Happiness Report 2015-2024                      ║
║        Autores: Diego Murguía & Aram Martínez                ║
║        Universidad del Caribe — Visualización de Datos       ║
╚══════════════════════════════════════════════════════════════╝

USO:
    python etl_happy_world.py

REQUISITOS:
    pip install pandas numpy scipy

ENTRADA:
    Carpeta 'data/raw/' con archivos CSV de Kaggle (2015-2024)
    
SALIDA:
    - data/processed/happiness_consolidated.csv  → Dataset limpio consolidado
    - data/processed/happiness_metadata.json     → Metadatos del proceso ETL
    - Reporte de calidad en consola
"""

import pandas as pd
import numpy as np
import json
import os
from datetime import datetime


# ============================================================
# 📁 CONFIGURACIÓN DE RUTAS
# ============================================================
# Cambia estas rutas según tu estructura de proyecto
RAW_DATA_DIR = "public/data/raw"          # ← Donde colocas los CSV de Kaggle
PROCESSED_DIR = "public/data/processed"   # ← Donde se guarda el resultado
OUTPUT_FILE = os.path.join(PROCESSED_DIR, "happiness_consolidated.csv")
METADATA_FILE = os.path.join(PROCESSED_DIR, "happiness_metadata.json")


# ============================================================
# 📋 PASO 1: DEFINICIÓN DE ARCHIVOS CSV
# ============================================================
# ⚠️ INSTRUCCIÓN: Agrega aquí los CSV que faltan cuando los descargues
CSV_FILES = {
    2015: os.path.join(RAW_DATA_DIR, "world_happiness_2015.csv"),
    2016: os.path.join(RAW_DATA_DIR, "world_happiness_2016.csv"),
    2017: os.path.join(RAW_DATA_DIR, "world_happiness_2017.csv"),
    2018: os.path.join(RAW_DATA_DIR, "world_happiness_2018.csv"),
    2019: os.path.join(RAW_DATA_DIR, "world_happiness_2019.csv"),
    2020: os.path.join(RAW_DATA_DIR, "world_happiness_2020.csv"),
    2021: os.path.join(RAW_DATA_DIR, "world_happiness_2021.csv"),
    2022: os.path.join(RAW_DATA_DIR, "world_happiness_2022.csv"),
    2023: os.path.join(RAW_DATA_DIR, "world_happiness_2023.csv"),
    2024: os.path.join(RAW_DATA_DIR, "world_happiness_2024.csv"),
}


# ============================================================
# 📋 PASO 2: COLUMNAS ESTÁNDAR DEL DASHBOARD
# ============================================================
# Nombres internos limpios (snake_case, sin espacios)
STANDARD_COLUMNS = {
    "Ranking": "ranking",
    "Country": "country",
    "Regional indicator": "region",
    "Happiness score": "happiness_score",
    "GDP per capita": "gdp_per_capita",
    "Social support": "social_support",
    "Healthy life expectancy": "life_expectancy",
    "Freedom to make life choices": "freedom",
    "Generosity": "generosity",
    "Perceptions of corruption": "corruption_perception",
}

NUMERIC_COLS = [
    "happiness_score", "gdp_per_capita", "social_support",
    "life_expectancy", "freedom", "generosity", "corruption_perception"
]

# Columnas donde 0 es un valor IMPOSIBLE (se tratan como nulos)
ZERO_IS_NULL_COLS = [
    "gdp_per_capita", "social_support", "freedom"
]


# ============================================================
# 📋 PASO 3: DICCIONARIO DE ESTANDARIZACIÓN DE NOMBRES DE PAÍSES
# ============================================================
# Mapea variantes históricas al nombre actual/consistente
COUNTRY_NAME_MAP = {
    # Cambios de nombre oficial
    "Czech Republic": "Czechia",
    "Macedonia": "North Macedonia",
    "Swaziland": "Eswatini",
    
    # Variantes de idioma / transliteración
    "Argelia": "Algeria",
    
    # Variantes de formato
    "Taiwan Province of China": "Taiwan",
    "Hong Kong S.A.R. of China": "Hong Kong",
    "Hong Kong S.A.R., China": "Hong Kong",
    "Congo (Brazzaville)": "Congo (Brazzaville)",
    "Congo (Kinshasa)": "Congo (Kinshasa)",
    "Congo": "Congo (Kinshasa)",
    
    # Regiones especiales → unificar
    "North Cyprus": "North Cyprus",
    "Somaliland region": "Somaliland",
    "Somaliland Region": "Somaliland",
    
    # Correcciones de espacios/encoding
    "Trinidad and Tobago": "Trinidad and Tobago",
    "Bosnia and Herzegovina": "Bosnia and Herzegovina",
    
    # ⚠️ AGREGA MÁS AQUÍ si detectas variantes en los CSV 2016-2024
    # "NombreVariante": "NombreEstándar",
}


# ============================================================
# 📋 PASO 4: MAPEO DE REGIONES (para imputación y dashboard)
# ============================================================
# Si algún CSV no trae región, se asigna desde aquí
REGION_OVERRIDES = {
    "Algeria": "Middle East and North Africa",
    "Congo (Kinshasa)": "Sub-Saharan Africa",
    "Congo (Brazzaville)": "Sub-Saharan Africa",
    "North Cyprus": "Western Europe",
    "Somaliland": "Sub-Saharan Africa",
    "Taiwan": "East Asia",
    "Hong Kong": "East Asia",
    "Kosovo": "Central and Eastern Europe",
    "Gambia": "Sub-Saharan Africa",
    "Namibia": "Sub-Saharan Africa",
    # ⚠️ AGREGA MÁS si encuentras países sin región
}


# ============================================================
# 🔧 FUNCIONES ETL
# ============================================================

def print_header(title):
    """Imprime un header decorado en consola."""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def extract_csv(filepath, year):
    """
    EXTRACT: Lee un CSV con formato europeo (;  y ,)
    Agrega la columna 'year'.
    """
    if not os.path.exists(filepath):
        print(f"  ⚠️  Archivo no encontrado: {filepath} → SALTANDO año {year}")
        return None
    
    try:
        df = pd.read_csv(filepath, sep=';', decimal=',')
        df['year'] = year
        print(f"  ✅ {year}: {len(df)} países cargados ({os.path.basename(filepath)})")
        return df
    except Exception as e:
        print(f"  ❌ Error leyendo {filepath}: {e}")
        return None


def standardize_columns(df):
    """
    Renombra columnas al formato estándar snake_case.
    Maneja posibles variaciones en los nombres de columnas entre años.
    """
    # Primero intentar el mapeo directo
    rename_map = {}
    for original, standard in STANDARD_COLUMNS.items():
        if original in df.columns:
            rename_map[original] = standard
    
    df = df.rename(columns=rename_map)
    
    # Asegurar que todas las columnas estándar existen
    for std_col in STANDARD_COLUMNS.values():
        if std_col not in df.columns:
            print(f"    ⚠️  Columna '{std_col}' no encontrada → se crea como NaN")
            df[std_col] = np.nan
    
    return df


def standardize_country_names(df):
    """
    Estandariza nombres de países usando el diccionario COUNTRY_NAME_MAP.
    También limpia espacios en blanco.
    """
    df['country'] = df['country'].str.strip()
    df['country'] = df['country'].replace(COUNTRY_NAME_MAP)
    return df


def fix_region_assignments(df):
    """
    Corrige/asigna regiones faltantes o incorrectas.
    """
    for country, region in REGION_OVERRIDES.items():
        mask = df['country'] == country
        if mask.any():
            df.loc[mask, 'region'] = region
    return df


def handle_zero_as_null(df):
    """
    Reemplaza ceros sospechosos por NaN en columnas donde 0 es imposible.
    GDP per cápita no puede ser 0, Social support no puede ser 0, etc.
    """
    replaced_count = 0
    for col in ZERO_IS_NULL_COLS:
        if col in df.columns:
            zeros_mask = df[col] == 0
            n_zeros = zeros_mask.sum()
            if n_zeros > 0:
                countries = df.loc[zeros_mask, 'country'].tolist()
                years = df.loc[zeros_mask, 'year'].tolist()
                pairs = [f"{c} ({y})" for c, y in zip(countries, years)]
                print(f"  🔄 {col}: {n_zeros} ceros → NaN | {pairs[:5]}")
                df.loc[zeros_mask, col] = np.nan
                replaced_count += n_zeros
    
    return df, replaced_count


def impute_missing_values(df):
    """
    Imputa valores faltantes (NaN) con la MEDIANA REGIONAL del mismo año.
    Si no hay suficientes datos regionales, usa la mediana global del año.
    Estrategia conservadora que preserva patrones regionales.
    """
    imputed_count = 0
    
    for col in NUMERIC_COLS:
        nulls_before = df[col].isnull().sum()
        if nulls_before == 0:
            continue
        
        # Paso 1: Imputar con mediana regional del mismo año
        df[col] = df.groupby(['year', 'region'])[col].transform(
            lambda x: x.fillna(x.median())
        )
        
        # Paso 2: Si aún quedan NaN, usar mediana global del año
        df[col] = df.groupby('year')[col].transform(
            lambda x: x.fillna(x.median())
        )
        
        nulls_after = df[col].isnull().sum()
        imputed = nulls_before - nulls_after
        if imputed > 0:
            print(f"  📊 {col}: {imputed} valores imputados (mediana regional/global)")
            imputed_count += imputed
    
    return df, imputed_count


def normalize_corruption_scale(df):
    """
    ⚠️ PROBLEMA CRÍTICO DETECTADO:
    La escala de 'Perceptions of corruption' cambia entre años:
      - Algunos años: 1 = MÁS corrupto (media ~0.74)
      - Otros años: 1 = MENOS corrupto (media ~0.26)
    
    SOLUCIÓN: Normalizar a escala uniforme donde:
      1 = MAYOR percepción de corrupción (peor)
      0 = MENOR percepción de corrupción (mejor)
    
    Criterio de detección: Si la media del año > 0.5, 
    la escala ya apunta a "más corrupto = más alto" → no invertir.
    Si media < 0.5, está invertida → aplicar (1 - valor).
    """
    years_inverted = []
    
    for year in df['year'].unique():
        mask = df['year'] == year
        mean_val = df.loc[mask, 'corruption_perception'].mean()
        
        if mean_val < 0.5:
            # Escala invertida: 1 = menos corrupto → invertir a 1 = más corrupto
            df.loc[mask, 'corruption_perception'] = 1 - df.loc[mask, 'corruption_perception']
            years_inverted.append(year)
    
    if years_inverted:
        print(f"  🔄 Escala de corrupción invertida en años: {sorted(years_inverted)}")
        print(f"     Ahora uniforme: 1 = MAYOR percepción de corrupción")
    else:
        print(f"  ✅ Escala de corrupción consistente en todos los años")
    
    return df


def cap_outliers_iqr(df, factor=1.5):
    """
    Aplica CAPPING (winsorización) de outliers usando el método IQR.
    NO elimina registros — los ajusta al límite del rango válido.
    Se aplica por AÑO para respetar tendencias temporales.
    
    Esto es mejor que eliminar porque:
    - Países en crisis (Afghanistan, Venezuela) son datos REALES
    - Solo suaviza valores extremos sin perder información
    """
    capped_count = 0
    
    for col in NUMERIC_COLS:
        for year in df['year'].unique():
            mask = df['year'] == year
            data = df.loc[mask, col].dropna()
            
            if len(data) < 10:  # No aplicar si hay pocos datos
                continue
            
            Q1 = data.quantile(0.25)
            Q3 = data.quantile(0.75)
            IQR = Q3 - Q1
            lower = Q1 - factor * IQR
            upper = Q3 + factor * IQR
            
            # Contar y capear
            below = (df.loc[mask, col] < lower).sum()
            above = (df.loc[mask, col] > upper).sum()
            
            if below + above > 0:
                df.loc[mask, col] = df.loc[mask, col].clip(lower=lower, upper=upper)
                capped_count += below + above
    
    return df, capped_count


def add_derived_columns(df):
    """
    Agrega columnas calculadas útiles para el dashboard:
    - happiness_category: Categoría textual del score
    - is_latin_america: Flag booleano para filtro rápido
    - score_normalized: Happiness score normalizado 0-100 (para radar chart)
    - social_support_pct: Apoyo social como porcentaje (0-100%)
    - freedom_pct: Libertad como porcentaje (0-100%)
    - corruption_pct: Corrupción como porcentaje (0-100%)
    """
    # Categoría de felicidad (para el mapa choropleth)
    bins = [0, 4, 5, 6, 7, 10]
    labels = ['Muy bajo', 'Bajo', 'Medio', 'Alto', 'Muy alto']
    df['happiness_category'] = pd.cut(
        df['happiness_score'], bins=bins, labels=labels, include_lowest=True
    )
    
    # Flag Latin America
    df['is_latin_america'] = (df['region'] == 'Latin America and Caribbean').astype(int)
    
    # Porcentajes para el dashboard (escala 0-100)
    df['social_support_pct'] = (df['social_support'] * 100).round(1)
    df['freedom_pct'] = (df['freedom'] * 100).round(1)
    df['corruption_pct'] = (df['corruption_perception'] * 100).round(1)
    df['generosity_pct'] = (df['generosity'] * 100).round(1)
    
    # Score normalizado 0-100 (para radar chart)
    df['happiness_normalized'] = ((df['happiness_score'] / 10) * 100).round(1)
    
    print(f"  ✅ 7 columnas derivadas agregadas")
    
    return df


def generate_quality_report(df):
    """
    Genera un reporte final de calidad del dataset consolidado.
    """
    print_header("📊 REPORTE FINAL DE CALIDAD")
    
    print(f"\n  📐 Dimensiones finales: {df.shape[0]} filas × {df.shape[1]} columnas")
    print(f"  📅 Años cubiertos: {sorted(df['year'].unique())}")
    print(f"  🌍 Total países únicos: {df['country'].nunique()}")
    print(f"  🗺️  Total regiones: {df['region'].nunique()}")
    
    print(f"\n  📊 Países por año:")
    for year in sorted(df['year'].unique()):
        n = df[df['year'] == year].shape[0]
        print(f"     {year}: {n} países")
    
    print(f"\n  📊 Países por región:")
    region_counts = df.groupby('region')['country'].nunique().sort_values(ascending=False)
    for region, count in region_counts.items():
        print(f"     {region}: {count} países")
    
    print(f"\n  🔍 Valores nulos restantes:")
    nulls = df[NUMERIC_COLS].isnull().sum()
    total_nulls = nulls.sum()
    if total_nulls == 0:
        print(f"     ✅ CERO nulos — Dataset completamente limpio")
    else:
        for col, n in nulls.items():
            if n > 0:
                print(f"     ⚠️ {col}: {n} nulos")
    
    print(f"\n  📊 Estadísticas descriptivas del dataset final:")
    stats = df[NUMERIC_COLS].describe().round(4)
    print(stats.to_string())
    
    return {
        "total_rows": int(df.shape[0]),
        "total_columns": int(df.shape[1]),
        "years": sorted([int(y) for y in df['year'].unique()]),
        "unique_countries": int(df['country'].nunique()),
        "unique_regions": int(df['region'].nunique()),
        "remaining_nulls": int(total_nulls),
        "countries_per_year": {
            int(y): int(df[df['year'] == y].shape[0]) 
            for y in sorted(df['year'].unique())
        }
    }


def save_outputs(df, metadata):
    """
    Guarda el CSV consolidado y los metadatos del proceso.
    """
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    
    # Ordenar por año y ranking
    df = df.sort_values(['year', 'ranking']).reset_index(drop=True)
    
    # Guardar CSV (formato estándar: coma como separador, punto como decimal)
    df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8')
    print(f"\n  💾 CSV guardado: {OUTPUT_FILE}")
    print(f"     Formato: UTF-8, separador=coma, decimal=punto")
    
    # Guardar metadatos
    metadata['generated_at'] = datetime.now().isoformat()
    metadata['output_file'] = OUTPUT_FILE
    
    with open(METADATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    print(f"  💾 Metadatos guardados: {METADATA_FILE}")


# ============================================================
# 🚀 PIPELINE PRINCIPAL
# ============================================================

def main():
    print("\n" + "🌍" * 35)
    print("  HAPPY WORLD — ETL PIPELINE")
    print("  World Happiness Report 2015-2024")
    print("🌍" * 35)
    
    # ─────────────────────────────────────
    # FASE 1: EXTRACT — Cargar todos los CSV
    # ─────────────────────────────────────
    print_header("📥 FASE 1: EXTRACCIÓN (Extract)")
    
    dataframes = []
    loaded_years = []
    
    for year, filepath in sorted(CSV_FILES.items()):
        df = extract_csv(filepath, year)
        if df is not None:
            dataframes.append(df)
            loaded_years.append(year)
    
    if not dataframes:
        print("\n  ❌ No se cargó ningún archivo. Verifica la ruta RAW_DATA_DIR.")
        return
    
    print(f"\n  📦 Total: {len(dataframes)} archivos cargados | Años: {loaded_years}")
    
    # Consolidar en un solo DataFrame
    df = pd.concat(dataframes, ignore_index=True)
    print(f"  📐 Dataset consolidado: {df.shape[0]} filas × {df.shape[1]} columnas")
    
    # ─────────────────────────────────────
    # FASE 2: TRANSFORM — Limpieza y estandarización
    # ─────────────────────────────────────
    print_header("🔧 FASE 2: TRANSFORMACIÓN (Transform)")
    
    # Paso 2.1: Estandarizar nombres de columnas
    print("\n  📌 2.1 — Estandarización de columnas...")
    df = standardize_columns(df)
    print(f"     Columnas finales: {list(df.columns)}")
    
    # Paso 2.2: Estandarizar nombres de países
    print("\n  📌 2.2 — Estandarización de nombres de países...")
    countries_before = df['country'].nunique()
    df = standardize_country_names(df)
    countries_after = df['country'].nunique()
    print(f"     Países únicos: {countries_before} → {countries_after} (deduplicados: {countries_before - countries_after})")
    
    # Paso 2.3: Corregir asignación de regiones
    print("\n  📌 2.3 — Corrección de regiones...")
    df = fix_region_assignments(df)
    missing_regions = df['region'].isnull().sum()
    print(f"     Regiones faltantes después de corrección: {missing_regions}")
    
    # Paso 2.4: Tratar ceros como nulos
    print("\n  📌 2.4 — Ceros sospechosos → NaN...")
    df, zeros_replaced = handle_zero_as_null(df)
    print(f"     Total ceros reemplazados: {zeros_replaced}")
    
    # Paso 2.5: Normalizar escala de corrupción
    print("\n  📌 2.5 — Normalización de escala de corrupción...")
    df = normalize_corruption_scale(df)
    
    # Paso 2.6: Imputar valores faltantes
    print("\n  📌 2.6 — Imputación de valores faltantes (mediana regional)...")
    df, imputed = impute_missing_values(df)
    print(f"     Total valores imputados: {imputed}")
    
    # Paso 2.7: Capping de outliers
    print("\n  📌 2.7 — Capping de outliers (IQR × 1.5)...")
    df, capped = cap_outliers_iqr(df, factor=1.5)
    print(f"     Total valores capeados: {capped}")
    
    # Paso 2.8: Convertir tipos de datos
    print("\n  📌 2.8 — Conversión de tipos de datos...")
    df['life_expectancy'] = df['life_expectancy'].astype(float)
    df['ranking'] = df['ranking'].astype(int)
    df['year'] = df['year'].astype(int)
    print(f"     ✅ life_expectancy → float64, ranking → int, year → int")
    
    # Paso 2.9: Redondear valores numéricos
    print("\n  📌 2.9 — Redondeo de decimales...")
    for col in NUMERIC_COLS:
        if col == 'life_expectancy':
            df[col] = df[col].round(1)
        else:
            df[col] = df[col].round(4)
    print(f"     ✅ Métricas: 4 decimales | Esperanza de vida: 1 decimal")
    
    # Paso 2.10: Agregar columnas derivadas
    print("\n  📌 2.10 — Columnas derivadas para el dashboard...")
    df = add_derived_columns(df)
    
    # Paso 2.11: Eliminar duplicados
    print("\n  📌 2.11 — Verificación de duplicados...")
    dupes = df.duplicated(subset=['country', 'year']).sum()
    if dupes > 0:
        df = df.drop_duplicates(subset=['country', 'year'], keep='first')
        print(f"     🔄 {dupes} duplicados eliminados")
    else:
        print(f"     ✅ Sin duplicados (country + year)")
    
    # ─────────────────────────────────────
    # FASE 3: LOAD — Guardar resultados
    # ─────────────────────────────────────
    print_header("💾 FASE 3: CARGA (Load)")
    
    # Reporte de calidad
    metadata = generate_quality_report(df)
    
    # Guardar archivos
    save_outputs(df, metadata)
    
    # ─────────────────────────────────────
    # RESUMEN FINAL
    # ─────────────────────────────────────
    print_header("✅ ETL COMPLETADO EXITOSAMENTE")
    print(f"""
    📁 Archivo generado: {OUTPUT_FILE}
    📐 Dimensiones: {df.shape[0]} filas × {df.shape[1]} columnas
    📅 Período: {df['year'].min()} — {df['year'].max()}
    🌍 Países: {df['country'].nunique()}
    🗺️  Regiones: {df['region'].nunique()}
    
    🔜 SIGUIENTE PASO:
       Copia '{OUTPUT_FILE}' a la carpeta
       'public/data/' de tu proyecto Vite + React
    """)
    
    return df


# ============================================================
# ▶️ EJECUTAR
# ============================================================
if __name__ == "__main__":
    df = main()


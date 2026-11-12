
"""

║   FIX SCRIPT — Correcciones sobre happiness_consolidated     ║

USO:
    python fix_happiness_data.py

ENTRADA:
    happiness_consolidated.csv (archivo actual)
    
SALIDA:
    happiness_final.csv (listo para el dashboard React)
"""

import pandas as pd
import numpy as np
import os


# ============================================================
# 📥 CARGAR DATOS
# ============================================================
INPUT_FILE = "public/data/processed/happiness_consolidated.csv"
OUTPUT_FILE = "public/data/processed/happiness_final.csv"

print("🌍 HAPPY WORLD — Script de corrección post-auditoría")
print("=" * 60)

df = pd.read_csv(INPUT_FILE)
print(f"📥 Cargado: {df.shape[0]} filas × {df.shape[1]} columnas")
rows_initial = len(df)


# ============================================================
# 🔴 FIX #1 y #2: Fusionar 'Ladder score' → 'happiness_score'
# ============================================================
print("\n🔧 FIX #1-2: Fusionando Ladder score → happiness_score...")

# Donde happiness_score es NaN y Ladder score tiene datos, rellenar
mask_fill = df['happiness_score'].isna() & df['Ladder score'].notna()
df.loc[mask_fill, 'happiness_score'] = df.loc[mask_fill, 'Ladder score']
print(f"   ✅ {mask_fill.sum()} valores de 2024 transferidos")

# Eliminar la columna redundante
df = df.drop(columns=['Ladder score'])
print(f"   ✅ Columna 'Ladder score' eliminada")

# Verificar
nulls_remaining = df['happiness_score'].isnull().sum()
print(f"   📊 happiness_score nulos restantes: {nulls_remaining}")


# ============================================================
# 🟡 FIX #3: Asignar regiones faltantes
# ============================================================
print("\n🔧 FIX #3: Asignando regiones faltantes...")

REGION_FIXES = {
    "Greece": "Western Europe",
    "Cyprus": "Western Europe",
}

for country, region in REGION_FIXES.items():
    mask = (df['country'] == country) & (df['region'].isna())
    fixed = mask.sum()
    if fixed > 0:
        df.loc[mask, 'region'] = region
        print(f"   ✅ {country} → '{region}' ({fixed} fila(s))")

null_regions = df['region'].isnull().sum()
print(f"   📊 Regiones nulas restantes: {null_regions}")


# ============================================================
# 🟡 FIX #4: Generosity = 0 → NaN → imputar con mediana regional
# ============================================================
print("\n🔧 FIX #4: Tratando generosity=0 como dato faltante...")

# Generosity=0 exacto es sospechoso (GDP y Social support 0 ya fueron
# tratados previamente, pero generosity se dejó)
zero_gen_mask = df['generosity'] == 0
n_zeros = zero_gen_mask.sum()
countries_affected = df.loc[zero_gen_mask, 'country'].unique()
print(f"   🔍 {n_zeros} ceros encontrados en: {list(countries_affected)}")

# Convertir a NaN
df.loc[zero_gen_mask, 'generosity'] = np.nan

# Imputar con mediana regional del mismo año
df['generosity'] = df.groupby(['year', 'region'])['generosity'].transform(
    lambda x: x.fillna(x.median())
)
# Si aún quedan NaN (por región sin datos), usar mediana global del año
df['generosity'] = df.groupby('year')['generosity'].transform(
    lambda x: x.fillna(x.median())
)

imputed = n_zeros - df['generosity'].isnull().sum()
print(f"   ✅ {imputed} valores imputados con mediana regional")


# ============================================================
# 🟡 FIX #5-6: Recalcular columnas derivadas (ahora que #1 está resuelto)
# ============================================================
print("\n🔧 FIX #5-6: Recalculando columnas derivadas...")

# happiness_category
bins = [0, 4, 5, 6, 7, 10]
labels = ['Muy bajo', 'Bajo', 'Medio', 'Alto', 'Muy alto']
df['happiness_category'] = pd.cut(
    df['happiness_score'], bins=bins, labels=labels, include_lowest=True
)
cat_nulls = df['happiness_category'].isnull().sum()
print(f"   ✅ happiness_category recalculada (nulos: {cat_nulls})")

# happiness_normalized
df['happiness_normalized'] = ((df['happiness_score'] / 10) * 100).round(1)
norm_nulls = df['happiness_normalized'].isnull().sum()
print(f"   ✅ happiness_normalized recalculada (nulos: {norm_nulls})")

# Recalcular generosity_pct también (porque cambiamos generosity)
df['generosity_pct'] = (df['generosity'] * 100).round(1)
print(f"   ✅ generosity_pct recalculada")


# ============================================================
# 🟡 FIX #7: Documentar el tema de corrupción (no modificar)
# ============================================================
print("\n🔧 FIX #7: Corrupción — valores repetidos...")
print("   ℹ️  Los valores idénticos de corrupción (~12-14 países por año)")
print("      provienen del dataset original de Kaggle.")
print("      Se CONSERVAN sin modificar para no distorsionar los datos.")
print("      En el dashboard, se mostrará nota: 'Datos originales del WHR'")


# ============================================================
# 🟢 FIX #8: Marcar países con datos escasos
# ============================================================
print("\n🔧 FIX #8: Calculando cobertura temporal por país...")

# Contar años de presencia por país
years_per_country = df.groupby('country')['year'].nunique()
df['years_with_data'] = df['country'].map(years_per_country)

sparse = df[df['years_with_data'] <= 2]['country'].unique()
print(f"   ℹ️  {len(sparse)} países con ≤2 años de datos: {list(sparse)}")
print(f"   ✅ Columna 'years_with_data' agregada (útil para filtrar en React)")


# ============================================================
# 🟢 FIX #9: Eliminar columnas _pct redundantes
# ============================================================
print("\n🔧 FIX #9: Eliminando columnas _pct redundantes...")

# Estas columnas son simplemente col * 100 y se pueden calcular
# al vuelo en React. Reducimos peso del CSV.
pct_cols = ['social_support_pct', 'freedom_pct', 'corruption_pct', 'generosity_pct']
df = df.drop(columns=pct_cols)
print(f"   ✅ Eliminadas: {pct_cols}")
print(f"   ℹ️  Se calcularán al vuelo en React: valor * 100")


# ============================================================
# 🔄 REORDENAR Y LIMPIAR
# ============================================================
print("\n🔧 Reordenando columnas y dataset final...")

# Orden lógico de columnas para el dashboard
final_column_order = [
    'year',
    'ranking',
    'country',
    'region',
    'happiness_score',
    'happiness_category',
    'happiness_normalized',
    'gdp_per_capita',
    'social_support',
    'life_expectancy',
    'freedom',
    'generosity',
    'corruption_perception',
    'is_latin_america',
    'years_with_data',
]

df = df[final_column_order]
df = df.sort_values(['year', 'ranking']).reset_index(drop=True)

# Redondear decimales finales
float_cols = df.select_dtypes(include='float64').columns
for col in float_cols:
    if col == 'life_expectancy':
        df[col] = df[col].round(1)
    elif col in ['happiness_score', 'happiness_normalized']:
        df[col] = df[col].round(4)
    else:
        df[col] = df[col].round(4)


# ============================================================
# 📊 REPORTE FINAL DE CALIDAD
# ============================================================
print("\n" + "=" * 60)
print("📊 REPORTE FINAL DE CALIDAD")
print("=" * 60)

print(f"\n  📐 Dimensiones: {df.shape[0]} filas × {df.shape[1]} columnas")
print(f"  📅 Años: {sorted(df['year'].unique())}")
print(f"  🌍 Países únicos: {df['country'].nunique()}")
print(f"  🗺️  Regiones: {df['region'].nunique()}")

print(f"\n  🔍 Nulos restantes por columna:")
nulls = df.isnull().sum()
total_nulls = nulls.sum()
for col, n in nulls.items():
    status = "✅" if n == 0 else "⚠️"
    print(f"     {status} {col}: {n}")

print(f"\n  Total nulos: {total_nulls}")

print(f"\n  📊 Columnas finales:")
for i, col in enumerate(df.columns, 1):
    print(f"     {i:2d}. {col} ({df[col].dtype})")

print(f"\n  📊 Estadísticas descriptivas:")
numeric = ['happiness_score', 'gdp_per_capita', 'social_support', 
           'life_expectancy', 'freedom', 'generosity', 'corruption_perception']
print(df[numeric].describe().round(4).to_string())


# ============================================================
# 💾 GUARDAR
# ============================================================
print("\n" + "=" * 60)
df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8')
print(f"💾 Guardado: {OUTPUT_FILE}")
print(f"   Filas: {len(df)} | Columnas: {len(df.columns)}")
print(f"   Formato: UTF-8, separador=coma, decimal=punto")
print(f"\n🔜 Copia '{OUTPUT_FILE}' a 'public/data/' de tu proyecto Vite")
print("=" * 60)



# ═══════════════════════════════════════════════════════
# 🌍 PREPARAR CSV FINAL PARA EL DASHBOARD
# ═══════════════════════════════════════════════════════
# 
# INSTRUCCIONES:
# 1. Pon este archivo .py en la MISMA carpeta donde tienes
#    el archivo "happiness_consolidated-1.csv"
# 2. Abre terminal/PowerShell en esa carpeta
# 3. Ejecuta: python preparar_csv_final.py
# 4. Se generará "happiness_final.csv"
# 5. Copia ese archivo a: tu_proyecto/public/data/
#
# REQUISITO: pip install pandas (si no lo tienes)
# ═══════════════════════════════════════════════════════

import pandas as pd

print("🌍 Cargando CSV...")
df = pd.read_csv("happiness_consolidated.csv")
print(f"   Filas cargadas: {len(df)}")
print(f"   Columnas: {list(df.columns)}")

# ── 1. Verificar que happiness_score esté completo ──
nulls_hs = df['happiness_score'].isna().sum()
print(f"\n📊 happiness_score nulls: {nulls_hs}")
if nulls_hs > 0:
    print("   ⚠️ Hay nulls, pero continuamos...")

# ── 2. Agregar columnas de porcentaje (para las barras del dashboard) ──
print("\n🔧 Agregando columnas de porcentaje...")

df['social_support_pct'] = (df['social_support'] * 100).round(1)
df['freedom_pct']        = (df['freedom'] * 100).round(1)
df['corruption_pct']     = (df['corruption_perception'] * 100).round(1)
df['generosity_pct']     = (df['generosity'] * 100).round(1)

print("   ✅ social_support_pct, freedom_pct, corruption_pct, generosity_pct")

# ── 3. Verificar México 2024 ──
mx24 = df[(df['country'] == 'Mexico') & (df['year'] == 2024)]
if len(mx24) > 0:
    print("\n🇲🇽 México 2024:")
    print(f"   happiness_score:    {mx24['happiness_score'].values[0]}")
    print(f"   ranking:            {mx24['ranking'].values[0]}")
    print(f"   happiness_category: {mx24['happiness_category'].values[0]}")
    print(f"   social_support_pct: {mx24['social_support_pct'].values[0]}%")
    print(f"   freedom_pct:        {mx24['freedom_pct'].values[0]}%")
    print(f"   corruption_pct:     {mx24['corruption_pct'].values[0]}%")
    print(f"   generosity_pct:     {mx24['generosity_pct'].values[0]}%")
else:
    print("\n⚠️ México 2024 no encontrado")

# ── 4. Verificar datos completos por año ──
print("\n📅 Resumen por año:")
print(f"   {'Año':>6} | {'Total':>6} | {'Con score':>10} | {'Con categoría':>14}")
print("   " + "-" * 45)
for yr in sorted(df['year'].unique()):
    total = len(df[df['year'] == yr])
    with_score = df[(df['year'] == yr) & (df['happiness_score'].notna())].shape[0]
    with_cat = df[(df['year'] == yr) & (df['happiness_category'].notna())].shape[0]
    print(f"   {yr:>6} | {total:>6} | {with_score:>10} | {with_cat:>14}")

# ── 5. Guardar archivo final ──
output_name = "happiness_final.csv"
df.to_csv(output_name, index=False)

print(f"\n{'=' * 55}")
print(f"✅ ARCHIVO GENERADO: {output_name}")
print(f"   Filas:    {len(df)}")
print(f"   Columnas: {len(df.columns)}")
print(f"{'=' * 55}")
print(f"\n📋 SIGUIENTE PASO:")
print(f"   Copia '{output_name}' a tu proyecto:")
print(f"   happy-world-dashboard/public/data/{output_name}")
print(f"\n   Luego en useHappinessData.js verifica que diga:")
print(f'   const CSV_PATH = "/data/{output_name}";')


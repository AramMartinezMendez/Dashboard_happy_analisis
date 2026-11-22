# Dashboard_happy_analisis



### Análisis de Audiencia
##### Usuarios Principales: Directores ejecutivos, tomadores de decisiones del sector público/ONGs, investigadores socioeconómicos y analistas de política global.

### Definición de objetivos 
¿Qué factores socioeconómicos han impulsado o deteriorado el bienestar social global en la década 2015-2024, y qué regiones requieren mayor focalización de recursos estratégicos?

• Objetivo General:
Proporcionar una herramienta visual estratégica que analice la tendencia multianual (2015-2024) y el impacto de los pilares socioeconómicos en el índice de felicidad mundial para guiar la toma de decisiones directivas y la planificación de políticas públicas.

• Objetivos Específicos:
  1. Identificar patrones y tendencias históricas en el nivel de bienestar global durante el periodo 2015-2024.
  2. Medir la fuerza de asociación entre el nivel de felicidad y las variables socioeconómicas (PIB, apoyo social, esperanza de vida, libertad, corrupción y generosidad).
  3. Realizar benchmarking regional para identificar disparidades estructurales entre los bloques geográficos.
  4. Sintetizar métricas complejas en indicadores visuales de alto nivel (KPIs) diseñados para la toma de decisiones ejecutivas.

### Tipo de información y decisiones
##### Toma de Decisiones:
- Evaluación del impacto a largo plazo de políticas públicas, asignación estratégica de recursos y presupuestos de desarrollo humano.
- Comparación macroeconómica entre regiones para orientar fondos de apoyo internacional o estrategias de desarrollo país.
Nivel de Detalle: Alto nivel macro. No requieren transacciones diarias ni operativas; demandan indicadores agregados por país/región, tendencias temporales multi-anuales y correlaciones socioeconómicas clave.

##### Identificación y Entendimiento
El dataset contiene 1,502 registros distribuidos a lo largo de 10 años (2015–2024). Las variables clave identificadas son:
- Identificadores: Country (175 países únicos), Regional indicator (10 regiones globales) y Year.
- Métrica Principal: Happiness score (Puntuación de felicidad, rango aproximado de 1.72 a 7.84).
- Pilares Socioeconómicos: GDP per capita, Social support, Healthy life expectancy, Freedom to make life choices, Generosity, Perceptions of corruption.

### Tipo de dashboard 
##### Estratégico: El conjunto de datos abarca una serie histórica de 10 años (2015 a 2024). Un panel estratégico resulta ideal para evaluar patrones de cambio multianuales, realizar benchmarking regional y analizar la contribución relativa de los distintos factores del bienestar a nivel directivo.

### Planificación de ETL 
##### Limpieza de Datos
Formato numérico: Las columnas con decimales utilizan coma (,) como separador en lugar de punto (.). Se debe aplicar una conversión de texto a coma flotante (float). Valores Faltantes: Se identificaron 3 registros con valor nulo en Regional indicator. 
El proceso de limpieza consistirá en imputar la región consultando el historial previo del país correspondiente o mediante un mapeo directo según su denominación.

##### Manejo de Valores Atípicos (Outliers)
Criterio de Evaluación: Aplicación del rango intercuartílico ($IQR$) en variables como GDP per capita, Social support o Perceptions of corruption. Decisión Estratégica: Conservar los valores extremos en el modelo del dashboard sin eliminarlos, ya que reflejan condiciones socioeconómicas reales (e.g., países con alta percepción de corrupción o crisis económicas profundas). En su lugar, se configurarán rangos dinámicos en los gráficos para evitar distorsiones visuales.

##### Integración de Datos
Carga del archivo CSV estructurado con separador ;.Creación de una tabla relacional o modelo dimensional con dimensiones de Tiempo (Year), Geografía (Country, Regional indicator) y Hechos (métricas numéricas de bienestar) para optimizar las consultas del dashboard estratégico.



#####
Cosas a considerar (Estructura):

Estandarizar datos hay valores numericas con punto y coma, otras con punto o solamente coma.
Valores de errores geograficas(dice que grecia es de africa xd) entre otras ubicaciones. 



##### Consideraciones de identificadores claves:
Ranking  — posición ordinal

Country  — dimensión principal

Regional indicator — dimensión geopolítica clave para segmentació


### (Dashboard en linea)[http://dashboardhappyanalisis.vercel.app/]

### (Encuesta de dashboard)[https://docs.google.com/forms/d/e/1FAIpQLScmPMNpklfIPmyn8e2iTEiiz088q-juOfqyBIIGgXyth-ZCiQ/viewform?usp=header]







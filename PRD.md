PRD: Fityo – Premium Macro & Weight Tracker

1. Visión General

Fityo es una aplicación móvil (Web App optimizada) de rastreo de calorías y macros con una estética ultra-luxury, minimalista y funcional.

El objetivo principal es eliminar la fricción del registro diario mediante una interfaz limpia, basada en un sistema de base de datos personal de alimentos y un calendario persistente.

2. Stack Tecnológico

Framework: Next.js (App Router).

Styling: Tailwind CSS + Framer Motion (para animaciones premium).

Backend/Database: Supabase (Auth, PostgreSQL, Realtime).

Hosting: Vercel.

Iconografía: Lucide React (estilo fino/minimalista).

3. Arquitectura de Datos (Supabase)

Necesitamos cuatro tablas principales para soportar la lógica del negocio:

profiles: Almacena objetivos (calorías, macros goal) y datos del usuario.

foods_library: Diccionario personal de alimentos del usuario (nombre, proteína/100g, carbohidratos/100g, grasa/100g).

daily_logs: Registros de consumos ligados a una fecha, una "comida" (breakfast, lunch, etc.) y una cantidad en gramos.

weight_history: Registro diario de peso.

4. Requisitos Funcionales

A. Core: Tracking de Macros

Cálculo Dinámico:
El usuario ingresa gramos consumidos ($g_{cons}$). La app calcula los macros basados en la base de datos de referencia ($m_{ref}$ por cada 100g) usando la fórmula:

$$Macro_{total} = \frac{g_{cons} \cdot m_{ref}}{100}$$

Gestión de Comidas: Capacidad de crear categorías personalizadas (Desayuno, Comida, Snack, etc.).

Progress Bars Premium: Visualización de macros (Proteína, Carbos, Grasas) y Calorías totales mediante barras de progreso minimalistas con gradientes sutiles.

B. Calendario y Persistencia

Modo Lectura/Escritura: El usuario puede navegar por el historial.

Días pasados: Solo lectura para preservar la integridad de los datos.

Día actual: Permite edición total.

Dashboard de Gráficos: Visualización de tendencias de consumo semanal y evolución del peso mediante gráficos de líneas suaves.

C. UI/UX (Luxury Minimalist)

Paleta de colores: Monocromática (negros profundos, blancos rotos, grises seda) con un solo color de acento (ej. dorado suave o verde esmeralda muy sutil).

Interacciones: Uso de Glassmorphism (fondos desenfocados) y transiciones fluidas.

5. User Stories para el Agente de Código

Prompt Sugerido:

"Actúa como un desarrollador Fullstack Senior. Crea una aplicación en Next.js 14 siguiendo el PRD de Fityo. Implementa:

Auth de Supabase para el login.

Pantalla Principal: Un selector de fecha superior (calendario horizontal), seguido por las 'Cards' de cada comida que sumen los macros en tiempo real.

Lógica de Cálculo: Si registro 75g de un alimento que tiene 20g de proteína por cada 100g, la app debe mostrar 15g de proteína.

Sección de Gráficos: Usa recharts o shadcn/ui charts para mostrar la evolución del peso y el cumplimiento de macros.

Estética: Usa Tailwind. Todo debe ser minimalista, bordes redondeados (2xl), mucho espacio en blanco (whitespace) y tipografía sans-serif elegante."

6. Estructura de la Base de Datos (SQL sugerido)

-- Tabla de alimentos personalizados
CREATE TABLE foods_library (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  name TEXT NOT NULL,
  protein_per_100g FLOAT DEFAULT 0,
  carbs_per_100g FLOAT DEFAULT 0,
  fat_per_100g FLOAT DEFAULT 0,
  calories_per_100g FLOAT DEFAULT 0
);

-- Tabla de registros diarios
CREATE TABLE daily_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  food_id uuid REFERENCES foods_library,
  meal_type TEXT, -- 'breakfast', 'lunch', etc.
  amount_grams FLOAT,
  logged_at DATE DEFAULT CURRENT_DATE
);

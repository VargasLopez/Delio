# Delio (Deal) 🇲🇽

Delio es un directorio y bolsa de trabajo P2P (peer-to-peer) independiente y gratuito, desarrollado específicamente para el mercado mexicano.

La plataforma opera bajo un modelo **de directorio descentralizado y abierto**:
- **0% Comisiones**: Delio no intermedia en pasarelas de pago ni retiene dinero.
- **Trato Directo**: Los usuarios acuerdan los pagos de manera independiente y offline (Efectivo físico, transferencia SPEI, depósitos en Spin by OXXO o saldo Mercado Pago).
- **Verificación Local**: Incluye flujo visual de carga de identificación oficial (INE) para generar confianza comunitaria.

---

## 🛠️ Stack Tecnológico

1. **Frontend**: HTML5 + Vanilla ES6 Modules (SPA - Single Page Application).
2. **Estilos**: Tailwind CSS con diseño Glassmorphism y micro-animaciones nativas.
3. **Compilador/Servidor**: Vite (Súper veloz, recarga en caliente).
4. **Base de Datos y Tiempo Real**: Supabase (PostgreSQL) con fallback inteligente a **LocalStorage Mock Database** si no hay credenciales configuradas.
5. **Capacidades PWA**: Service Worker para almacenamiento en caché offline y manifiesto de instalación web para Android/iOS.

---

## 🚀 Inicio Rápido (Modo Demo Local)

El proyecto incluye un motor de simulación de datos. **No necesitas configurar ninguna cuenta ni servidor para probarlo de inmediato.**

1. Instala las dependencias de desarrollo:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
3. Abre en tu navegador la dirección indicada (por defecto [http://localhost:3000](http://localhost:3000)).
4. **Para ingresar a la Demo**: Escribe cualquier correo y contraseña en la pantalla de inicio. Se autogenerará un perfil mexicano para ti.

---

## ⚡ Conectando a Supabase Real (Producción)

Cuando estés listo para conectar tu backend en la nube, sigue estos pasos sencillos:

### 1. Crear Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto y añade tus llaves API de Supabase:
```env
VITE_SUPABASE_URL=TU_URL_DE_SUPABASE
VITE_SUPABASE_ANON_KEY=TU_LLAVE_ANONIMA_DE_SUPABASE
```
*Delio detectará estas variables automáticamente en el siguiente inicio y apagará el modo simulación para conectarse a tu base de datos en vivo.*

### 2. Esquema de Base de Datos SQL (Supabase Query Editor)
Ejecuta la siguiente estructura de tablas en el editor SQL de tu panel de Supabase:

```sql
-- 1. Tabla de Perfiles de Usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_payment_methods TEXT[] DEFAULT '{cash,spei}',
  is_ine_verified BOOLEAN DEFAULT false,
  ine_attachment_url TEXT,
  state TEXT NOT NULL,
  municipality TEXT NOT NULL,
  colonia TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Mandados / Errandos
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poster_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  poster_name TEXT NOT NULL,
  poster_payment_methods TEXT[] DEFAULT '{cash,spei}',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget NUMERIC NOT NULL,
  state TEXT NOT NULL,
  municipality TEXT NOT NULL,
  colonia TEXT NOT NULL,
  status TEXT DEFAULT 'open' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Chats de Negociación
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT NOT NULL,
  user_a UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_a_name TEXT NOT NULL,
  user_b UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_b_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Mensajes
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar réplicas en tiempo real para mensajería instantánea
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
```

---

## 📱 Instalación PWA
- **En Android (Chrome)**: Haz clic en el botón "Instalar Delio" desde tu pestaña de Perfil o presiona los tres puntos del navegador y elige "Agregar a la pantalla principal".
- **En iOS (Safari)**: Presiona el botón de "Compartir" y selecciona "Agregar a pantalla de inicio".

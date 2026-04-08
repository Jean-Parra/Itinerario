# 🇵🇦✈️🇧🇷 Trip Planner — Panamá + Río 2026

Itinerario interactivo y editable en tiempo real.  
Todos los que acceden ven los mismos datos actualizados al instante.

## 🚀 Deploy en Render (gratis)

### Paso 1: Sube a GitHub
1. Crea un repositorio nuevo en github.com
2. Sube estos archivos:
   ```
   git init
   git add .
   git commit -m "Trip planner"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/trip-planner.git
   git push -u origin main
   ```

### Paso 2: Deploy en Render
1. Ve a [render.com](https://render.com) y crea una cuenta gratis
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repo de GitHub
4. Configura:
   - **Name:** `trip-planner` (o el que quieras)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Click **"Create Web Service"**
6. Espera 1-2 minutos y tu app estará en vivo en `https://trip-planner-XXXX.onrender.com`

### Paso 3: Agrega la URL de Render
Una vez deployado, ve a **Environment** en el dashboard de Render y agrega:
- **Key:** `RENDER_EXTERNAL_URL`  
- **Value:** `https://TU-APP.onrender.com`

Esto activa el self-ping que mantiene el servidor despierto.

## ✨ Funcionalidades

- ✏️ **Editar** cualquier actividad (hora, nombre, descripción, precio, ícono)
- ➕ **Agregar** actividades nuevas entre las existentes
- 🗑 **Eliminar** actividades o días completos
- ↕️ **Reordenar** actividades arriba/abajo
- 📅 **Agregar días** nuevos al itinerario
- 📡 **Sincronización en tiempo real** — todos ven lo mismo
- 🔄 **Self-ping** cada 10 min para que no se duerma en Render Free

## 🏗 Estructura

```
trip-planner/
├── server.js          ← Express + SSE + self-ping
├── package.json
├── README.md
└── public/
    └── index.html     ← App completa
```

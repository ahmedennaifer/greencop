<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <h1 class="page-title">Tableau de Bord</h1>
        <p class="page-subtitle">Vue d'ensemble de vos infrastructures serveurs</p>
      </div>
      <button class="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
        Actualiser
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon temperature">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Température Moyenne</p>
          <p class="stat-value">{{ avgTemperature }}°C</p>
          <p class="stat-change positive">↓ 2.1°C depuis hier</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon humidity">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Humidité Moyenne</p>
          <p class="stat-value">{{ avgHumidity }}%</p>
          <p class="stat-change neutral">Stable</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon power">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Consommation Actuelle</p>
          <p class="stat-value">{{ currentPower }} kW</p>
          <p class="stat-change negative">↑ 8% depuis hier</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon servers">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
            <line x1="6" y1="6" x2="6.01" y2="6"/>
            <line x1="6" y1="18" x2="6.01" y2="18"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Serveurs Actifs</p>
          <p class="stat-value">{{ activeServers }}/{{ totalServers }}</p>
          <p class="stat-change positive">100% opérationnels</p>
        </div>
      </div>
    </div>

    <!-- Server Rooms Grid -->
    <div class="section-header">
      <h2 class="section-title">Salles de Serveurs</h2>
      <select class="filter-select">
        <option>Toutes les salles</option>
        <option>Salle A</option>
        <option>Salle B</option>
        <option>Salle C</option>
      </select>
    </div>

    <div class="rooms-grid">
      <div v-for="room in serverRooms" :key="room.id" class="room-card card-hover">
        <div class="room-header">
          <h3 class="room-name">{{ room.name }}</h3>
          <span class="room-status" :class="room.status">{{ room.statusText }}</span>
        </div>
        
        <div class="room-metrics">
          <div class="metric">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
            </svg>
            <span>{{ room.temperature }}°C</span>
          </div>
          <div class="metric">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
            <span>{{ room.humidity }}%</span>
          </div>
          <div class="metric">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <span>{{ room.power }} kW</span>
          </div>
        </div>

        <div class="room-chart">
          <div class="mini-chart">
            <div v-for="(bar, i) in 12" :key="i" class="chart-bar" :style="{ height: Math.random() * 100 + '%' }"></div>
          </div>
        </div>

        <div class="room-footer">
          <span class="server-count">{{ room.servers }} serveurs</span>
          <button class="btn-link">Voir détails →</button>
        </div>
      </div>
    </div>

    <!-- Alerts Section -->
    <div class="section-header">
      <h2 class="section-title">Alertes Récentes</h2>
      <router-link to="/alerts" class="btn-link">Voir tout</router-link>
    </div>

    <div class="alerts-list">
      <div v-for="alert in recentAlerts" :key="alert.id" class="alert-item" :class="alert.severity">
        <div class="alert-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="alert-content">
          <p class="alert-title">{{ alert.title }}</p>
          <p class="alert-description">{{ alert.description }}</p>
        </div>
        <div class="alert-time">{{ alert.time }}</div>
      </div>
    </div>

    <!-- Real-Time Chart -->
    <div class="section-header">
      <h2 class="section-title">Consommation en Temps Réel</h2>
      <div class="chart-legend">
        <span class="legend-item"><span class="dot temperature"></span>Température</span>
        <span class="legend-item"><span class="dot power"></span>Puissance</span>
      </div>
    </div>

    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const avgTemperature = ref(22.4);
const avgHumidity = ref(45);
const currentPower = ref(124.5);
const activeServers = ref(48);
const totalServers = ref(48);

const serverRooms = ref([
  { id: 1, name: 'Salle A - Production', temperature: 21.5, humidity: 43, power: 45.2, servers: 16, status: 'normal', statusText: 'Normal' },
  { id: 2, name: 'Salle B - Développement', temperature: 23.1, humidity: 47, power: 38.7, servers: 12, status: 'warning', statusText: 'Attention' },
  { id: 3, name: 'Salle C - Backup', temperature: 22.0, humidity: 44, power: 40.6, servers: 20, status: 'normal', statusText: 'Normal' },
]);

const recentAlerts = ref([
  { id: 1, severity: 'warning', title: 'Température élevée', description: 'Salle B - La température a dépassé 23°C', time: 'Il y a 5 min' },
  { id: 2, severity: 'info', title: 'Mise à jour capteur', description: 'Capteur H-102 mis à jour avec succès', time: 'Il y a 15 min' },
  { id: 3, severity: 'success', title: 'Optimisation appliquée', description: 'Économie de 12% sur la consommation', time: 'Il y a 1h' },
]);

const chartCanvas = ref(null);

onMounted(() => {
  // Simuler un graphique simple avec Canvas
  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d');
    const width = chartCanvas.value.width = chartCanvas.value.offsetWidth;
    const height = chartCanvas.value.height = 200;
    
    // Fond
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, width, height);
    
    // Grille
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Courbe de température
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < width; i += 10) {
      const y = height / 2 + Math.sin(i / 30) * 40 + Math.random() * 20 - 10;
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();
    
    // Courbe de puissance
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < width; i += 10) {
      const y = height / 2 + Math.cos(i / 40) * 50 + Math.random() * 15 - 7;
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();
  }
});
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: var(--gray-600);
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-blue) 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  display: flex;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.temperature {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stat-icon.humidity {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-icon.power {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-icon.servers {
  background: linear-gradient(135deg, var(--primary-green) 0%, #059669 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-change.positive {
  color: var(--success);
}

.stat-change.negative {
  color: var(--danger);
}

.stat-change.neutral {
  color: var(--gray-600);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: white;
  color: var(--gray-800);
  cursor: pointer;
  font-size: 0.875rem;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.room-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.room-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
}

.room-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.room-status.normal {
  background: #d1fae5;
  color: #065f46;
}

.room-status.warning {
  background: #fef3c7;
  color: #92400e;
}

.room-metrics {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-600);
  font-size: 0.875rem;
}

.room-chart {
  margin: 1rem 0;
}

.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 60px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, var(--primary-green) 0%, var(--primary-blue) 100%);
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
}

.room-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
}

.server-count {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.btn-link {
  color: var(--primary-blue);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-link:hover {
  color: var(--dark-blue);
}

.alerts-list {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
  margin-bottom: 2.5rem;
  overflow: hidden;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-left: 4px solid transparent;
  transition: all 0.2s ease;
}

.alert-item:not(:last-child) {
  border-bottom: 1px solid var(--gray-200);
}

.alert-item:hover {
  background: var(--gray-50);
}

.alert-item.warning {
  border-left-color: var(--warning);
}

.alert-item.info {
  border-left-color: var(--primary-blue);
}

.alert-item.success {
  border-left-color: var(--success);
}

.alert-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-item.warning .alert-icon {
  background: #fef3c7;
  color: var(--warning);
}

.alert-item.info .alert-icon {
  background: var(--light-blue);
  color: var(--primary-blue);
}

.alert-item.success .alert-icon {
  background: #d1fae5;
  color: var(--success);
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
}

.alert-description {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.alert-time {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
}

.chart-legend {
  display: flex;
  gap: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.temperature {
  background: #ef4444;
}

.dot.power {
  background: #3b82f6;
}

canvas {
  width: 100%;
  height: 200px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .rooms-grid {
    grid-template-columns: 1fr;
  }
}
</style>
<template>
  <div class="analysis-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Analyse de la Température</h1>
        <p class="page-subtitle">Surveillance en temps réel et historique des températures</p>
      </div>
      <div class="header-actions">
        <select class="filter-select">
          <option>Dernières 24h</option>
          <option>7 derniers jours</option>
          <option>30 derniers jours</option>
        </select>
        <button class="btn-export">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exporter
        </button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon temperature">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
          </svg>
        </div>
        <div>
          <p class="kpi-label">Température Actuelle</p>
          <p class="kpi-value">{{ currentTemp }}°C</p>
          <p class="kpi-trend positive">↓ 1.2°C</p>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon max-temp">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
        </div>
        <div>
          <p class="kpi-label">Maximum (24h)</p>
          <p class="kpi-value">{{ maxTemp }}°C</p>
          <p class="kpi-trend neutral">Salle B à 14h32</p>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon min-temp">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
            <polyline points="17 18 23 18 23 12"/>
          </svg>
        </div>
        <div>
          <p class="kpi-label">Minimum (24h)</p>
          <p class="kpi-value">{{ minTemp }}°C</p>
          <p class="kpi-trend neutral">Salle A à 03h15</p>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon alert-temp">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <p class="kpi-label">Alertes (24h)</p>
          <p class="kpi-value">{{ alertCount }}</p>
          <p class="kpi-trend negative">3 actives</p>
        </div>
      </div>
    </div>

    <!-- Main Chart -->
    <div class="chart-section">
      <div class="chart-header">
        <h2 class="section-title">Évolution de la Température</h2>
        <div class="chart-controls">
          <button 
            v-for="room in rooms" 
            :key="room.id"
            :class="['chart-toggle', { active: activeRooms.includes(room.id) }]"
            @click="toggleRoom(room.id)"
          >
            <span :class="['toggle-dot', room.color]"></span>
            {{ room.name }}
          </button>
        </div>
      </div>
      <div class="chart-container">
        <canvas ref="tempChart"></canvas>
      </div>
    </div>

    <!-- Room Details -->
    <div class="section-header">
      <h2 class="section-title">Détails par Salle</h2>
    </div>

    <div class="details-grid">
      <div v-for="room in roomDetails" :key="room.id" class="detail-card">
        <div class="detail-header">
          <h3>{{ room.name }}</h3>
          <span :class="['status-badge', room.status]">{{ room.statusText }}</span>
        </div>

        <div class="temp-display">
          <div class="temp-gauge">
            <div class="gauge-fill" :style="{ height: room.tempPercent + '%' }"></div>
          </div>
          <div class="temp-info">
            <p class="current-temp">{{ room.temperature }}°C</p>
            <p class="temp-range">Plage: {{ room.minTemp }}°C - {{ room.maxTemp }}°C</p>
          </div>
        </div>

        <div class="sensor-list">
          <div v-for="sensor in room.sensors" :key="sensor.id" class="sensor-item">
            <div class="sensor-info">
              <span class="sensor-name">{{ sensor.name }}</span>
              <span :class="['sensor-status', sensor.status]">
                <span class="status-dot"></span>
                {{ sensor.statusText }}
              </span>
            </div>
            <span class="sensor-temp">{{ sensor.temp }}°C</span>
          </div>
        </div>

        <div class="detail-footer">
          <button class="btn-secondary">Configurer</button>
          <button class="btn-link">Voir historique →</button>
        </div>
      </div>
    </div>

    <!-- Insights & Recommendations -->
    <div class="insights-section">
      <h2 class="section-title">Insights IA</h2>
      <div class="insights-grid">
        <div class="insight-card">
          <div class="insight-icon success">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="insight-content">
            <h4>Refroidissement Optimal</h4>
            <p>La Salle A maintient une température idéale. Économie estimée de 15% sur la climatisation.</p>
          </div>
        </div>

        <div class="insight-card">
          <div class="insight-icon warning">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="insight-content">
            <h4>Point Chaud Détecté</h4>
            <p>Salle B - Rack 12 : température 3°C au-dessus de la moyenne. Vérifiez la circulation d'air.</p>
          </div>
        </div>

        <div class="insight-card">
          <div class="insight-icon info">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div class="insight-content">
            <h4>Prévision</h4>
            <p>Augmentation de 2°C prévue dans les 4 prochaines heures. Ajustement automatique activé.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const currentTemp = ref(22.4);
const maxTemp = ref(24.8);
const minTemp = ref(19.2);
const alertCount = ref(5);

const rooms = ref([
  { id: 1, name: 'Salle A', color: 'green' },
  { id: 2, name: 'Salle B', color: 'blue' },
  { id: 3, name: 'Salle C', color: 'purple' },
]);

const activeRooms = ref([1, 2, 3]);

const roomDetails = ref([
  {
    id: 1,
    name: 'Salle A - Production',
    temperature: 21.5,
    minTemp: 19.2,
    maxTemp: 22.8,
    tempPercent: 65,
    status: 'normal',
    statusText: 'Normal',
    sensors: [
      { id: 1, name: 'Capteur T-101', temp: 21.2, status: 'online', statusText: 'En ligne' },
      { id: 2, name: 'Capteur T-102', temp: 21.8, status: 'online', statusText: 'En ligne' },
      { id: 3, name: 'Capteur T-103', temp: 21.5, status: 'online', statusText: 'En ligne' },
    ]
  },
  {
    id: 2,
    name: 'Salle B - Développement',
    temperature: 23.1,
    minTemp: 21.5,
    maxTemp: 24.8,
    tempPercent: 78,
    status: 'warning',
    statusText: 'Attention',
    sensors: [
      { id: 4, name: 'Capteur T-201', temp: 22.9, status: 'online', statusText: 'En ligne' },
      { id: 5, name: 'Capteur T-202', temp: 24.5, status: 'warning', statusText: 'Attention' },
      { id: 6, name: 'Capteur T-203', temp: 22.0, status: 'online', statusText: 'En ligne' },
    ]
  },
  {
    id: 3,
    name: 'Salle C - Backup',
    temperature: 22.0,
    minTemp: 20.1,
    maxTemp: 23.2,
    tempPercent: 70,
    status: 'normal',
    statusText: 'Normal',
    sensors: [
      { id: 7, name: 'Capteur T-301', temp: 22.1, status: 'online', statusText: 'En ligne' },
      { id: 8, name: 'Capteur T-302', temp: 21.9, status: 'online', statusText: 'En ligne' },
    ]
  },
]);

const tempChart = ref(null);

const toggleRoom = (roomId) => {
  const index = activeRooms.value.indexOf(roomId);
  if (index > -1) {
    activeRooms.value.splice(index, 1);
  } else {
    activeRooms.value.push(roomId);
  }
};

onMounted(() => {
  if (tempChart.value) {
    const ctx = tempChart.value.getContext('2d');
    const width = tempChart.value.width = tempChart.value.offsetWidth;
    const height = tempChart.value.height = 300;
    
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, width, height);
    
    // Grille
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const y = (height / 6) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Courbes de température par salle
    const colors = ['#10b981', '#3b82f6', '#8b5cf6'];
    for (let c = 0; c < 3; c++) {
      ctx.strokeStyle = colors[c];
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < width; i += 8) {
        const y = height / 2 + Math.sin((i / 40) + c * 2) * 60 + Math.random() * 10 - 5;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
    }
  }
});
</script>

<style scoped>
.analysis-page {
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.625rem 1rem;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: white;
  color: var(--gray-800);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.filter-select:hover {
  border-color: var(--primary-blue);
}

.btn-export {
  background: white;
  border: 1px solid var(--gray-200);
  padding: 0.625rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  color: var(--gray-800);
}

.btn-export:hover {
  background: var(--gray-50);
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.kpi-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.kpi-icon.temperature {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.kpi-icon.max-temp {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.kpi-icon.min-temp {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.kpi-icon.alert-temp {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.kpi-label {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 0.25rem;
}

.kpi-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--gray-900);
}

.kpi-trend {
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.kpi-trend.positive {
  color: var(--success);
}

.kpi-trend.negative {
  color: var(--danger);
}

.kpi-trend.neutral {
  color: var(--gray-600);
}

.chart-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chart-toggle {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-200);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  color: var(--gray-600);
}

.chart-toggle:hover {
  background: var(--gray-50);
}

.chart-toggle.active {
  background: var(--light-blue);
  border-color: var(--primary-blue);
  color: var(--primary-blue);
  font-weight: 500;
}

.toggle-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.toggle-dot.green {
  background: #10b981;
}

.toggle-dot.blue {
  background: #3b82f6;
}

.toggle-dot.purple {
  background: #8b5cf6;
}

.chart-container {
  margin-top: 1rem;
}

canvas {
  width: 100%;
  height: 300px;
}

.section-header {
  margin: 2rem 0 1.5rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.detail-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.normal {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.temp-display {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
}

.temp-gauge {
  width: 60px;
  height: 120px;
  background: var(--gray-100);
  border-radius: 30px;
  position: relative;
  overflow: hidden;
}

.gauge-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #ef4444 0%, #f59e0b 100%);
  border-radius: 30px;
  transition: height 0.5s ease;
}

.temp-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.current-temp {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
}

.temp-range {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.sensor-list {
  margin-bottom: 1rem;
}

.sensor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--gray-50);
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.sensor-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sensor-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-800);
}

.sensor-status {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.sensor-status.online {
  color: var(--success);
}

.sensor-status.warning {
  color: var(--warning);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.sensor-temp {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-900);
}

.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  color: var(--gray-800);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: white;
  border-color: var(--primary-blue);
  color: var(--primary-blue);
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

.insights-section {
  margin-top: 2rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.insight-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  display: flex;
  gap: 1rem;
  transition: all 0.3s ease;
}

.insight-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.insight-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.insight-icon.success {
  background: #d1fae5;
  color: var(--success);
}

.insight-icon.warning {
  background: #fef3c7;
  color: var(--warning);
}

.insight-icon.info {
  background: var(--light-blue);
  color: var(--primary-blue);
}

.insight-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.insight-content p {
  font-size: 0.875rem;
  color: var(--gray-600);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .insights-grid {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
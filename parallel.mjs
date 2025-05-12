import start from './ads_clicker.js';
import { startMonitoring } from './stats_monitor.js';

const NUM_INSTANCES = 10; // Aumentado para 10 instâncias
const VISITS_PER_INSTANCE = 100; // Reduzido para aumentar o tempo por visita

const SITES = [
  'https://brasilquiz.com/sorteio/participe-e-conquiste-um-playstation-5-ou-um-pc-gamer-com-o-cifra-do-bem?utm_source=351&utm_term=351&cf_ads=351'
]

console.log(`🚀 Iniciando ${NUM_INSTANCES} instâncias em paralelo`);

// Array para armazenar as promises das instâncias
const instances = [];

// Inicia as instâncias em paralelo
for (let instanceId = 0; instanceId < NUM_INSTANCES; instanceId++) {
  const instance = start(VISITS_PER_INSTANCE, instanceId, [...SITES])
    .catch(error => console.error(`❌ Erro na instância ${instanceId}:`, error));
  instances.push(instance);
}

// Extrai os IDs cf_ads dos URLs
const cfAdsIds = SITES.map(url => {
  const match = url.match(/cf_ads=(\d+)/);
  return match ? match[1] : null;
}).filter(Boolean);

// Inicia o monitoramento de estatísticas
startMonitoring(cfAdsIds);

// Aguarda todas as instâncias terminarem
Promise.all(instances)
  .then(() => console.log('✅ Todas as instâncias finalizadas'))
  .catch(error => console.error('❌ Erro geral:', error));
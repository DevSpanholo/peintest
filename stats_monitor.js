import chalk from 'chalk';

const STATS_HISTORY = [];

async function fetchStats(cfAdsId) {
  const date = new Date().toISOString().split('T')[0];
  const url = `https://api.cifraads.com/daily-treatments/statistics?start_date=${date}&end_date=${date}&cf_ads=${cfAdsId}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(chalk.red(`❌ Erro ao buscar estatísticas: ${error.message}`));
    return null;
  }
}

function formatStats(stats) {
  return {
    timestamp: new Date(),
    revenue: stats.totalRevenue,
    visits: stats.totalVisits,
    rpm: stats.averageRpm,
    activeArticles: stats.totalActivesArticles
  };
}

function logStats(stats, previousStats) {
  console.log(chalk.cyan('\n📊 Estatísticas da última hora:'));
  console.log(chalk.white(`   • Receita total: $${stats.revenue.toFixed(2)}`));
  console.log(chalk.white(`   • Total de visitas: ${stats.visits}`));
  console.log(chalk.white(`   • RPM médio: $${stats.rpm.toFixed(2)}`));
  console.log(chalk.white(`   • Artigos ativos: ${stats.activeArticles}`));

  if (previousStats) {
    const visitDiff = stats.visits - previousStats.visits;
    const revenueDiff = stats.revenue - previousStats.revenue;
    
    console.log(chalk.yellow('\n📈 Variação na última hora:'));
    console.log(chalk.white(`   • Novas visitas: ${visitDiff}`));
    console.log(chalk.white(`   • Nova receita: $${revenueDiff.toFixed(2)}`));
  }
}

export async function startMonitoring(cfAdsIds) {
  console.log(chalk.green('🔄 Iniciando monitoramento de estatísticas...'));

  // Monitora cada ID separadamente
  setInterval(async () => {
    for (const cfAdsId of cfAdsIds) {
      const stats = await fetchStats(cfAdsId);
      if (!stats) continue;

      const formattedStats = formatStats(stats);
      const previousStats = STATS_HISTORY.length > 0 ? 
        STATS_HISTORY[STATS_HISTORY.length - 1][cfAdsId] : null;

      STATS_HISTORY.push({ [cfAdsId]: formattedStats });
      
      console.log(chalk.blue(`\n🎯 Estatísticas para cf_ads=${cfAdsId}:`));
      logStats(formattedStats, previousStats);
    }
  }, 3600000); // Verifica a cada 1 hora
}
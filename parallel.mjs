import { start } from './test.mjs';
import chalk from 'chalk';

const TOTAL_INSTANCES = 5; // Number of parallel instances to run
``
async function runParallel() {
  console.log(chalk.cyan.bold(`🚀 Iniciando ${TOTAL_INSTANCES} instâncias em paralelo`));
  
  const instances = Array.from({ length: TOTAL_INSTANCES }, (_, i) => {
    return start().catch(err => {
      console.error(chalk.red(`❌ Erro na instância ${i + 1}:`), err);
    });
  });
  
  await Promise.all(instances);
  console.log(chalk.green.bold('✅ Todas as instâncias finalizadas!'));
}

runParallel().catch(err => {
  console.error(chalk.red.bold('❌ Erro fatal:'), err);
  process.exit(1);
});
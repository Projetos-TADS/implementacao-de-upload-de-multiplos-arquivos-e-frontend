const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Iniciando build da aplicação...');

// Caminhos
const clientPath = path.join(__dirname, 'client');
const publicPath = path.join(__dirname, 'public');
const buildPath = path.join(clientPath, 'build');

try {
  // Verificar se existe a pasta client
  if (!fs.existsSync(clientPath)) {
    throw new Error('Pasta client não encontrada. Execute "npx create-react-app client" primeiro.');
  }

  // Fazer build do React
  console.log('📦 Fazendo build do React...');
  process.chdir(clientPath);
  execSync('npm run build', { stdio: 'inherit' });

  // Voltar para pasta raiz
  process.chdir('..');

  // Remover pasta public antiga se existir
  if (fs.existsSync(publicPath)) {
    fs.rmSync(publicPath, { recursive: true, force: true });
    console.log('🗑️  Pasta public antiga removida');
  }

  // Copiar build para pasta public
  if (fs.existsSync(buildPath)) {
    fs.cpSync(buildPath, publicPath, { recursive: true });
    console.log('✅ Build copiado para pasta public');
  } else {
    throw new Error('Pasta build não encontrada');
  }

  console.log('🎉 Build concluído com sucesso!');
  console.log('🚀 Execute "npm run dev" para iniciar o servidor');

} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // Carrega as variáveis de ambiente

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/client'),
      },
    },
    root: path.resolve(__dirname, 'src/client'),
    build: {
      outDir: path.resolve(__dirname, 'dist'),
    },
    server: {
      port: parseInt(env.VITE_PORT), // Porta do Vite
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3200',
          changeOrigin: true,
        },
        '/uploads': {
          target: env.VITE_API_URL, // URL da API
          changeOrigin: true,
        },
      },
      allowedHosts: [ // Adicione esta seção
        'tstadm.tagarella.com.br', // Seu domínio
        'localhost',                // Para desenvolvimento local
        '.tagarella.com.br'      // Para subdomínios (opcional, mas recomendado)
      ],
    },
  };
});

const bcrypt = require('bcrypt');
const pool = require('./src/server/config/database');

async function createAdmin() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Iniciando criação do admin...');
        
        const senha = 'Tagarella!01';
        const hash = await bcrypt.hash(senha, 10);
        console.log('Hash gerado:', hash);

        const userResult = await client.query(
            'INSERT INTO usuario (nome, email, senha, ativo) VALUES ($1, $2, $3, $4) RETURNING usuario_id',
            ['Administrador', 'admin@tagarella.com.br', hash, true]
        );
        console.log('Usuário criado:', userResult.rows[0]);

        await client.query(
            'INSERT INTO usuario_perfil (usuario_id, perfil_id) VALUES ($1, $2)',
            [userResult.rows[0].usuario_id, 1]
        );
        console.log('Perfil associado');

        await client.query('COMMIT');
        console.log('Admin criado com sucesso');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro detalhado:', error);
    } finally {
        client.release();
        process.exit();
    }
}

createAdmin();
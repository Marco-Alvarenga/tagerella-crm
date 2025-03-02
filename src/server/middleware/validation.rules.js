// src/server/middleware/validation.rules.js
const validationRules = {
    // Regras de validação para diferentes entidades
    client: {
        validate: (data) => {
            const errors = [];
            const { nome, email } = data;

            if (!nome) errors.push('Nome é obrigatório');
            
            if (!email) {
                errors.push('Email é obrigatório');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.push('Email inválido');
            }

            return errors;
        }
    },

    password: {
        validate: (data) => {
            const errors = [];
            const { nova_senha } = data;

            if (!nova_senha || nova_senha.length < 8) {
                errors.push('Senha deve ter no mínimo 8 caracteres');
            }
            if (!/[A-Z]/.test(nova_senha)) {
                errors.push('Senha deve conter pelo menos uma letra maiúscula');
            }
            if (!/[a-z]/.test(nova_senha)) {
                errors.push('Senha deve conter pelo menos uma letra minúscula');
            }
            if (!/[0-9]/.test(nova_senha)) {
                errors.push('Senha deve conter pelo menos um número');
            }
            if (!/[!@#$%^&*]/.test(nova_senha)) {
                errors.push('Senha deve conter pelo menos um caractere especial (!@#$%^&*)');
            }

            return errors;
        }
    }
};

module.exports = validationRules;
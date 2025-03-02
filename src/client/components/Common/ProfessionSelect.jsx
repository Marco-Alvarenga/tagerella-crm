// src/client/components/Common/ProfessionSelect.jsx
import React, { useState, useEffect } from 'react';
import {
    TextField,
    MenuItem,
    CircularProgress,
    InputAdornment
} from '@mui/material';
import { terapeutaService } from '../../services/api';

const ProfessionSelect = ({ value, onChange, required = false, error = false, helperText = '' }) => {
    const [profissoes, setProfissoes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfissoes = async () => {
            try {
                setLoading(true);
                const data = await terapeutaService.getProfissoes();
                setProfissoes(data);
            } catch (error) {
                console.error('Erro ao carregar profissões:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfissoes();
    }, []);

    return (
        <TextField
            select
            label="Profissão"
            value={value}
            onChange={onChange}
            fullWidth
            required={required}
            error={error}
            helperText={helperText}
            disabled={loading}
            InputProps={{
                endAdornment: loading && (
                    <InputAdornment position="end">
                        <CircularProgress size={20} />
                    </InputAdornment>
                )
            }}
        >
            {profissoes.map((profissao) => (
                <MenuItem key={profissao.profissao_id} value={profissao.profissao_id}>
                    {profissao.nome}
                </MenuItem>
            ))}
        </TextField>
    );
};

export default ProfessionSelect;
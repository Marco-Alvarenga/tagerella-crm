// src/client/components/Clients/ClientHistory.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    Box,
    CircularProgress
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { clientService } from '../../services/api';

const ClientHistory = ({ open, onClose, clientId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const data = await clientService.getClientHistory(clientId);
                setHistory(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (open && clientId) {
            fetchHistory();
        }
    }, [clientId, open]);

    // Função para formatar a data
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    // Função para mostrar as diferenças entre dados antigos e novos
    const renderChanges = (dadosAntigos, dadosNovos) => {
        if (!dadosAntigos || !dadosNovos) return null;

        const changes = [];
        for (const key in dadosNovos) {
            if (dadosAntigos[key] !== dadosNovos[key]) {
                changes.push(
                    <div key={key}>
                        <strong>{key}:</strong> {dadosAntigos[key]} → {dadosNovos[key]}
                    </div>
                );
            }
        }
        return changes.length > 0 ? changes : 'Sem alterações';
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Histórico de Alterações</Typography>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" align="center">
                        {error}
                    </Typography>
                ) : history.length === 0 ? (
                    <Typography align="center">
                        Nenhum registro de alteração encontrado.
                    </Typography>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Data</TableCell>
                                    <TableCell>Ação</TableCell>
                                    <TableCell>Alterações</TableCell>
                                    <TableCell>Responsável</TableCell>
                                    <TableCell>IP</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.map((registro, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{formatDate(registro.created_at)}</TableCell>
                                        <TableCell>{registro.acao}</TableCell>
                                        <TableCell>
                                            {renderChanges(registro.dados_antigos, registro.dados_novos)}
                                        </TableCell>
                                        <TableCell>{registro.usuario_responsavel}</TableCell>
                                        <TableCell>{registro.ip_address}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ClientHistory;
// src/client/components/Terapeuta/TerapeutaForm.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Alert,
    IconButton,
    Tooltip,
    CircularProgress,
    Autocomplete,
    Tabs,
    Tab,
    FormControlLabel,
    Switch,
    InputAdornment,
    Chip
} from '@mui/material';
import { 
    Close, 
    Visibility, 
    VisibilityOff,
    CloudUpload
} from '@mui/icons-material';
import { terapeutaService } from '../../services/api';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

// Componente principal
const TerapeutaForm = ({ open, onClose, onSubmit, terapeuta }) => {
    // Estados do formulário
    const [currentTab, setCurrentTab] = useState(0);
    const [formData, setFormData] = useState({
        // Dados básicos
        nome: '',
        email: '',
        senha: '',
        telefone: '',
        cpf: '',
        nacionalidade: '',

        // Dados profissionais
        profissao_id: '',
        registro_numero: '',
        registro_sigla: '',
        registro_validade: '',
        especialidades: [],
        areas_atuacao: [],
        universidade: '',
        experiencia: '',
        curriculo_url: '',
        descricao: '',

        // Dados financeiros
        valor_sessao: '',
        moeda: 'BRL',
        tempo_sessao: 50,
        modalidade_atendimento: 'presencial',
        pix: '',
        banco: '',
        agencia: '',
        conta: '',

        // Localização
        pais_id: '',
        estado_id: '',
        cidade_id: '',
        timezone: ''
    });

    // Estados de senha
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Estados de UI
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // Estados para listas de opções
    const [profissoes, setProfissoes] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [areasAtuacao, setAreasAtuacao] = useState([]);
    const [paises, setPaises] = useState([]);
    const [estados, setEstados] = useState([]);
    const [cidades, setCidades] = useState([]);

    // Carregar dados iniciais
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [
                    profissoesRes,
                    especialidadesRes,
                    areasRes,
                    paisesRes
                ] = await Promise.all([
                    terapeutaService.getProfissoes(),
                    terapeutaService.getEspecialidades(),
                    terapeutaService.getAreasAtuacao(),
                    terapeutaService.getPaises()
                ]);

                setProfissoes(profissoesRes);
                setEspecialidades(especialidadesRes);
                setAreasAtuacao(areasRes);
                setPaises(paisesRes);
            } catch (error) {
                setApiError('Erro ao carregar dados iniciais');
            }
        };

        fetchInitialData();

        if (terapeuta) {
            setFormData({
                ...terapeuta,
                senha: ''
            });

            // Carregar estados e cidades se houver país e estado selecionados
            if (terapeuta.pais_id) {
                handlePaisChange(terapeuta.pais_id);
                if (terapeuta.estado_id) {
                    handleEstadoChange(terapeuta.estado_id);
                }
            }
        }
    }, [terapeuta]);

    // Handlers para localização
    const handlePaisChange = async (paisId) => {
        try {
            const estadosList = await terapeutaService.getEstados(paisId);
            setEstados(estadosList);
            setFormData(prev => ({ ...prev, pais_id: paisId, estado_id: '', cidade_id: '' }));
            setCidades([]);
        } catch (error) {
            setApiError('Erro ao carregar estados');
        }
    };

    const handleEstadoChange = async (estadoId) => {
        try {
            const cidadesList = await terapeutaService.getCidades(estadoId);
            setCidades(cidadesList);
            setFormData(prev => ({ ...prev, estado_id: estadoId, cidade_id: '' }));
        } catch (error) {
            setApiError('Erro ao carregar cidades');
        }
    };

    // Validação do formulário
    const validateForm = () => {
        const newErrors = {};

        // Validações básicas
        if (!formData.nome?.trim()) newErrors.nome = 'Nome é obrigatório';
        if (!formData.email?.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Validar senha para novo terapeuta
        if (!terapeuta && !formData.senha) {
            newErrors.senha = 'Senha é obrigatória';
        } else if (formData.senha) {
            if (formData.senha.length < 8) {
                newErrors.senha = 'Senha deve ter no mínimo 8 caracteres';
            } else if (!/[A-Z]/.test(formData.senha)) {
                newErrors.senha = 'Senha deve conter pelo menos uma letra maiúscula';
            } else if (!/[a-z]/.test(formData.senha)) {
                newErrors.senha = 'Senha deve conter pelo menos uma letra minúscula';
            } else if (!/[0-9]/.test(formData.senha)) {
                newErrors.senha = 'Senha deve conter pelo menos um número';
            } else if (!/[!@#$%^&*]/.test(formData.senha)) {
                newErrors.senha = 'Senha deve conter pelo menos um caractere especial (!@#$%^&*)';
            }

            if (formData.senha !== confirmPassword) {
                newErrors.confirmPassword = 'As senhas não coincidem';
            }
        }

        // Validações profissionais
        if (!formData.profissao_id) newErrors.profissao_id = 'Profissão é obrigatória';
        if (!formData.registro_numero?.trim()) newErrors.registro_numero = 'Número de registro é obrigatório';
        if (!formData.registro_sigla?.trim()) newErrors.registro_sigla = 'Sigla do conselho é obrigatória';
        if (!formData.registro_validade) newErrors.registro_validade = 'Data de validade é obrigatória';
        if (formData.especialidades?.length === 0) newErrors.especialidades = 'Selecione pelo menos uma especialidade';

        // Validações financeiras
        if (!formData.valor_sessao) newErrors.valor_sessao = 'Valor da sessão é obrigatório';
        if (!formData.tempo_sessao) newErrors.tempo_sessao = 'Tempo da sessão é obrigatório';

        // Validações de localização
        if (!formData.pais_id) newErrors.pais_id = 'País é obrigatório';
        if (!formData.estado_id) newErrors.estado_id = 'Estado é obrigatório';
        if (!formData.cidade_id) newErrors.cidade_id = 'Cidade é obrigatória';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handler de mudança nos campos
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Limpar erro do campo quando alterado
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Submit do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        
        if (!validateForm()) {
            return setApiError('Por favor, corrija os erros antes de salvar');
        }

        try {
            setLoading(true);
            if (terapeuta) {
                await terapeutaService.updateTerapeuta(terapeuta.terapeuta_info_id, formData);
            } else {
                await terapeutaService.createTerapeuta(formData);
            }
            onSubmit();
        } catch (error) {
            setApiError(error.message);
        } finally {
            setLoading(false);
        }
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
                    <span>{terapeuta ? 'Editar Terapeuta' : 'Novo Terapeuta'}</span>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {apiError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {apiError}
                        </Alert>
                    )}

                    <Tabs
                        value={currentTab}
                        onChange={(e, newValue) => setCurrentTab(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab label="Dados Básicos" />
                        <Tab label="Dados Profissionais" />
                        <Tab label="Dados Financeiros" />
                        <Tab label="Localização" />
                    </Tabs>

                    <TabPanel value={currentTab} index={0}>
                        <TextField
                            name="nome"
                            label="Nome"
                            value={formData.nome}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.nome}
                            helperText={errors.nome}
                        />

                        <TextField
                            name="email"
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.email}
                            helperText={errors.email}
                        />

                        {(!terapeuta || formData.senha) && (
                            <>
                                <TextField
                                    name="senha"
                                    label="Senha"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.senha}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.senha}
                                    helperText={errors.senha}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        )
                                    }}
                                />

                                <TextField
                                    name="confirmPassword"
                                    label="Confirmar Senha"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.confirmPassword}
                                    helperText={errors.confirmPassword}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        )
                                    }}
                                />
                            </>
                        )}

                        <TextField
                            name="cpf"
                            label="CPF"
                            value={formData.cpf}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.cpf}
                            helperText={errors.cpf}
                        />

                        <TextField
                            name="nacionalidade"
                            label="Nacionalidade"
                            value={formData.nacionalidade}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />
                    </TabPanel>

                    <TabPanel value={currentTab} index={1}>
                        <TextField
                            select
                            name='profissao_id'
                            label="Profissão"
                            value={formData.profissao_id}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.profissao_id}
                            helperText={errors.profissao_id}
                        >
                            {profissoes.map(prof => (
                                <option key={prof.profissao_id} value={prof.profissao_id}>
                                    {prof.nome}
                                </option>
                            ))}
                        </TextField>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                name="registro_numero"
                                label="Número do Registro"
                                value={formData.registro_numero}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                error={!!errors.registro_numero}
                                helperText={errors.registro_numero}
                            />

                            <TextField
                                name="registro_sigla"
                                label="Sigla do Conselho"
                                value={formData.registro_sigla}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                error={!!errors.registro_sigla}
                                helperText={errors.registro_sigla}
                            />

                            <TextField
                                name="registro_validade"
                                label="Validade do Registro"
                                type="date"
                                value={formData.registro_validade}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                error={!!errors.registro_validade}
                                helperText={errors.registro_validade}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>

                        <Autocomplete
                            multiple
                            options={especialidades}
                            getOptionLabel={(option) => option.nome}
                            value={especialidades.filter(esp => 
                                formData.especialidades?.includes(esp.especialidade_id)
                            )}
                            onChange={(e, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    especialidades: newValue.map(v => v.especialidade_id)
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Especialidades"
                                    error={!!errors.especialidades}
                                    helperText={errors.especialidades}
                                    margin="normal"
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        label={option.nome}
                                        size="small"
                                        {...getTagProps({ index })}
                                    />
                                ))
                            }
                        />

                        <Autocomplete
                            multiple
                            options={areasAtuacao}
                            getOptionLabel={(option) => option.nome}
                            value={areasAtuacao.filter(area => 
                                formData.areas_atuacao?.includes(area.area_id)
                            )}
                            onChange={(e, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    areas_atuacao: newValue.map(v => v.area_id)
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Áreas de Atuação"
                                    margin="normal"
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        label={option.nome}
                                        size="small"
                                        {...getTagProps({ index })}
                                    />
                                ))
                            }
                        />

                        <TextField
                            name="universidade"
                            label="Universidade"
                            value={formData.universidade}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            name="experiencia"
                            label="Experiência Profissional"
                            value={formData.experiencia}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={4}
                            margin="normal"
                        />

                        <TextField
                            name="descricao"
                            label="Descrição/Biografia"
                            value={formData.descricao}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={4}
                            margin="normal"
                        />
                    </TabPanel>

                    <TabPanel value={currentTab} index={2}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                name="valor_sessao"
                                label="Valor da Sessão"
                                type="number"
                                value={formData.valor_sessao}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                error={!!errors.valor_sessao}
                                helperText={errors.valor_sessao}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">R$</InputAdornment>
                                }}
                            />

                            <TextField
                                name="tempo_sessao"
                                label="Tempo da Sessão (minutos)"
                                type="number"
                                value={formData.tempo_sessao}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                error={!!errors.tempo_sessao}
                                helperText={errors.tempo_sessao}
                            />
                        </Box>

                        <TextField
                            select
                            name="modalidade_atendimento"
                            label="Modalidade de Atendimento"
                            value={formData.modalidade_atendimento}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        >
                            <option value="presencial">Presencial</option>
                            <option value="online">Online</option>
                            <option value="hibrido">Híbrido</option>
                        </TextField>

                        <Box sx={{ mt: 3, mb: 2 }}>
                            <h4 className="text-lg font-medium mb-2">Dados Bancários</h4>
                            
                            <TextField
                                name="pix"
                                label="Chave PIX"
                                value={formData.pix}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                            />

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    name="banco"
                                    label="Banco"
                                    value={formData.banco}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                />

                                <TextField
                                    name="agencia"
                                    label="Agência"
                                    value={formData.agencia}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                />

                                <TextField
                                    name="conta"
                                    label="Conta"
                                    value={formData.conta}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </Box>
                        </Box>
                    </TabPanel>

                    <TabPanel value={currentTab} index={3}>
                        <TextField
                            select
                            name="pais_id"
                            label="País"
                            value={formData.pais_id}
                            onChange={(e) => handlePaisChange(e.target.value)}
                            fullWidth
                            margin="normal"
                            error={!!errors.pais_id}
                            helperText={errors.pais_id}
                        >
                            {paises.map(pais => (
                                <option key={pais.pais_id} value={pais.pais_id}>
                                    {pais.nome}
                                </option>
                            ))}
                        </TextField>

                        <TextField
                            select
                            name="estado_id"
                            label="Estado"
                            value={formData.estado_id}
                            onChange={(e) => handleEstadoChange(e.target.value)}
                            fullWidth
                            margin="normal"
                            error={!!errors.estado_id}
                            helperText={errors.estado_id}
                            disabled={!formData.pais_id}
                        >
                            {estados.map(estado => (
                                <option key={estado.estado_id} value={estado.estado_id}>
                                    {estado.nome}
                                </option>
                            ))}
                        </TextField>

                        <TextField
                            select
                            name="cidade_id"
                            label="Cidade"
                            value={formData.cidade_id}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.cidade_id}
                            helperText={errors.cidade_id}
                            disabled={!formData.estado_id}
                        >
                            {cidades.map(cidade => (
                                <option key={cidade.cidade_id} value={cidade.cidade_id}>
                                    {cidade.nome}
                                </option>
                            ))}
                        </TextField>

                        <TextField
                            select
                            name="timezone"
                            label="Fuso Horário"
                            value={formData.timezone}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        >
                            <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                            <option value="America/Manaus">Manaus (GMT-4)</option>
                            <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
                        </TextField>
                    </TabPanel>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                    >
                        {loading ? 'Salvando...' : (terapeuta ? 'Atualizar' : 'Criar')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TerapeutaForm;
// src/client/components/Terapeuta/TerapeutaConfig.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Tabs,
    Tab,
    Alert,
    Button,
    TextField,
	Typography,
	MenuItem,
    Paper,
    Grid,
    Avatar,
    Chip,
    InputAdornment,
    CircularProgress,
    Tooltip,
	Select, 
    FormControl,
    InputLabel,
    OutlinedInput,
    Checkbox,
    ListItemText    
} from '@mui/material';
import {
    Close,
    Save,
    Upload,
    Instagram,
    LinkedIn,
    Facebook,
    Twitter,
    Link as LinkIcon,
    Delete
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

const TerapeutaConfig = ({ open, onClose, terapeuta, onSubmit }) => {
    // Estados
    const [currentTab, setCurrentTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados dos formulários
    const [formData, setFormData] = useState({
        // Informações profissionais
        especialidade: '',
        registro_numero: '',
        curriculo_url: '',
        descricao: '',
        experiencia: '',
        valor_sessao: '',
        tempo_sessao: '',
        modalidade_atendimento: '',

        // Redes sociais
        redes_sociais: [],

        // Foto e Assinatura
        foto_url: '',
        assinatura_url: '',

        // Informações bancárias
        pix: '',
        banco: '',
        agencia: '',
        conta: '',
        moeda: 'BRL'
    });

    // Estados para upload
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [selectedSignature, setSelectedSignature] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingSignature, setUploadingSignature] = useState(false);

    // Estado para nova rede social
    const [novaRedeSocial, setNovaRedeSocial] = useState({
        rede: '',
        url: ''
    });
	
    // Novos estados para as listas
    const [especialidades, setEspecialidades] = useState([]);
    const [areasAtuacao, setAreasAtuacao] = useState([]);
    
    // Estados para seleções
    const [selectedEspecialidades, setSelectedEspecialidades] = useState([]);
    const [selectedAreas, setSelectedAreas] = useState([]);	
	
    // Carregar listas ao montar o componente
    useEffect(() => {
        const fetchLists = async () => {
            try {
                const [espResponse, areasResponse] = await Promise.all([
                    terapeutaService.getEspecialidades(),
                    terapeutaService.getAreasAtuacao()
                ]);
                setEspecialidades(espResponse);
                setAreasAtuacao(areasResponse);
            } catch (err) {
                setError('Erro ao carregar listas de especialidades e áreas');
            }
        };

        fetchLists();
    }, []);	

    // Carregar dados do terapeuta
    useEffect(() => {
        if (terapeuta) {
        console.log('Dados do terapeuta:', terapeuta);

        setFormData({
            // Informações profissionais
            especialidade: terapeuta.especialidade || '',
            registro_numero: terapeuta.registro_numero || '',
            curriculo_url: terapeuta.curriculo_url || '',
            descricao: terapeuta.descricao || '',
            experiencia: terapeuta.experiencia || '',
            valor_sessao: terapeuta.valor_sessao || '',
            tempo_sessao: terapeuta.tempo_sessao || '',
            modalidade_atendimento: terapeuta.modalidade_atendimento || '',
            universidade: terapeuta.universidade || '',
			profissao_id: terapeuta.profissao_id || '',
			registro_sigla: terapeuta.registro_sigla || '',		

            // Dados bancários
            pix: terapeuta.pix || '',
            banco: terapeuta.banco || '',
            agencia: terapeuta.agencia || '',
            conta: terapeuta.conta || '',
            moeda: terapeuta.moeda || 'BRL',

            // Fotos
            foto_url: terapeuta.foto_url || '',
            assinatura_url: terapeuta.assinatura_url || '',

            // Redes sociais
            redes_sociais: terapeuta.redes_sociais || [],
        });
		
			// Setar especialidades e áreas selecionadas
			if (terapeuta.especialidades) {
				setSelectedEspecialidades(terapeuta.especialidades.map(e => e.especialidade_id));
			}
			if (terapeuta.areas_atuacao) {
				setSelectedAreas(terapeuta.areas_atuacao.map(a => a.area_id));
			}		

        console.log('Dados formatados:', setFormData);
        }
	}, [terapeuta]);
	
    // Handler para mudança nas especialidades
    const handleEspecialidadesChange = (event) => {
        setSelectedEspecialidades(event.target.value);
    };

    // Handler para mudança nas áreas
    const handleAreasChange = (event) => {
        setSelectedAreas(event.target.value);
    };	

    // Handler para mudança nos campos
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handlers para upload de foto
    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.includes('image/')) {
                setError('Selecione apenas arquivos de imagem');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setError('Imagem deve ter no máximo 2MB');
                return;
            }
            setSelectedPhoto(file);
        }
    };

    const handlePhotoUpload = async () => {
        if (!selectedPhoto) return;
        
        try {
            setUploadingPhoto(true);
            const formData = new FormData();
            formData.append('foto', selectedPhoto);
            
            const response = await terapeutaService.updateFotoPerfil(terapeuta.terapeuta_info_id, formData);
            setFormData(prev => ({ ...prev, foto_url: response.foto_url }));
            setSelectedPhoto(null);
            setSuccess('Foto atualizada com sucesso');
        } catch (err) {
            setError(err.message);
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Handlers para upload de assinatura
    const handleSignatureSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.includes('image/')) {
                setError('Selecione apenas arquivos de imagem');
                return;
            }
            if (file.size > 1 * 1024 * 1024) {
                setError('Imagem deve ter no máximo 1MB');
                return;
            }
            setSelectedSignature(file);
        }
    };

    const handleSignatureUpload = async () => {
        if (!selectedSignature) return;
        
        try {
            setUploadingSignature(true);
            const formData = new FormData();
            formData.append('assinatura', selectedSignature);
            
            const response = await terapeutaService.updateAssinatura(terapeuta.terapeuta_info_id, formData);
            setFormData(prev => ({ ...prev, assinatura_url: response.assinatura_url }));
            setSelectedSignature(null);
            setSuccess('Assinatura atualizada com sucesso');
        } catch (err) {
            setError(err.message);
        } finally {
            setUploadingSignature(false);
        }
    };

    // Handlers para redes sociais
    const handleAddRedeSocial = () => {
        if (!novaRedeSocial.rede || !novaRedeSocial.url) {
            setError('Preencha todos os campos da rede social');
            return;
        }

        setFormData(prev => ({
            ...prev,
            redes_sociais: [...prev.redes_sociais, novaRedeSocial]
        }));

        setNovaRedeSocial({ rede: '', url: '' });
    };

    const handleRemoveRedeSocial = (index) => {
        setFormData(prev => ({
            ...prev,
            redes_sociais: prev.redes_sociais.filter((_, i) => i !== index)
        }));
    };

    // Submit principal
    const handleSubmit = async () => {
        try {
            setLoading(true);
            const dataToSend = {
                ...formData,
                especialidades: selectedEspecialidades,
                areas_atuacao: selectedAreas,
                redes_sociais: formData.redes_sociais
            };

            await terapeutaService.updateInfoProfissional(terapeuta.terapeuta_info_id, dataToSend);
            setSuccess('Configurações atualizadas com sucesso');
            onSubmit();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Renderizar ícone da rede social
    const getRedeSocialIcon = (rede) => {
        switch (rede.toLowerCase()) {
            case 'instagram': return <Instagram />;
            case 'linkedin': return <LinkedIn />;
            case 'facebook': return <Facebook />;
            case 'twitter': return <Twitter />;
            default: return <LinkIcon />;
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
                    <span>Configurações - {terapeuta.nome}</span>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                <Tabs
                    value={currentTab}
                    onChange={(e, newValue) => setCurrentTab(newValue)}
                    sx={{ mb: 2 }}
                >
                    <Tab label="Perfil" />
                    <Tab label="Redes Sociais" />
                    <Tab label="Dados Financeiros" />
                </Tabs>

                <TabPanel value={currentTab} index={0}>
                    {/* Foto e Assinatura */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Foto de Perfil
                                </Typography>
                                
                                <Avatar
                                    src={formData.foto_url}
                                    sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                                />

                                <input
                                    type="file"
                                    id="foto-upload"
                                    hidden
                                    accept="image/*"
                                    onChange={handlePhotoSelect}
                                />

                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        htmlFor="foto-upload"
                                    >
                                        Escolher Foto
                                    </Button>

                                    {selectedPhoto && (
                                        <Button
                                            variant="contained"
                                            onClick={handlePhotoUpload}
                                            disabled={uploadingPhoto}
                                        >
                                            {uploadingPhoto ? 'Enviando...' : 'Enviar'}
                                        </Button>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Assinatura Digital
                                </Typography>
                                
                                {formData.assinatura_url ? (
                                    <Box
                                        component="img"
                                        src={formData.assinatura_url}
                                        sx={{
                                            maxWidth: '100%',
                                            height: 'auto',
                                            maxHeight: 150,
                                            mb: 2
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: 150,
                                            bgcolor: '#f5f5f5',
                                            mb: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Typography color="textSecondary">
                                            Sem assinatura
                                        </Typography>
                                    </Box>
                                )}

                                <input
                                    type="file"
                                    id="assinatura-upload"
                                    hidden
                                    accept="image/*"
                                    onChange={handleSignatureSelect}
                                />

                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        htmlFor="assinatura-upload"
                                    >
                                        Escolher Assinatura
                                    </Button>

                                    {selectedSignature && (
                                        <Button
                                            variant="contained"
                                            onClick={handleSignatureUpload}
                                            disabled={uploadingSignature}
                                        >
                                            {uploadingSignature ? 'Enviando...' : 'Enviar'}
                                        </Button>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Informações Profissionais */}
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Informações Profissionais
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Especialidades</InputLabel>
                                <Select
                                    multiple
                                    value={selectedEspecialidades}
                                    onChange={handleEspecialidadesChange}
                                    input={<OutlinedInput label="Especialidades" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const esp = especialidades.find(e => e.especialidade_id === value);
                                                return (
                                                    <Chip 
                                                        key={value} 
                                                        label={esp?.nome || value} 
                                                        size="small"
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                >
                                    {especialidades.map((esp) => (
                                        <MenuItem key={esp.especialidade_id} value={esp.especialidade_id}>
                                            <Checkbox 
                                                checked={selectedEspecialidades.includes(esp.especialidade_id)} 
                                            />
                                            <ListItemText primary={esp.nome} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            </Grid>
							
							<Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Áreas de Atuação</InputLabel>
                                <Select
                                    multiple
                                    value={selectedAreas}
                                    onChange={handleAreasChange}
                                    input={<OutlinedInput label="Áreas de Atuação" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const area = areasAtuacao.find(a => a.area_id === value);
                                                return (
                                                    <Chip 
                                                        key={value} 
                                                        label={area?.nome || value} 
                                                        size="small"
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                >
                                    {areasAtuacao.map((area) => (
                                        <MenuItem key={area.area_id} value={area.area_id}>
                                            <Checkbox 
                                                checked={selectedAreas.includes(area.area_id)} 
                                            />
                                            <ListItemText primary={area.nome} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    name="registro_numero"
                                    label="Número do Conselho"
                                    value={formData.registro_numero}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    name="descricao"
                                    label="Descrição do Perfil"
                                    value={formData.descricao}
                                    onChange={handleChange}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12}>
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
                            </Grid>
                        </Grid>
                    </Paper>
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                    {/* Redes Sociais */}
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Redes Sociais
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        select
                                        label="Rede Social"
                                        value={novaRedeSocial.rede}
                                        onChange={(e) => setNovaRedeSocial({
                                            ...novaRedeSocial,
                                            rede: e.target.value
                                        })}
                                        fullWidth
                                    >
                                        <MenuItem value="instagram">Instagram</MenuItem>
                                        <MenuItem value="linkedin">LinkedIn</MenuItem>
                                        <MenuItem value="facebook">Facebook</MenuItem>
                                        <MenuItem value="twitter">Twitter</MenuItem>
                                        <MenuItem value="site">Site/Blog</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="URL"
                                        value={novaRedeSocial.url}
                                        onChange={(e) => setNovaRedeSocial({
                                            ...novaRedeSocial,
                                            url: e.target.value
                                        })}
                                        fullWidth
                                        placeholder="https://"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={2}>
                                    <Button
                                        variant="contained"
                                        onClick={handleAddRedeSocial}
                                        fullWidth
                                        sx={{ height: '100%' }}
                                    >
                                        Adicionar
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {formData.redes_sociais.map((rede, index) => (
                                <Chip
                                    key={index}
                                    icon={getRedeSocialIcon(rede.rede)}
                                    label={rede.url}
                                    onDelete={() => handleRemoveRedeSocial(index)}
                                    onClick={() => window.open(rede.url, '_blank')}
                                    sx={{ maxWidth: 300 }}
                                />
                            ))}
                        </Box>
                    </Paper>
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                    {/* Dados Financeiros */}
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Informações de Pagamento
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    name="valor_sessao"
                                    label="Valor da Sessão"
                                    type="number"
                                    value={formData.valor_sessao}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">R$</InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    name="tempo_sessao"
                                    label="Tempo da Sessão (minutos)"
                                    type="number"
                                    value={formData.tempo_sessao}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    name="pix"
                                    label="Chave PIX"
                                    value={formData.pix}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    name="banco"
                                    label="Banco"
                                    value={formData.banco}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    name="agencia"
                                    label="Agência"
                                    value={formData.agencia}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    name="conta"
                                    label="Conta"
                                    value={formData.conta}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </TabPanel>

                {/* Botões de ação */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        onClick={onClose} 
                        sx={{ mr: 1 }}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default TerapeutaConfig;
// src/client/components/Terapeuta/TerapeutaDocumentos.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
	ListItemIcon,
    Paper,
    TextField,
    Alert,
    Chip,
    CircularProgress,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Close,
    Upload,
    Description,
    PictureAsPdf,
    Image,
    Download,
    Delete,
	Visibility,
    MoreVert
} from '@mui/icons-material';
import { terapeutaService } from '../../services/api';
const TerapeutaDocumentos = ({ open, onClose, terapeuta }) => {
    // Estados
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Estados para upload
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadData, setUploadData] = useState({
        tipo: '',
        descricao: ''
    });

    // Estado para menu de ações
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [selectedDocumento, setSelectedDocumento] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);

    // Ref para input de arquivo
    const fileInputRef = useRef();

    // Carregar documentos
    useEffect(() => {
        fetchDocumentos();
    }, [terapeuta.terapeuta_info_id]);
    const fetchDocumentos = async () => {
        try {
            setLoading(true);
			setError('');
            const data = await terapeutaService.listarDocumentos(terapeuta.terapeuta_info_id);
			console.log('Documentos recebidos:', data); // Debug
            setDocumentos(data || []);
        } catch (err) {
			console.error('Erro ao carregar documentos:', err);
            setError('Erro ao carregar documentos');
        } finally {
            setLoading(false);
        }
    };

    // Handlers para upload
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validar tipo de arquivo
            const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!tiposPermitidos.includes(file.type)) {
                setError('Tipo de arquivo não permitido. Apenas PDF, JPEG, JPG e PNG são aceitos.');
                return;
            }

            // Validar tamanho (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Arquivo muito grande. Tamanho máximo permitido é 5MB.');
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
		if (!selectedFile || !uploadData.tipo) {
			setError('Selecione um arquivo e preencha o tipo do documento');
			return;
		}
	
		try {
			setUploading(true);
			const formData = new FormData();
			formData.append('documento', selectedFile, selectedFile.name); // Adicionado nome do arquivo
			formData.append('tipo', uploadData.tipo);
			formData.append('descricao', uploadData.descricao || '');
	
			// Debug
			console.log('FormData entries:');
			for (let pair of formData.entries()) {
				console.log(pair[0], pair[1]);
			}
			
			const response = await terapeutaService.uploadDocumento(terapeuta.terapeuta_info_id, formData);
			setSuccess('Documento enviado com sucesso');
			setSelectedFile(null);
			setUploadData({ tipo: '', descricao: '' });
			await fetchDocumentos();
		} catch (err) {
			console.error('Erro detalhado:', err);
			setError(err.message || 'Erro ao enviar documento');
		} finally {
			setUploading(false);
		}
	};

    // Handlers para menu de ações
    const handleMenuOpen = (event, documento) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedDocumento(documento);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedDocumento(null);
    };

    const handleDownload = async (documento) => {
		try {
			setLoading(true);
			await terapeutaService.downloadDocumento(documento.documento_id);
		} catch (err) {
			setError(err.message || 'Erro ao baixar documento');
		} finally {
			setLoading(false);
		}
    };

    const handleDelete = async (documento) => {
		try {
			if (!window.confirm('Tem certeza que deseja excluir este documento?')) {
				return;
			}
	
			setLoading(true);
			await terapeutaService.deleteDocumento(documento.documento_id);
			setSuccess('Documento excluído com sucesso');
			await fetchDocumentos(); // Recarrega a lista
		} catch (err) {
			setError(err.message || 'Erro ao excluir documento');
		} finally {
			setLoading(false);
		}
    };
	
	// Função para abrir preview
	const handlePreview = (arquivo_url) => {
		if (arquivo_url?.toLowerCase().match(/\.(jpg|jpeg|png)$/)) {
			setPreviewUrl(arquivo_url);
		}
	};	

    // Função para renderizar ícone baseado no tipo de arquivo
    const renderFileIcon = (tipo, arquivo_url) => {
		// Primeiro verifica a extensão do arquivo
		if (arquivo_url) {
			const ext = arquivo_url.toLowerCase();
			if (ext.endsWith('.pdf')) return <PictureAsPdf />;
			if (ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png')) return <Image />;
		}
		
		// Se não encontrar pela extensão, tenta pelo tipo
		if (tipo) {
			const tipoLowerCase = tipo.toLowerCase();
			if (tipoLowerCase.includes('pdf')) return <PictureAsPdf />;
			if (tipoLowerCase.includes('imagem') || tipoLowerCase.includes('foto')) return <Image />;
		}
		
		// Fallback
		return <Description />;
	};

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
		<Dialog open={!!previewUrl} onClose={() => setPreviewUrl(null)} maxWidth="md" fullWidth>
			<DialogTitle>
				<Box display="flex" justifyContent="space-between" alignItems="center">
					<Typography variant="h6">Visualização do Documento</Typography>
					<IconButton onClick={() => setPreviewUrl(null)}>
						<Close />
					</IconButton>
				</Box>
			</DialogTitle>
			<DialogContent>
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
					<img 
						src={previewUrl} 
						alt="Preview" 
						style={{ maxWidth: '100%', maxHeight: '70vh' }}
					/>
				</Box>
			</DialogContent>
		</Dialog>		
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <span>Documentos - {terapeuta.nome}</span>
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

                {/* Área de upload */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Upload de Documento
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                            accept=".pdf,.jpg,.jpeg,.png"
                        />

                        <Button
                            variant="outlined"
                            onClick={() => fileInputRef.current.click()}
                            startIcon={<Upload />}
                        >
                            Selecionar Arquivo
                        </Button>

                        {selectedFile && (
                            <Chip
                                label={selectedFile.name}
                                onDelete={() => setSelectedFile(null)}
                            />
                        )}
                    </Box>

                    {selectedFile && (
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                select
                                label="Tipo de Documento"
                                value={uploadData.tipo}
                                onChange={(e) => setUploadData({ ...uploadData, tipo: e.target.value })}
                                fullWidth
                                margin="normal"
                            >
                                <MenuItem value="registro">Registro Profissional</MenuItem>
                                <MenuItem value="certificado">Certificado</MenuItem>
                                <MenuItem value="diploma">Diploma</MenuItem>
                                <MenuItem value="rg">RG</MenuItem>
                                <MenuItem value="cpf">CPF</MenuItem>
                                <MenuItem value="comprovante">Comprovante de Endereço</MenuItem>
                                <MenuItem value="outro">Outro</MenuItem>
                            </TextField>

                            <TextField
                                label="Descrição"
                                value={uploadData.descricao}
                                onChange={(e) => setUploadData({ ...uploadData, descricao: e.target.value })}
                                fullWidth
                                margin="normal"
                                multiline
                                rows={2}
                            />

                            <Button
                                variant="contained"
                                onClick={handleUpload}
                                disabled={uploading}
                                startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
                                sx={{ mt: 1 }}
                            >
                                {uploading ? 'Enviando...' : 'Enviar'}
                            </Button>
                        </Box>
                    )}
                </Paper>

                {/* Lista de documentos */}
                <List>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
						</Box>
					) : error ? (
						<Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
					) : documentos.length === 0 ? (
						<Typography variant="body2" color="textSecondary" align="center" sx={{ p: 3 }}>
							Nenhum documento encontrado
						</Typography>
                    ) : (
                        documentos.map((documento) => (
							<ListItem
								key={documento.documento_id}
								secondaryAction={
									<Box>
										{documento.arquivo_url?.toLowerCase().match(/\.(jpg|jpeg|png)$/) && (
											<IconButton onClick={() => handlePreview(documento.arquivo_url)}>
												<Visibility />
											</IconButton>
										)}
										<IconButton onClick={(e) => handleMenuOpen(e, documento)}>
											<MoreVert />
										</IconButton>
									</Box>
								}
							>
								<ListItemText
									primary={
										<Typography 
											component="span" // Mudando para span em vez de p
											sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
										>
											{renderFileIcon(documento.tipo, documento.arquivo_url)}
											{documento.tipo || 'Documento'}
										</Typography>
									}
									secondary={
										<>
											<Typography 
												variant="body2" 
												component="span" // Importante: usando span em vez de p ou div
												display="block"
												color="textSecondary"
											>
												{documento.descricao || 'Sem descrição'}
											</Typography>
											<Typography 
												variant="caption" 
												component="span" // Importante: usando span em vez de p ou div
												display="block"
												color="textSecondary"
											>
												{documento.data_upload 
													? `Enviado em: ${new Date(documento.data_upload).toLocaleString()}`
													: 'Data não disponível'
												}
											</Typography>
										</>
									}
								/>
							</ListItem>
                        ))
                    )}
                </List>

                {/* Menu de ações */}
				<Menu
					anchorEl={menuAnchorEl}
					open={Boolean(menuAnchorEl)}
					onClose={() => setMenuAnchorEl(null)}
				>
					<MenuItem onClick={() => {
						handleDownload(selectedDocumento);
						setMenuAnchorEl(null);
					}}>
						<ListItemIcon>
							<Download fontSize="small" />
						</ListItemIcon>
						<ListItemText>Download</ListItemText>
					</MenuItem>
					<MenuItem onClick={() => {
						handleDelete(selectedDocumento);
						setMenuAnchorEl(null);
					}}>
						<ListItemIcon>
							<Delete fontSize="small" color="error" />
						</ListItemIcon>
						<ListItemText>Excluir</ListItemText>
					</MenuItem>
				</Menu>
            </DialogContent>
        </Dialog>
    );
};

export default TerapeutaDocumentos;
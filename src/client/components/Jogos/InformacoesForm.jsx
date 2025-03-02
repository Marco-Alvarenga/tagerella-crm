// src/client/components/Jogos/InformacoesForm.jsx
import React, { useState, useEffect } from 'react';
import UploadArea from './UploadArea';
import SingleImageUpload from './SingleImageUpload';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
    Tabs,
    Tab,
    Box
} from '@mui/material';
import ToggleSwitch from './ToggleSwitch'; // Importe o componente ToggleSwitch

const InformacoesForm = ({ open, onClose, onSubmit, informacao, subSubcategoriaId }) => {
    const [formData, setFormData] = useState({
        nome: '',
        sort: '',
		tipo: 'jogo',
        tipojogo: 'cartas',
		screensaver: '',
		background: '',
		coverimage: '',
		animationtype: 'simples',
		numbers: 'true',
		numberscolor: 'FFFFFF',
    });
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        if (informacao) {
            setFormData(informacao);
        }
    }, [informacao]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

	const handleToggleChange = (value) => {
		setFormData({
		...formData,
		active: value,
		});
	};

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = informacao
                ? `/api/jogos/informacoes/${informacao.id}`
                : `/api/jogos/sub_subcategorias/${subSubcategoriaId}/informacoes`;

            const response = await fetch(url, {
                method: informacao ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                onSubmit();
            }
        } catch (error) {
            console.error('Error saving informacao:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle className="bg-blue-700 text-white">{informacao ? 'Editar Jogo' : 'Criar Jogo'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Tabs value={tabIndex} onChange={handleTabChange}>
                        <Tab label="Opções" />
                        <Tab label="Detalhes" />
                        <Tab label="Sons" />
                    </Tabs>
                    <Box hidden={tabIndex !== 0} className="p-4 space-y-5">
                        <TextField
                            name="nome"
                            label="Nome"
                            value={formData.nome}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                    	<TextField
                        	name="sort"
                        	label="Sort"
                        	value={formData.sort}
                        	onChange={handleChange}
                        	fullWidth
                        	required
                        	margin="normal"
                    	/>
						<FormControl fullWidth>
							<InputLabel>Tipo</InputLabel>
							<Select
								value={formData.tipo}
								name="tipo"
								required
								onChange={handleChange}>
								<MenuItem value="jogo">Jogo</MenuItem>
								<MenuItem value="pasta">Pasta</MenuItem>
							</Select>
						</FormControl>       
						
                    </Box>
                    <Box hidden={tabIndex !== 1} className="p-4 space-y-4">
                        
						<FormControl fullWidth>
							<InputLabel>Tipo de Jogo</InputLabel>
							<Select 
								value={formData.tipojogo} 
								name="tipojogo"
								onChange={handleChange}>
								<MenuItem value="cartas">Cartas</MenuItem>
								<MenuItem value="memo">Memoria</MenuItem>
								<MenuItem value="sorting">Sorting</MenuItem>
								<MenuItem value="combine">Combine</MenuItem>
								<MenuItem value="combine_t">Combine TPAC</MenuItem>
								<MenuItem value="encontre">Encontre</MenuItem>
								<MenuItem value="encontre_t">Encontre TPAC</MenuItem>
								{/* Add other game types as needed */}
							</Select>
						</FormControl>
						
						<SingleImageUpload
							informacaoId={informacao?.id}
							fieldName="screensaver"
							label="Descanso de tela"
							value={formData.screensaver}
							onChange={handleChange}
						/>
												
						<SingleImageUpload
							informacaoId={informacao?.id}
							fieldName="background"
							label="Papel de parede"
							value={formData.background}
							onChange={handleChange}
						/>	
						
						<SingleImageUpload
							informacaoId={informacao?.id}
							fieldName="coverimage"
							label="Verso da carta"
							value={formData.coverimage}
							onChange={handleChange}
						/>

						<FormControl fullWidth>
							<InputLabel>Tipo de animação</InputLabel>
							<Select
								value={formData.animationtype}
								name="animationtype"
								onChange={handleChange}>
								<MenuItem value="simples">Simples</MenuItem>
								{/* Add other animation types as needed */}
							</Select>
						</FormControl>
						
						<FormControl fullWidth>
							<InputLabel>Numeros</InputLabel>
							<Select
								value={formData.numbers}
								name="numbers"
								onChange={handleChange}>
								<MenuItem value="true">Show</MenuItem>
								<MenuItem value="false">Hide</MenuItem>
							</Select>
						</FormControl>	

						<TextField
								fullWidth
								label="Cor dos numeros"
								value={formData.numberscolor}
								name="numberscolor"
								onChange={handleChange}
						/>	
						
						{informacao?.id ? (
							<UploadArea informacaoId={informacao.id} />
						) : (
							<div className="text-gray-500 text-center py-4">
								Salve o registro primeiro para habilitar o upload de imagens
							</div>
						)}						
						
                    </Box>
                    <Box hidden={tabIndex !== 2}>

                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">
                        {informacao ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default InformacoesForm;

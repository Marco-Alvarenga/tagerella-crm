// src/client/components/Jogos/MenuList.jsx
import React, { useState, useEffect } from 'react';
import { Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuIcon from '@mui/icons-material/Menu';
import MenuForm from './MenuForm';
import JogoConfigForm from './JogoConfig/JogoConfigForm';
import InitialJogoConfigForm from './JogoConfig/InitialJogoConfigForm';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useParams, useNavigate } from 'react-router-dom';

const MenuList = () => {
  const { parentId: urlParentId } = useParams();
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openJogoConfig, setOpenJogoConfig] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formParentId, setFormParentId] = useState(null);
  const [openInitialConfig, setOpenInitialConfig] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);

  const fetchMenus = async () => {
    try {
      const response = await fetch(`/api/jogos/menu/children/${urlParentId || 'root'}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setMenus(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMenus([]);
    }
  };

const handleEdit = (item) => {
  console.log('Item selecionado:', item); // Debug
  setSelectedMenu(item);
  if (item.tipo === 'jogo') {
    console.log('Abrindo config de jogo'); // Debug
    setOpenJogoConfig(true);
  } else {
    console.log('Abrindo form normal'); // Debug
    setOpenForm(true);
  }
};

 useEffect(() => {
   fetchMenus();
 }, [urlParentId]);


const handleDelete = async (id) => {
  if (!window.confirm('Deseja desativar este menu?')) return;
  try {
    await fetch(`/api/jogos/menu/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    fetchMenus();
  } catch (error) {
    console.error(error);
  }
};

const handlePermanentDelete = async (id) => {
  if (!window.confirm('ATENÇÃO: Esta ação não pode ser desfeita. Deseja excluir permanentemente?')) return;
  try {
    await fetch(`/api/jogos/menu/${id}/permanent`, {
      method: 'DELETE', 
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    fetchMenus();
  } catch (error) {
    console.error(error);
  }
};

const handleReactivate = async (id) => {
  try {
    await fetch(`/api/jogos/menu/${id}/reactivate`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    fetchMenus();
  } catch (error) {
    console.error(error);
  }
};

  const handleSubMenu = (parentMenuId) => {
    if (window.confirm('Deseja navegar para o submenu?')) {
      navigate(`/jogos/menu/${parentMenuId}`);
    } else {
      setFormParentId(parentMenuId);
      setSelectedItem(null);
      setOpenForm(true);
    }
  };
  
   const handleAddNew = () => {
    setSelectedItem(null);
    setOpenForm(true);
  };

 return (
   <>
     <Button variant="contained" onClick={() => setOpenForm(true)}>
       Novo Menu
     </Button>
     <TableContainer component={Paper}>
       <Table>
         <TableHead>
           <TableRow>
             <TableCell>Nome</TableCell>
             <TableCell>Ordem</TableCell>
             <TableCell>Tipo</TableCell>
			 <TableCell>Stauts</TableCell>
             <TableCell>Ações</TableCell>
           </TableRow>
         </TableHead>
         <TableBody>
           {menus.map((menu) => (
             <TableRow key={menu.menu_id}>
               <TableCell>{menu.nome}</TableCell>
               <TableCell>{menu.ordem}</TableCell>
               <TableCell>{menu.tipo}</TableCell>
			   <TableCell>{menu.ativo ? 'Ativo' : 'Inativo'}</TableCell>
				<TableCell>
                 <IconButton onClick={() => handleEdit(menu)}>
                   <EditIcon />
					</IconButton>
					{menu.tipo === 'pasta' && (
					<IconButton onClick={() => handleSubMenu(menu.menu_id)}>
						<MenuIcon />
					</IconButton>
					)}
					{menu.ativo ? (
					<IconButton onClick={() => handleDelete(menu.menu_id)}>
						<DeleteIcon />
					</IconButton>
					) : (
					<>
						<IconButton onClick={() => handleReactivate(menu.menu_id)} color="primary">
						<RestoreIcon />
						</IconButton>
						<IconButton onClick={() => handlePermanentDelete(menu.menu_id)} color="error">
						<DeleteForeverIcon />
						</IconButton>
					</>
					)}
				</TableCell>
             </TableRow>
           ))}
         </TableBody>
       </Table>
     </TableContainer>

     <MenuForm 
       open={openForm}
       onClose={() => {
         setOpenForm(false);
         setSelectedMenu(null);
       }}
       onSuccess={() => {
         fetchMenus();
         setOpenForm(false);
         setSelectedMenu(null);
       }}
       menu={selectedMenu}
       parentId={urlParentId}
     />

     {openJogoConfig && (
       <JogoConfigForm
         open={openJogoConfig}
         onClose={() => {
           setOpenJogoConfig(false);
           setSelectedMenu(null);
         }}
         onSuccess={() => {
           fetchMenus();
           setOpenJogoConfig(false);
           setSelectedMenu(null);
         }}
         menu={selectedMenu}
       />
     )}
   </>
 );
};

export default MenuList;
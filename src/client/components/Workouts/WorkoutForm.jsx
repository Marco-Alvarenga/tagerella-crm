// src/client/components/Workouts/WorkoutForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import.meta.env.VITE_API_URL; // Importe a variável de ambiente

const WorkoutForm = ({ open, onClose, onSubmit, workout }) => {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    status: 'active'
  });

  useEffect(() => {
    fetchClients();
    if (workout) {
      setFormData(workout);
    }
  }, [workout]);

  const fetchClients = async () => {
    try {
	  const baseUrl = import.meta.env.VITE_API_URL; // Use a variável aqui	
      const response = await fetch('${baseUrl}/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
	  const baseUrl = import.meta.env.VITE_API_URL; // Use a variável aqui
      const url = workout
        ? `${baseUrl}/api/workouts/${workout.id}`
        : '${baseUrl}/api/workouts';
      
      const response = await fetch(url, {
        method: workout ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSubmit();
      }
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{workout ? 'Edit Workout' : 'Add New Workout'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Client</InputLabel>
            <Select
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              required
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {workout ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default WorkoutForm;
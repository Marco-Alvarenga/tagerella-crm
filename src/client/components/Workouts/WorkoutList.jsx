// src/client/components/Workouts/WorkoutList.jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import WorkoutForm from './WorkoutForm';
import.meta.env.VITE_API_URL; // Importe a variável de ambiente

const WorkoutList = () => {
  const [workouts, setWorkouts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
	  const baseUrl = import.meta.env.VITE_API_URL; // Use a variável aqui	
      const response = await fetch('${baseUrl}/api/workouts');
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const handleEdit = (workout) => {
    setSelectedWorkout(workout);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
		const baseUrl = import.meta.env.VITE_API_URL; // Use a variável aqui  
        await fetch(`${baseUrl}/api/workouts/${id}`, {
          method: 'DELETE',
        });
        fetchWorkouts();
      } catch (error) {
        console.error('Error deleting workout:', error);
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedWorkout(null);
  };

  const handleFormSubmit = () => {
    fetchWorkouts();
    handleFormClose();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsFormOpen(true)}
        >
          Add New Workout
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workouts.map((workout) => (
              <TableRow key={workout.id}>
                <TableCell>{workout.title}</TableCell>
                <TableCell>{workout.description}</TableCell>
                <TableCell>{workout.client_name}</TableCell>
                <TableCell>
                  <Chip
                    label={workout.status}
                    color={workout.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(workout)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(workout.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {isFormOpen && (
        <WorkoutForm
          open={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          workout={selectedWorkout}
        />
      )}
    </div>
  );
};

export default WorkoutList;


import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography
} from '@mui/material';
import { courses } from '../../../data/courses';

export default function CourseSelector({ 
  selectedCourse, 
  selectedTee, 
  onCourseChange, 
  onTeeChange 
}) {
  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Select Course and Tee
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Course</InputLabel>
            <Select
              value={selectedCourse || ''}
              label="Course"
              onChange={(e) => onCourseChange(e.target.value)}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled={!selectedCourse}>
            <InputLabel>Tee Box</InputLabel>
            <Select
              value={selectedTee || ''}
              label="Tee Box"
              onChange={(e) => onTeeChange(e.target.value)}
            >
              {selectedCourse && 
                courses
                  .find(c => c.id === selectedCourse)
                  ?.teeBoxes.map((tee) => (
                    <MenuItem key={tee.id} value={tee.id}>
                      {tee.name} ({tee.color})
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}
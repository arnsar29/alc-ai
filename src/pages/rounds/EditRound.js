// src/pages/rounds/EditRound.js
import React from 'react';
import { useParams } from 'react-router-dom';
import EnterRound from './EnterRound';
import MainLayout from '../../layouts/MainLayout';

export default function EditRound() {
    const { id } = useParams();
    console.log('EditRound - Received ID from params:', id);
    
    // Let's log the component rendering to confirm it's working
    React.useEffect(() => {
      console.log('EditRound component mounted with ID:', id);
    }, [id]);
    
    return <EnterRound roundId={id} />;
  }
// src/components/FirebaseTest.js
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Button, TextField, Typography } from '@mui/material';

const FirebaseTest = () => {
  const [testData, setTestData] = useState('');
  const [retrievedData, setRetrievedData] = useState('');

  const saveData = async () => {
    try {
      await addDoc(collection(db, 'testCollection'), { testData });
      alert('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data: ', error);
    }
  };

  const retrieveData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'testCollection'));
      const data = querySnapshot.docs.map(doc => doc.data().testData).join(', ');
      setRetrievedData(data);
    } catch (error) {
      console.error('Error retrieving data: ', error);
    }
  };

  return (
    <div>
      <Typography variant="h5">Firebase Test</Typography>
      <TextField
        label="Test Data"
        value={testData}
        onChange={(e) => setTestData(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={saveData}>
        Save Data
      </Button>
      <Button variant="contained" color="secondary" onClick={retrieveData}>
        Retrieve Data
      </Button>
      {retrievedData && (
        <Typography variant="body1">Retrieved Data: {retrievedData}</Typography>
      )}
    </div>
  );
};

export default FirebaseTest;
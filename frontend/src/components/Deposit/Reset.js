// src/components/Reset.js

import React from 'react';
import { Button, Typography } from '@mui/material';

function Reset({ onReset }) {
  return (
    <div>
      <Typography variant="h4">Reset Deposit</Typography>
      <Button onClick={onReset}>Reset</Button>
    </div>
  );
}

export default Reset;

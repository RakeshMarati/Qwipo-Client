import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const AddressForm = ({ address, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    address_details: '',
    city: '',
    state: '',
    pin_code: '',
    is_primary: false,
  });

  const [errors, setErrors] = useState({});

  // Load address data if editing
  useEffect(() => {
    if (address) {
      setFormData({
        address_details: address.address_details || '',
        city: address.city || '',
        state: address.state || '',
        pin_code: address.pin_code || '',
        is_primary: address.is_primary || false,
      });
    }
  }, [address]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.address_details.trim()) {
      newErrors.address_details = 'Address details are required';
    } else if (formData.address_details.trim().length < 5) {
      newErrors.address_details = 'Address details must be at least 5 characters';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'City must be at least 2 characters';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    } else if (formData.state.trim().length < 2) {
      newErrors.state = 'State must be at least 2 characters';
    }

    if (!formData.pin_code.trim()) {
      newErrors.pin_code = 'PIN code is required';
    } else {
      const pinRegex = /^[1-9][0-9]{5}$/;
      if (!pinRegex.test(formData.pin_code)) {
        newErrors.pin_code = 'PIN code must be 6 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <TextField
            fullWidth
            label="Address Details"
            multiline
            rows={3}
            value={formData.address_details}
            onChange={(e) => handleChange('address_details', e.target.value)}
            error={!!errors.address_details}
            helperText={errors.address_details}
            placeholder="Enter complete address details..."
            required
          />
        </Grid>
        
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            error={!!errors.city}
            helperText={errors.city}
            required
          />
        </Grid>
        
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="State"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            error={!!errors.state}
            helperText={errors.state}
            required
          />
        </Grid>
        
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="PIN Code"
            value={formData.pin_code}
            onChange={(e) => handleChange('pin_code', e.target.value)}
            error={!!errors.pin_code}
            helperText={errors.pin_code}
            placeholder="6 digits"
            required
          />
        </Grid>
        
        <Grid xs={12} sm={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_primary}
                onChange={(e) => handleChange('is_primary', e.target.checked)}
                color="primary"
              />
            }
            label="Set as Primary Address"
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveIcon />}
        >
          {address ? 'Update Address' : 'Add Address'}
        </Button>
      </Box>
    </Box>
  );
};

export default AddressForm;

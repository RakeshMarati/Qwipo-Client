import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { customerAPI, addressAPI } from '../services/api';

const steps = ['Customer Information', 'Address Information', 'Review & Save'];

const CustomerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
  });

  const [addressData, setAddressData] = useState({
    address_details: '',
    city: '',
    state: '',
    pin_code: '',
    is_primary: true,
  });

  const [errors, setErrors] = useState({});
  const [addressErrors, setAddressErrors] = useState({});

  // Load customer data if editing
  const loadCustomer = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getCustomer(id);
      setFormData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      loadCustomer();
    }
  }, [isEditing, loadCustomer]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone_number.replace(/\s/g, ''))) {
        newErrors.phone_number = 'Invalid phone number format';
      }
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Address validation
  const validateAddress = () => {
    const newAddressErrors = {};

    if (!addressData.address_details.trim()) {
      newAddressErrors.address_details = 'Address details are required';
    }

    if (!addressData.city.trim()) {
      newAddressErrors.city = 'City is required';
    }

    if (!addressData.state.trim()) {
      newAddressErrors.state = 'State is required';
    }

    if (!addressData.pin_code.trim()) {
      newAddressErrors.pin_code = 'PIN code is required';
    } else if (!/^\d{6}$/.test(addressData.pin_code.trim())) {
      newAddressErrors.pin_code = 'PIN code must be 6 digits';
    }

    setAddressErrors(newAddressErrors);
    return Object.keys(newAddressErrors).length === 0;
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle address field changes
  const handleAddressChange = (field, value) => {
    setAddressData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (addressErrors[field]) {
      setAddressErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle next step
  const handleNext = () => {
    if (activeStep === 0) {
      if (validateForm()) {
        setActiveStep(1);
      }
    } else if (activeStep === 1) {
      if (validateAddress()) {
        setActiveStep(2);
      }
    }
  };

  // Handle previous step
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm() || !validateAddress()) {
      setActiveStep(0);
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing) {
        await customerAPI.updateCustomer(id, formData);
        setSnackbar({
          open: true,
          message: 'Customer updated successfully',
          severity: 'success',
        });
      } else {
        // Create customer first
        const customerResponse = await customerAPI.createCustomer(formData);
        const customerId = customerResponse.data.id;
        
        // Then create address
        await addressAPI.addAddress(customerId, addressData);
        
        setSnackbar({
          open: true,
          message: 'Customer and address created successfully',
          severity: 'success',
        });
      }

      // Navigate back to customer list after a short delay
      setTimeout(() => {
        navigate('/customers');
      }, 1500);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to save customer',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Edit Customer' : 'Add New Customer'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/customers')}
        >
          Back to Customers
        </Button>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardContent>
          {activeStep === 0 ? (
            // Step 1: Customer Information
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  error={!!errors.first_name}
                  helperText={errors.first_name}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  error={!!errors.last_name}
                  helperText={errors.last_name}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone_number}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                  error={!!errors.phone_number}
                  helperText={errors.phone_number}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email (Optional)"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
            </Grid>
          ) : activeStep === 1 ? (
            // Step 2: Address Information
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address Details"
                  multiline
                  rows={3}
                  value={addressData.address_details}
                  onChange={(e) => handleAddressChange('address_details', e.target.value)}
                  error={!!addressErrors.address_details}
                  helperText={addressErrors.address_details}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={addressData.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  error={!!addressErrors.city}
                  helperText={addressErrors.city}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  value={addressData.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  error={!!addressErrors.state}
                  helperText={addressErrors.state}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PIN Code"
                  value={addressData.pin_code}
                  onChange={(e) => handleAddressChange('pin_code', e.target.value)}
                  error={!!addressErrors.pin_code}
                  helperText={addressErrors.pin_code}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={addressData.is_primary}
                      onChange={(e) => handleAddressChange('is_primary', e.target.checked)}
                    />
                  }
                  label="Primary Address"
                />
              </Grid>
            </Grid>
          ) : (
            // Step 3: Review
            <Box>
              <Typography variant="h6" gutterBottom>
                Review Customer Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    First Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.first_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.last_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.phone_number}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.email || 'Not provided'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Address Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Address Details
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {addressData.address_details}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    City
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {addressData.city}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    State
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {addressData.state}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    PIN Code
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {addressData.pin_code}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Primary Address
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {addressData.is_primary ? 'Yes' : 'No'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box display="flex" justifyContent="space-between" mt={3}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {saving ? 'Saving...' : (isEditing ? 'Update Customer' : 'Create Customer')}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerForm;

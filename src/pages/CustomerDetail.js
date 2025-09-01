import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { customerAPI, addressAPI } from '../services/api';
import AddressForm from '../components/AddressForm';

const CustomerDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, address: null });
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Load customer and addresses
  const loadCustomerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [customerResponse, addressesResponse] = await Promise.all([
        customerAPI.getCustomer(id),
        addressAPI.getCustomerAddresses(id),
      ]);

      setCustomer(customerResponse.data.data);
      setAddresses(addressesResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  // Handle address deletion
  const handleDeleteAddress = async () => {
    try {
      await addressAPI.deleteAddress(deleteDialog.address.id);
      setSnackbar({
        open: true,
        message: 'Address deleted successfully',
        severity: 'success',
      });
      setDeleteDialog({ open: false, address: null });
      loadCustomerData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to delete address',
        severity: 'error',
      });
    }
  };

  // Handle address form submission
  const handleAddressSubmit = async (addressData) => {
    try {
      if (editingAddress) {
        await addressAPI.updateAddress(editingAddress.id, addressData);
        setSnackbar({
          open: true,
          message: 'Address updated successfully',
          severity: 'success',
        });
      } else {
        await addressAPI.addAddress(id, addressData);
        setSnackbar({
          open: true,
          message: 'Address added successfully',
          severity: 'success',
        });
      }
      setAddressFormOpen(false);
      setEditingAddress(null);
      loadCustomerData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to save address',
        severity: 'error',
      });
    }
  };

  // Open address form for editing
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressFormOpen(true);
  };

  // Open address form for adding new address
  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressFormOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!customer) {
    return (
      <Alert severity="error">
        Customer not found
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Customer Details
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/customers')}
            sx={{ mr: 1 }}
          >
            Back to Customers
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/customers/${id}/edit`)}
          >
            Edit Customer
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Customer Information */}
        <Grid xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Customer Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Customer ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    #{customer.id}
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Address Count
                  </Typography>
                  <Chip
                    label={`${customer.address_count} address${customer.address_count !== 1 ? 'es' : ''}`}
                    color={customer.has_only_one_address ? 'success' : 'primary'}
                    size="small"
                  />
                </Grid>
                <Grid xs={12} lg={6}>
                  <Typography variant="body2" color="text.secondary">
                    First Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {customer.first_name}
                  </Typography>
                </Grid>
                <Grid xs={12} lg={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {customer.last_name}
                  </Typography>
                </Grid>
                <Grid xs={12} lg={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {customer.phone_number}
                  </Typography>
                </Grid>
                <Grid xs={12} lg={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {customer.email || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Created Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(customer.created_at)}
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(customer.updated_at)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Addresses */}
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">
                  Addresses
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddAddress}
                >
                  Add Address
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {addresses.length === 0 ? (
                <Typography color="text.secondary" align="center" py={3}>
                  No addresses found. Add an address to get started.
                </Typography>
              ) : (
                <Box>
                  {addresses.map((address, index) => (
                    <Box key={address.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle2" fontWeight="medium">
                              {address.is_primary ? 'Primary Address' : `Address ${index + 1}`}
                            </Typography>
                            {address.is_primary && (
                              <Chip label="Primary" color="success" size="small" sx={{ ml: 1 }} />
                            )}
                          </Box>
                          <Typography variant="body2" paragraph>
                            {address.address_details}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {address.city}, {address.state} - {address.pin_code}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditAddress(address)}
                            title="Edit Address"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, address })}
                            title="Delete Address"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Address Form Dialog */}
      <Dialog
        open={addressFormOpen}
        onClose={() => {
          setAddressFormOpen(false);
          setEditingAddress(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <AddressForm
            address={editingAddress}
            onSubmit={handleAddressSubmit}
            onCancel={() => {
              setAddressFormOpen(false);
              setEditingAddress(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Address Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, address: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this address? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, address: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteAddress} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default CustomerDetail;

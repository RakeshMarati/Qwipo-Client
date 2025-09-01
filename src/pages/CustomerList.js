import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../services/api';

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, customer: null });

  // Pagination and filters
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [filters, setFilters] = useState({
    search: '',
    city: '',
    state: '',
    pin_code: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  // Load customers
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      };

      const response = await customerAPI.getCustomers(params);
      setCustomers(response.data.data);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
        totalItems: response.data.pagination.totalItems,
      }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      state: '',
      pin_code: '',
      sortBy: 'created_at',
      sortOrder: 'DESC',
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Delete customer
  const handleDelete = async () => {
    try {
      await customerAPI.deleteCustomer(deleteDialog.customer.id);
      setSnackbar({
        open: true,
        message: 'Customer deleted successfully',
        severity: 'success',
      });
      setDeleteDialog({ open: false, customer: null });
      loadCustomers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to delete customer',
        severity: 'error',
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && customers.length === 0) {
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
          Customers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/customers/new')}
        >
          Add Customer
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search & Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} sm={6} lg={3}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Name, phone, email..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} lg={2}>
              <TextField
                fullWidth
                label="City"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </Grid>
            <Grid xs={12} sm={6} lg={2}>
              <TextField
                fullWidth
                label="State"
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
              />
            </Grid>
            <Grid xs={12} sm={6} lg={2}>
              <TextField
                fullWidth
                label="PIN Code"
                value={filters.pin_code}
                onChange={(e) => handleFilterChange('pin_code', e.target.value)}
              />
            </Grid>
            <Grid xs={12} sm={6} lg={1}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Sort By"
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <MenuItem value="first_name">First Name</MenuItem>
                  <MenuItem value="last_name">Last Name</MenuItem>
                  <MenuItem value="phone_number">Phone</MenuItem>
                  <MenuItem value="created_at">Created Date</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} lg={1}>
              <FormControl fullWidth>
                <InputLabel>Order</InputLabel>
                <Select
                  value={filters.sortOrder}
                  label="Order"
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                >
                  <MenuItem value="ASC">Asc</MenuItem>
                  <MenuItem value="DESC">Desc</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} lg={1}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Customers Table */}
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Addresses</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} hover>
                <TableCell>{customer.id}</TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {customer.first_name} {customer.last_name}
                  </Typography>
                </TableCell>
                <TableCell>{customer.phone_number}</TableCell>
                <TableCell>{customer.email || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={`${customer.address_count} address${customer.address_count !== 1 ? 'es' : ''}`}
                    color={customer.has_only_one_address ? 'success' : 'primary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(customer.created_at)}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    title="View Details"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => navigate(`/customers/${customer.id}/edit`)}
                    title="Edit Customer"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => setDeleteDialog({ open: true, customer })}
                    title="Delete Customer"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, customer: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete customer "{deleteDialog.customer?.first_name} {deleteDialog.customer?.last_name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, customer: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
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

export default CustomerList;

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { addressAPI } from '../services/api';

const AddressSearch = () => {
  const [searchParams, setSearchParams] = useState({
    city: '',
    state: '',
    pin_code: '',
  });

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Handle search
  const handleSearch = async () => {
    // Check if at least one parameter is provided
    if (!searchParams.city && !searchParams.state && !searchParams.pin_code) {
      setError('Please provide at least one search parameter');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const response = await addressAPI.searchAddresses(searchParams);
      setAddresses(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchParams({
      city: '',
      state: '',
      pin_code: '',
    });
    setAddresses([]);
    setError(null);
    setHasSearched(false);
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Address Search
        </Typography>
      </Box>

      {/* Search Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search Addresses
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Search for addresses by city, state, or PIN code. At least one parameter is required.
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} sm={6} lg={3}>
              <TextField
                fullWidth
                label="City"
                value={searchParams.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter city name..."
              />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <TextField
                fullWidth
                label="State"
                value={searchParams.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Enter state name..."
              />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <TextField
                fullWidth
                label="PIN Code"
                value={searchParams.pin_code}
                onChange={(e) => handleInputChange('pin_code', e.target.value)}
                placeholder="Enter 6-digit PIN code..."
              />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Search'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearSearch}
                  disabled={loading}
                >
                  Clear
                </Button>
              </Box>
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

      {/* Results */}
      {hasSearched && !loading && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Search Results
              </Typography>
              <Chip
                label={`${(addresses || []).length} address${(addresses || []).length !== 1 ? 'es' : ''} found`}
                color={(addresses || []).length > 0 ? 'success' : 'default'}
              />
            </Box>

            {(addresses || []).length === 0 ? (
              <Typography color="text.secondary" align="center" py={3}>
                No addresses found matching your search criteria.
              </Typography>
            ) : (
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Address Details</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>State</TableCell>
                      <TableCell>PIN Code</TableCell>
                      <TableCell>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(addresses || []).map((address) => (
                      <TableRow key={address.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {address.first_name} {address.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {address.phone_number}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {address.address_details}
                          </Typography>
                        </TableCell>
                        <TableCell>{address.city}</TableCell>
                        <TableCell>{address.state}</TableCell>
                        <TableCell>{address.pin_code}</TableCell>
                        <TableCell>
                          <Chip
                            label={address.is_primary ? 'Primary' : 'Secondary'}
                            color={address.is_primary ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AddressSearch;

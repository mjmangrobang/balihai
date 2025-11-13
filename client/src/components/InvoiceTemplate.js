import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Grid
} from '@mui/material';

const InvoiceTemplate = ({ invoice }) => {
  if (!invoice) return null;

  const residentName = invoice.resident 
    ? `${invoice.resident.firstName} ${invoice.resident.lastName}` 
    : 'Unknown Resident';
    
  const residentAddress = invoice.resident 
    ? `Blk ${invoice.resident.address.block} Lot ${invoice.resident.address.lot} ${invoice.resident.address.street}`
    : '';

  return (
    <Paper elevation={0} sx={{ p: 4, border: '1px solid #ddd' }} id="printable-invoice">
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>BANCOM LIFE HOMEOWNERS' ASSOCIATION, INC.</Typography>
        <Typography variant="body2">San Mateo, Rizal</Typography>
        <Typography variant="h6" sx={{ mt: 2, letterSpacing: 2 }}>OFFICIAL INVOICE</Typography>
      </Box>

      {/* Info Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={8}>
          <Typography variant="subtitle2" color="text.secondary">BILL TO:</Typography>
          <Typography variant="h6">{residentName}</Typography>
          <Typography variant="body2">{residentAddress}</Typography>
        </Grid>
        <Grid item xs={4} sx={{ textAlign: 'right' }}>
          <Typography variant="subtitle2" color="text.secondary">INVOICE NO:</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>#{invoice._id.slice(-6).toUpperCase()}</Typography>
          
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>DUE DATE:</Typography>
          <Typography variant="body1">{new Date(invoice.dueDate).toLocaleDateString()}</Typography>
        </Grid>
      </Grid>

      {/* Details Table */}
      <TableContainer sx={{ mb: 4, border: '1px solid #eee' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Base Item */}
            <TableRow>
              <TableCell>{invoice.description}</TableCell>
              <TableCell align="right">₱{invoice.amount.toLocaleString()}</TableCell>
            </TableRow>
            
            {/* Penalty Row (Only if applicable) */}
            {invoice.penalty > 0 && (
              <TableRow>
                <TableCell sx={{ color: 'error.main' }}>
                  Penalty / Surcharge (Delinquent Status)
                </TableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>
                  ₱{invoice.penalty.toLocaleString()}
                </TableCell>
              </TableRow>
            )}

            {/* Total Row */}
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>TOTAL DUE</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                ₱{invoice.totalAmount.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="caption" display="block" align="center" color="text.secondary">
          This is a system-generated invoice. For questions, please contact the HOA Office.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" display="block" align="center">
          Bancom Life Homeowners' Association System
        </Typography>
      </Box>
    </Paper>
  );
};

export default InvoiceTemplate;
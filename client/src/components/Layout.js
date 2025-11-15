import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
  Toolbar,
  List,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CampaignIcon from '@mui/icons-material/Campaign';
import ReportIcon from '@mui/icons-material/Report'; 
import AssessmentIcon from '@mui/icons-material/Assessment'; 
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const drawerWidth = 260;
const primaryGreen = '#2E7D32'; // Forest Green to match logo

// Mixins for open/closed drawer styles
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: primaryGreen, // --- UPDATED COLOR ---
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const Layout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [open, setOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [anchorEl, setAnchorEl] = useState(null); 

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role;

  const handleDrawerOpen = () => {
    setOpen(true);
    localStorage.setItem('sidebarOpen', JSON.stringify(true));
  };

  const handleDrawerClose = () => {
    setOpen(false);
    localStorage.setItem('sidebarOpen', JSON.stringify(false));
  };
  
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('sidebarOpen'); 
    navigate('/');
  };

  const adminMenu = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Residents', icon: <PeopleIcon />, path: '/residents' },
    { text: 'Billing', icon: <ReceiptLongIcon />, path: '/billing' },
    { text: 'Expenses', icon: <AccountBalanceWalletIcon />, path: '/expenses' },
    { text: 'Announcements', icon: <CampaignIcon />, path: '/announcements' },
    { text: 'Complaints', icon: <ReportIcon />, path: '/complaints' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  ];

  const residentMenu = [
    { text: 'My Dashboard', icon: <DashboardIcon />, path: '/resident-dashboard' },
    { text: 'Announcements', icon: <CampaignIcon />, path: '/announcements' },
    { text: 'File Ticket', icon: <ReportIcon />, path: '/complaints' }, 
  ];

  const menuItems = role === 'admin' || role === 'staff' ? adminMenu : residentMenu;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Top Navbar */}
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            BALIHAI Management System
          </Typography>

          <Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">{user?.name} ({role})</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Collapsible Sidebar */}
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', pl: 1 }}>
                {open && (
                    <img 
                        src="/logo.png" 
                        alt="Logo" 
                        style={{ height: '40px', width: 'auto', marginLeft: '10px' }} 
                    />
                )}
                <IconButton onClick={handleDrawerClose}>
                    {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </Box>
        </DrawerHeader>
        <Divider />
        
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  bgcolor: location.pathname === item.path ? 'action.hover' : 'transparent',
                  borderLeft: location.pathname === item.path ? `4px solid ${primaryGreen}` : '4px solid transparent', // UPDATED
                }}
              >
                <Tooltip title={!open ? item.text : ""} placement="right">
                    <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: location.pathname === item.path ? primaryGreen : 'inherit' // UPDATED
                    }}
                    >
                    {item.icon}
                    </ListItemIcon>
                </Tooltip>
                <ListItemText 
                    primary={item.text} 
                    sx={{ 
                        opacity: open ? 1 : 0,
                        color: location.pathname === item.path ? primaryGreen : 'inherit' // UPDATED
                    }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ mt: 'auto' }} />
        
        <List>
            <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        color: 'error.main'
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                            color: 'error.main'
                        }}
                    >
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
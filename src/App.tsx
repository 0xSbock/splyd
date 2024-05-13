import { useState } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import {
  Box,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Container,
  Grid,
  Paper,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
} from '@mui/material'

import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import PeopleIcon from '@mui/icons-material/People'
import PaidIcon from '@mui/icons-material/Paid'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket'
import AddCardIcon from '@mui/icons-material/AddCard'

import Drawer from './Drawer'
import AppBar from './AppBar'

import { default as UserListImport } from './UserList'
import { default as UserAddImport } from './UserAdd'
import { default as NewExpenseImport } from './newExpense'
import { default as ExpenseListImport } from './ExpenseList'
import { default as PaymentAddImport } from './PaymentAdd'

const Home = <h1>Home</h1>
const UserList = <UserListImport />
const UserAdd = <UserAddImport />
const NewExpense = <NewExpenseImport />
const ExpenseList = <ExpenseListImport />
const PaymentAdd = <PaymentAddImport />

// TODO: remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme()

function App() {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState(Home)
  const toggleDrawer = () => setOpen(!open)

  const speedDialActions = [
    {
      icon: <ShoppingBasketIcon />,
      name: 'Add a new Expense',
      onClick: () => setContent(NewExpense),
    },
    {
      icon: <PersonAddIcon />,
      name: 'Add a new Person',
      onClick: () => setContent(UserAdd),
    },
    {
      icon: <AddCardIcon />,
      name: 'Add a new Payment',
      onClick: () => setContent(PaymentAdd),
    },
  ]
  return (
    <>
      <ThemeProvider theme={defaultTheme}>
        <Box sx={{ display: 'flex' }}>
          <AppBar position="absolute" open={open}>
            <Toolbar
              sx={{
                pr: '24px', // keep right padding when drawer closed
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                  marginRight: '36px',
                  ...(open && { display: 'none' }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                sx={{ flexGrow: 1 }}
              >
                Splyd
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer variant="permanent" open={open}>
            <Toolbar
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: [1],
              }}
            >
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
              <ListItemButton onClick={() => setContent(UserList)}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Users" />
              </ListItemButton>
              <ListItemButton onClick={() => setContent(ExpenseList)}>
                <ListItemIcon>
                  <ShoppingBasketIcon />,
                </ListItemIcon>
                <ListItemText primary="Expenses" />
              </ListItemButton>
              <ListItemButton>
                <ListItemIcon>
                  <PaidIcon />
                </ListItemIcon>
                <ListItemText primary="Payments" />
              </ListItemButton>
            </List>
          </Drawer>
          <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: '100vh',
              overflow: 'auto',
            }}
          >
            <Toolbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper
                    sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
                  >
                    {content}
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>
        <Box sx={{ transform: 'translateZ(0px)', flexGrow: 1 }}>
          <SpeedDial
            ariaLabel="add"
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
          >
            {speedDialActions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.onClick}
              />
            ))}
          </SpeedDial>
        </Box>
      </ThemeProvider>
    </>
  )
}

export default App

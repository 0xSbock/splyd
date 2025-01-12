import { useState, useContext, useEffect } from 'react'

import { isValidAutomergeUrl } from '@automerge/automerge-repo'
import { useDocument, useRepo } from '@automerge/automerge-repo-react-hooks'

import {
  AppBar,
  Box,
  Toolbar,
  List,
  Typography,
  Drawer,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
} from '@mui/material'

import {
  Menu as MenuIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Paid as PaidIcon,
  PersonAdd as PersonAddIcon,
  ShoppingBasket as ShoppingBasketIcon,
  AddCard as AddCardIcon,
} from '@mui/icons-material'
import { Outlet, useNavigate, useParams } from 'react-router'

import { DocUrlContext } from './context'
import TransactionDoc from './transactionDoc'

const drawerWidth = 240

const Menu = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const [docUrl, setDocUrl] = useContext(DocUrlContext)
  const [doc, _changeDoc] = useDocument<TransactionDoc>(docUrl)
  const repo = useRepo()

  const { id } = useParams()
  const navigate = useNavigate()
  const rootDocUrl = `automerge:${id}`

  useEffect(() => {
    if (isValidAutomergeUrl(rootDocUrl)) {
      const doc = repo.find(rootDocUrl)
      if (setDocUrl) {
        setDocUrl(doc?.url)
      }
    } else {
      navigate('/')
    }
  }, [repo, rootDocUrl])

  const handleDrawerClose = () => {
    setIsClosing(true)
    setMobileOpen(false)
  }

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false)
  }

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen)
    }
  }

  const speedDialActions = [
    {
      icon: <ShoppingBasketIcon />,
      name: 'Add a new Expense',
      onClick: () => {
        navigate(`/${id}/expenses/add`)
        setMobileOpen(false)
      },
    },
    {
      icon: <AddCardIcon />,
      name: 'Add a new Payment',
      onClick: () => {
        navigate(`/${id}/payments/add`)
        setMobileOpen(false)
      },
    },
    {
      icon: <PersonAddIcon />,
      name: 'Add a new Person',
      onClick: () => {
        navigate(`/${id}/users/add`)
        setMobileOpen(false)
      },
    },
  ]
  const drawerContent = [
    {
      name: 'Overview',
      label: 'Overview',
      icon: <HomeIcon />,
      onClick: () => {
        navigate(`/${id}`)
        setMobileOpen(false)
      },
    },
    {
      name: 'Users',
      label: 'User List',
      icon: <PeopleIcon />,
      onClick: () => navigate(`/${id}/users`),
    },
    {
      name: 'Expenses',
      label: 'Expense List',
      icon: <ShoppingBasketIcon />,
      onClick: () => navigate(`/${id}/expenses`),
    },
    {
      name: 'Payments',
      label: 'Payment List',
      icon: <PaidIcon />,
      onClick: () => navigate(`/${id}/payments`),
    },
  ]

  const drawer = (
    <>
      <Toolbar />
      <Divider />
      <List component="nav">
        {drawerContent.map((entry) => (
          <ListItemButton
            onClick={entry.onClick}
            key={entry.label}
            aria-label={entry.label}
          >
            <ListItemIcon>{entry.icon}</ListItemIcon>
            <ListItemText primary={entry.name} />
          </ListItemButton>
        ))}
      </List>
    </>
  )
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{
            ml: { sm: `${drawerWidth}px` },
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              sx={{
                mr: '2',
                display: { sm: 'none' },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" noWrap>
              <span>Splyd - {doc?.name}</span>
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="navigation drawer"
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onTransitionEnd={handleDrawerTransitionEnd}
            onClose={handleDrawerClose}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
          }}
        >
          <Toolbar />
          <Box
            sx={{
              paddingLeft: { md: '10%', lg: '15%' },
              paddingRight: { md: '10%', lg: '15%' },
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
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
    </>
  )
}

export default Menu

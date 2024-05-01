import { useState } from 'react'

import { MenuItem } from 'primereact/menuitem'
import { Menubar } from 'primereact/menubar'

const Home = (<h1>Home</h1>)
const Users = (<h1>Users</h1>)
const Transactions = (<h1>Transactions</h1>)

function App() {
  const [component, setComponent] = useState(Home);

  const menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      command: () => setComponent(Home),
    },
    {
      label: 'Users',
      icon: 'pi pi-users',
      command: () => setComponent(Users),
    },
    {
      label: 'Transactions',
      icon: 'pi pi-calculator',
      command: () => setComponent(Transactions),
    },
  ];

  return (
    <>
      <div className="card">
        <Menubar model={menuItems} />
      </div>
      {component}
    </>
  )
}

export default App

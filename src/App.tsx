import { useState } from 'react'
import './App.css'
import NavBar from './main/navbar/navbar'
import { menu } from './types/menutype'

function App() {
  const [curr_menu, set_curr_menu] = useState(menu.dashboard)

  return (
    <div className='size-full'>
      <NavBar menu={curr_menu} change_menu={(new_menu:menu) => set_curr_menu(new_menu)}/>

    </div>
  )
}

export default App

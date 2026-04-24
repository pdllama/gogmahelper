import { useState } from 'react'
import './App.css'
import NavBar from './main/navbar/navbar'
import { menu } from './types/menutype'
import { weapons } from './types/weapons'
import { elements } from './types/element'
import MainWindow from './main/window/mainwindow'

type WindowState = {
  window: menu,
  weapon: (weapons|null),
  element: (elements|null)
}

function App() {
  const [window_state, set_window_state]= useState<WindowState>({window: menu.dashboard, weapon: null, element: null})

  return (
    <div className='size-full flex'>
      <NavBar menu={window_state.window} change_menu={(new_menu:menu) => set_window_state({...window_state, window: new_menu})}/>
      <MainWindow 
        menu={window_state.window} 
        weapon={window_state.weapon} 
        element={window_state.element} 
        changeWeaponCombo={(newWep:weapons, newEle:elements) => {
          set_window_state({...window_state, weapon: newWep, element: newEle})
        }}
      />
    </div>
  )
}

export default App

import './App.css'
import NavBar from './main/navbar/navbar'
import MainWindow from './main/window/mainwindow'
import { useMainStore } from './app/main_store'
import { useEffect } from 'react'
import { initialize_store } from './app/store_initializers'
import { AlertArea } from './app/alerts/alert'



function App() {
  const menu = useMainStore((state) => state.menu)
  const init_stats = useMainStore((state) => state.initialize_state)

  useEffect(() => {
    initialize_store(init_stats);
  }, [])

  return (
    <div className='size-full flex'>
      <NavBar menu={menu}/>
      <MainWindow 
        menu={menu} 
      />
      <AlertArea/>
    </div>
  )
}

export default App

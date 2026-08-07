import './App.css'
import NavBar from './main/navbar/navbar'
import MainWindow from './main/window/mainwindow'
import { useMainStore } from './app/main_store'
import { useEffect } from 'react'
import { initialize_stores } from './app/store_initializers'
import { AlertArea } from './app/alerts/alert'
import { useCaptureStore } from './app/capture_store'



function App() {
  const menu = useMainStore((state) => state.menu)
  const init_stats = useMainStore((state) => state.initialize_state)
  const init_cap_settings = useCaptureStore((state) => state.initialize_capture_store);

  useEffect(() => {
    initialize_stores(init_stats, init_cap_settings);
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

import { Outlet } from 'react-router-dom';

function App() {
  return (
    <>
      {/* Aqui pode colocar navbar ou layout comum */}
      <Outlet />
    </>
  );
}

export default App;
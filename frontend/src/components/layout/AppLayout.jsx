import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchSystems } from '../../store/systemConfigSlice';

export default function AppLayout() {
  const dispatch = useDispatch();
  const { systems } = useSelector((state) => state.systemConfig);

  useEffect(() => {
    dispatch(fetchSystems());
  }, [dispatch]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar systems={systems} />
        <Container fluid className="p-4 flex-grow-1">
          <Outlet />
        </Container>
      </div>
    </div>
  );
}

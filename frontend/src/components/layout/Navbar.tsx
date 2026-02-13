import { Navbar as BsNavbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/authSlice';

export default function Navbar() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container fluid>
        <BsNavbar.Brand as={Link} to="/">
          <i className="bi bi-gear-wide-connected me-2"></i>
          Generic System Builder
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="main-nav" />
        <BsNavbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              active={location.pathname === '/'}
            >
              Dashboard
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/admin/systems"
              active={location.pathname.startsWith('/admin')}
            >
              Admin
            </Nav.Link>
          </Nav>
          <Button variant="outline-light" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}

import { Navbar as BsNavbar, Container, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

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
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}

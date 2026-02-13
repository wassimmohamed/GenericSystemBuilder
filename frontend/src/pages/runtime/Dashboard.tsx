import { useAppSelector } from '../../store/hooks';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Badge } from 'react-bootstrap';

export default function Dashboard() {
  const { systems, loading } = useAppSelector((state) => state.systemConfig);

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>
      <p className="text-muted mb-4">
        Welcome to the Generic System Builder. Select a system to view or go to
        the Admin panel to configure systems.
      </p>

      <Row xs={1} md={2} lg={3} className="g-4">
        {systems.map((sys) => (
          <Col key={sys.systemKey}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>
                  {sys.icon && <span className="me-2">{sys.icon}</span>}
                  {sys.title}
                </Card.Title>
                <Card.Text>{sys.description}</Card.Text>
                <div>
                  <Badge bg="info" className="me-1">
                    v{sys.version}
                  </Badge>
                  <Badge bg="secondary">
                    {sys.pageCount} page{sys.pageCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </Card.Body>
              <Card.Footer>
                <Link
                  to={`/systems/${sys.systemKey}`}
                  className="btn btn-primary btn-sm w-100"
                >
                  Open System
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {systems.length === 0 && !loading && (
        <div className="text-center py-5 text-muted">
          <h5>No Systems Available</h5>
          <p>
            Go to the{' '}
            <Link to="/admin/systems">Admin Panel</Link> to create a system.
          </p>
        </div>
      )}
    </div>
  );
}

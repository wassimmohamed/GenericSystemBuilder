import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchSystems, deleteSystem } from '../../store/systemConfigSlice';

export default function SystemList() {
  const dispatch = useAppDispatch();
  const { systems, loading, error } = useAppSelector((state) => state.systemConfig);

  useEffect(() => {
    dispatch(fetchSystems());
  }, [dispatch]);

  const handleDelete = (systemKey) => {
    if (window.confirm(`Delete system "${systemKey}"? This will deactivate all versions.`)) {
      dispatch(deleteSystem(systemKey));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>System Configurations</h2>
        <Link to="/admin/systems/new">
          <Button variant="primary">+ New System</Button>
        </Link>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row xs={1} md={2} lg={3} className="g-4">
        {systems.map((sys) => (
          <Col key={sys.systemKey}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>
                  {sys.icon && <span className="me-2">{sys.icon}</span>}
                  {sys.title}
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {sys.systemKey}
                </Card.Subtitle>
                <Card.Text>{sys.description}</Card.Text>
                <div className="mb-2">
                  <Badge bg="info" className="me-1">
                    v{sys.version}
                  </Badge>
                  <Badge bg="secondary">
                    {sys.pageCount} page{sys.pageCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </Card.Body>
              <Card.Footer className="d-flex gap-2">
                <Link to={`/admin/systems/${sys.systemKey}`} className="flex-grow-1">
                  <Button variant="outline-primary" size="sm" className="w-100">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(sys.systemKey)}
                >
                  Delete
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {systems.length === 0 && !loading && (
        <Alert variant="info">
          No systems configured yet. Click &quot;+ New System&quot; to create one.
        </Alert>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Alert,
  Accordion,
  ListGroup,
  Badge,
} from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchSystemByKey,
  createSystem,
  updateSystem,
  clearCurrentSystem,
} from '../../store/systemConfigSlice';
import PageBuilder from './PageBuilder';
import type {
  SystemConfigDataDto,
  SystemConfigurationResponseDto,
  PageConfigDto,
  PermissionConfigDto,
} from '../../types';

const EMPTY_SYSTEM: SystemConfigDataDto = {
  icon: '',
  title: '',
  titleAr: '',
  description: '',
  pages: [],
  permissions: [],
};

interface SystemBuilderInnerProps {
  currentSystem: SystemConfigurationResponseDto | null;
  isNew: boolean;
  error: string | null;
}

function SystemBuilderInner({ currentSystem, isNew, error: reduxError }: SystemBuilderInnerProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { systemKey } = useParams();

  const [key, setKey] = useState(
    currentSystem && !isNew ? currentSystem.systemKey : ''
  );
  const [config, setConfig] = useState<SystemConfigDataDto>(
    currentSystem && !isNew ? currentSystem.configuration : EMPTY_SYSTEM
  );
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleConfigChange = (field: keyof SystemConfigDataDto, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePage = useCallback(
    (pageData: PageConfigDto) => {
      setConfig((prev) => {
        const pages = [...prev.pages];
        const idx = pages.findIndex((p) => p.pageKey === pageData.pageKey);
        if (idx >= 0) {
          pages[idx] = pageData;
        } else {
          pages.push(pageData);
        }
        return { ...prev, pages };
      });
      setEditingPage(null);
    },
    []
  );

  const handleRemovePage = (pageKey: string) => {
    setConfig((prev) => ({
      ...prev,
      pages: prev.pages.filter((p) => p.pageKey !== pageKey),
    }));
  };

  const handleAddPermission = () => {
    setConfig((prev) => ({
      ...prev,
      permissions: [
        ...prev.permissions,
        { userId: '', role: 'User', accessiblePages: [] },
      ],
    }));
  };

  const handlePermissionChange = (idx: number, field: keyof PermissionConfigDto, value: any) => {
    setConfig((prev) => {
      const perms = [...prev.permissions];
      perms[idx] = { ...perms[idx], [field]: value };
      return { ...prev, permissions: perms };
    });
  };

  const handleRemovePermission = (idx: number) => {
    setConfig((prev) => ({
      ...prev,
      permissions: prev.permissions.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    try {
      if (isNew) {
        await dispatch(
          createSystem({
            systemKey: key,
            configuration: config,
            createdBy: 'admin',
          })
        ).unwrap();
      } else {
        await dispatch(
          updateSystem({
            key: systemKey,
            data: { configuration: config, updatedBy: 'admin' },
          })
        ).unwrap();
      }
      navigate('/admin/systems');
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save system');
    }
  };

  if (editingPage !== null) {
    const existingPage =
      editingPage === '__new__'
        ? null
        : config.pages.find((p) => p.pageKey === editingPage) ?? null;
    return (
      <PageBuilder
        page={existingPage}
        onSave={handleSavePage}
        onCancel={() => setEditingPage(null)}
      />
    );
  }

  return (
    <div>
      <h2 className="mb-4">{isNew ? 'Create New System' : `Edit System: ${systemKey}`}</h2>
      {(reduxError || saveError) && (
        <Alert variant="danger">{reduxError || saveError}</Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <Card.Header>Basic Information</Card.Header>
          <Card.Body>
            <Row>
              {isNew && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>System Key</Form.Label>
                    <Form.Control
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      placeholder="e.g. employee-management"
                      required
                      pattern="^[a-zA-Z0-9_-]+$"
                    />
                    <Form.Text className="text-muted">
                      Letters, numbers, hyphens and underscores only
                    </Form.Text>
                  </Form.Group>
                </Col>
              )}
              <Col md={isNew ? 6 : 4}>
                <Form.Group className="mb-3">
                  <Form.Label>Icon</Form.Label>
                  <Form.Control
                    value={config.icon}
                    onChange={(e) => handleConfigChange('icon', e.target.value)}
                    placeholder="🏢 or icon class"
                  />
                </Form.Group>
              </Col>
              <Col md={isNew ? 6 : 4}>
                <Form.Group className="mb-3">
                  <Form.Label>Title (English)</Form.Label>
                  <Form.Control
                    value={config.title}
                    onChange={(e) => handleConfigChange('title', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={isNew ? 6 : 4}>
                <Form.Group className="mb-3">
                  <Form.Label>Title (Arabic)</Form.Label>
                  <Form.Control
                    value={config.titleAr}
                    onChange={(e) => handleConfigChange('titleAr', e.target.value)}
                    dir="rtl"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={config.description}
                    onChange={(e) =>
                      handleConfigChange('description', e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>Pages</span>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setEditingPage('__new__')}
            >
              + Add Page
            </Button>
          </Card.Header>
          <Card.Body>
            {config.pages.length === 0 ? (
              <p className="text-muted">No pages configured yet.</p>
            ) : (
              <ListGroup>
                {config.pages.map((page) => (
                  <ListGroup.Item
                    key={page.pageKey}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{page.title}</strong>{' '}
                      <Badge bg="secondary">{page.pageKey}</Badge>
                      {page.form && (
                        <Badge bg="info" className="ms-1">
                          Form: {page.form.fields?.length || 0} fields
                        </Badge>
                      )}
                      {page.exportCollections?.length > 0 && (
                        <Badge bg="success" className="ms-1">
                          {page.exportCollections.length} collection(s)
                        </Badge>
                      )}
                    </div>
                    <div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => setEditingPage(page.pageKey)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemovePage(page.pageKey)}
                      >
                        Remove
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>Permissions</span>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleAddPermission}
            >
              + Add Permission
            </Button>
          </Card.Header>
          <Card.Body>
            <Accordion>
              {config.permissions.map((perm, idx) => (
                <Accordion.Item key={idx} eventKey={String(idx)}>
                  <Accordion.Header>
                    {perm.userId || 'New Permission'} — {perm.role}
                  </Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>User ID</Form.Label>
                          <Form.Control
                            value={perm.userId}
                            onChange={(e) =>
                              handlePermissionChange(idx, 'userId', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Role</Form.Label>
                          <Form.Select
                            value={perm.role}
                            onChange={(e) =>
                              handlePermissionChange(idx, 'role', e.target.value)
                            }
                          >
                            <option value="Admin">Admin</option>
                            <option value="User">User</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Accessible Pages</Form.Label>
                          <Form.Select
                            multiple
                            value={perm.accessiblePages}
                            onChange={(e) =>
                              handlePermissionChange(
                                idx,
                                'accessiblePages',
                                Array.from(
                                  e.target.selectedOptions,
                                  (o) => o.value
                                )
                              )
                            }
                          >
                            {config.pages.map((p) => (
                              <option key={p.pageKey} value={p.pageKey}>
                                {p.title}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemovePermission(idx)}
                    >
                      Remove Permission
                    </Button>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
            {config.permissions.length === 0 && (
              <p className="text-muted">No permissions configured yet.</p>
            )}
          </Card.Body>
        </Card>

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">
            {isNew ? 'Create System' : 'Save Changes (New Version)'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/systems')}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default function SystemBuilder() {
  const { systemKey } = useParams();
  const isNew = !systemKey;
  const dispatch = useAppDispatch();
  const { currentSystem, error } = useAppSelector((s) => s.systemConfig);

  useEffect(() => {
    if (!isNew) {
      dispatch(fetchSystemByKey(systemKey));
    }
    return () => dispatch(clearCurrentSystem());
  }, [dispatch, systemKey, isNew]);

  // Use version as key to re-mount inner component when data loads
  const version = currentSystem?.version ?? 0;
  const renderKey = isNew ? 'new' : `${systemKey}-${version}`;

  // Only render inner component once data is loaded (or for new systems)
  if (!isNew && !currentSystem) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <SystemBuilderInner
      key={renderKey}
      currentSystem={currentSystem}
      isNew={isNew}
      error={error}
    />
  );
}

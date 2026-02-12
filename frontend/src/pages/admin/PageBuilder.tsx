import { useState } from 'react';
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  ListGroup,
  Badge,
} from 'react-bootstrap';
import FieldBuilder from './FieldBuilder';
import type { PageConfigDto, FieldConfigDto } from '../../types';

const EMPTY_PAGE: PageConfigDto = {
  pageKey: '',
  title: '',
  titleAr: '',
  form: { title: '', fields: [] },
  list: {
    displayFields: [],
    enableSearch: true,
    enablePagination: true,
    pageSize: 10,
    defaultSortField: '',
    defaultSortDirection: 'asc',
  },
  exportCollections: [],
  permissions: {
    listAccess: [],
    createAccess: [],
    editAccess: [],
    deleteAccess: [],
  },
};

interface PageBuilderProps {
  page: PageConfigDto | null;
  onSave: (page: PageConfigDto) => void;
  onCancel: () => void;
}

export default function PageBuilder({ page, onSave, onCancel }: PageBuilderProps) {
  const isNew = !page;
  const [config, setConfig] = useState<PageConfigDto>(page || EMPTY_PAGE);
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormChange = (field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      form: { ...prev.form, [field]: value },
    }));
  };

  const handleListChange = (field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      list: { ...prev.list, [field]: value },
    }));
  };

  const handleSaveField = (fieldData: FieldConfigDto) => {
    setConfig((prev) => {
      const fields = [...(prev.form?.fields || [])];
      const idx = fields.findIndex((f) => f.fieldKey === fieldData.fieldKey);
      if (idx >= 0) {
        fields[idx] = fieldData;
      } else {
        fields.push({ ...fieldData, order: fields.length });
      }
      return { ...prev, form: { ...prev.form, fields } };
    });
    setEditingField(null);
  };

  const handleRemoveField = (fieldKey: string) => {
    setConfig((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        fields: prev.form.fields.filter((f) => f.fieldKey !== fieldKey),
      },
    }));
  };

  const handleAddCollection = () => {
    setConfig((prev) => ({
      ...prev,
      exportCollections: [
        ...prev.exportCollections,
        { collectionName: '', fields: [] },
      ],
    }));
  };

  const handleCollectionChange = (idx: number, field: string, value: any) => {
    setConfig((prev) => {
      const cols = [...prev.exportCollections];
      cols[idx] = { ...cols[idx], [field]: value };
      return { ...prev, exportCollections: cols };
    });
  };

  const handleRemoveCollection = (idx: number) => {
    setConfig((prev) => ({
      ...prev,
      exportCollections: prev.exportCollections.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  if (editingField !== null) {
    const existingField =
      editingField === '__new__'
        ? null
        : config.form?.fields?.find((f) => f.fieldKey === editingField);
    return (
      <FieldBuilder
        field={existingField}
        onSave={handleSaveField}
        onCancel={() => setEditingField(null)}
      />
    );
  }

  const fieldKeys = config.form?.fields?.map((f) => f.fieldKey) || [];

  return (
    <div>
      <h3 className="mb-4">
        {isNew ? 'Add Page' : `Edit Page: ${config.title}`}
      </h3>

      <Form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <Card.Header>Page Info</Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Page Key</Form.Label>
                  <Form.Control
                    value={config.pageKey}
                    onChange={(e) => handleChange('pageKey', e.target.value)}
                    required
                    disabled={!isNew}
                    pattern="^[a-zA-Z0-9_-]+$"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    value={config.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Title (Arabic)</Form.Label>
                  <Form.Control
                    value={config.titleAr}
                    onChange={(e) => handleChange('titleAr', e.target.value)}
                    dir="rtl"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>Form Fields</span>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setEditingField('__new__')}
            >
              + Add Field
            </Button>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Form Title</Form.Label>
              <Form.Control
                value={config.form?.title || ''}
                onChange={(e) => handleFormChange('title', e.target.value)}
              />
            </Form.Group>
            {(config.form?.fields || []).length === 0 ? (
              <p className="text-muted">No fields configured yet.</p>
            ) : (
              <ListGroup>
                {(config.form?.fields || [])
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                    <ListGroup.Item
                      key={field.fieldKey}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{field.label}</strong>{' '}
                        <Badge bg="secondary">{field.fieldKey}</Badge>{' '}
                        <Badge bg="info">{field.fieldType}</Badge>
                        {field.validation?.required && (
                          <Badge bg="warning" text="dark" className="ms-1">
                            Required
                          </Badge>
                        )}
                      </div>
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => setEditingField(field.fieldKey)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveField(field.fieldKey)}
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
          <Card.Header>List Configuration</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Display Fields</Form.Label>
                  <Form.Select
                    multiple
                    value={config.list?.displayFields || []}
                    onChange={(e) =>
                      handleListChange(
                        'displayFields',
                        Array.from(e.target.selectedOptions, (o) => o.value)
                      )
                    }
                  >
                    {fieldKeys.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Page Size</Form.Label>
                  <Form.Control
                    type="number"
                    value={config.list?.pageSize || 10}
                    onChange={(e) =>
                      handleListChange('pageSize', parseInt(e.target.value, 10))
                    }
                    min={1}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Check
                  className="mt-4"
                  type="checkbox"
                  label="Enable Search"
                  checked={config.list?.enableSearch ?? true}
                  onChange={(e) =>
                    handleListChange('enableSearch', e.target.checked)
                  }
                />
                <Form.Check
                  type="checkbox"
                  label="Enable Pagination"
                  checked={config.list?.enablePagination ?? true}
                  onChange={(e) =>
                    handleListChange('enablePagination', e.target.checked)
                  }
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>Export Collections</span>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleAddCollection}
            >
              + Add Collection
            </Button>
          </Card.Header>
          <Card.Body>
            {config.exportCollections.length === 0 ? (
              <p className="text-muted">No export collections configured.</p>
            ) : (
              config.exportCollections.map((col, idx) => (
                <Card key={idx} className="mb-2">
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Collection Name</Form.Label>
                          <Form.Control
                            value={col.collectionName}
                            onChange={(e) =>
                              handleCollectionChange(
                                idx,
                                'collectionName',
                                e.target.value
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Fields</Form.Label>
                          <Form.Select
                            multiple
                            value={col.fields}
                            onChange={(e) =>
                              handleCollectionChange(
                                idx,
                                'fields',
                                Array.from(
                                  e.target.selectedOptions,
                                  (o) => o.value
                                )
                              )
                            }
                          >
                            {fieldKeys.map((k) => (
                              <option key={k} value={k}>
                                {k}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2} className="d-flex align-items-end mb-2">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveCollection(idx)}
                        >
                          Remove
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))
            )}
          </Card.Body>
        </Card>

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">
            Save Page
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}

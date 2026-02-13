import { useState } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import type { FieldConfigDto } from '../../types';

const FIELD_TYPES = [
  'Text',
  'Password',
  'Number',
  'Date',
  'DateTime',
  'TextArea',
  'Slider',
  'Radio',
  'Checkbox',
  'MultiSelect',
  'Autocomplete',
  'MultiSelectAutocomplete',
];

const EMPTY_FIELD: FieldConfigDto = {
  fieldKey: '',
  label: '',
  labelAr: '',
  fieldType: 'Text',
  defaultValue: '',
  placeholder: '',
  options: [],
  autocompleteConfig: null,
  sliderConfig: null,
  validation: {
    required: false,
    minLength: null,
    maxLength: null,
    min: null,
    max: null,
    unique: false,
    regex: '',
    regexMessage: '',
    disabledOnEdit: false,
    customRules: [],
  },
  permission: { viewUsers: [], editUsers: [] },
  order: 0,
};

interface FieldBuilderProps {
  field: FieldConfigDto | null;
  onSave: (field: FieldConfigDto) => void;
  onCancel: () => void;
}

export default function FieldBuilder({ field, onSave, onCancel }: FieldBuilderProps) {
  const isNew = !field;
  const [config, setConfig] = useState<FieldConfigDto>(field || EMPTY_FIELD);

  const handleChange = (path: string, value: any) => {
    setConfig((prev) => {
      const parts = path.split('.');
      if (parts.length === 1) {
        return { ...prev, [path]: value };
      }
      const updated = { ...prev };
      let obj = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...obj[parts[i]] };
        obj = obj[parts[i]];
      }
      obj[parts.at(-1)] = value;
      return updated;
    });
  };

  // Simpler nested setter
  const setValidation = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      validation: { ...prev.validation, [key]: value },
    }));
  };

  const setSliderConfig = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      sliderConfig: { ...(prev.sliderConfig || { min: 0, max: 100, step: 1 }), [key]: value },
    }));
  };

  const setAutocompleteConfig = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      autocompleteConfig: {
        ...(prev.autocompleteConfig || {
          sourceType: 'Static',
          collectionRef: '',
          displayField: '',
          valueField: '',
          staticOptions: [],
        }),
        [key]: value,
      },
    }));
  };

  const handleAddOption = () => {
    setConfig((prev) => ({
      ...prev,
      options: [...(prev.options || []), { value: '', label: '', labelAr: '' }],
    }));
  };

  const handleOptionChange = (idx: number, key: string, value: string) => {
    setConfig((prev) => {
      const options = [...(prev.options || [])];
      options[idx] = { ...options[idx], [key]: value };
      return { ...prev, options };
    });
  };

  const handleRemoveOption = (idx: number) => {
    setConfig((prev) => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  const needsOptions = ['Radio', 'MultiSelect'].includes(config.fieldType);
  const needsSlider = config.fieldType === 'Slider';
  const needsAutocomplete = ['Autocomplete', 'MultiSelectAutocomplete'].includes(config.fieldType);

  return (
    <div>
      <h4 className="mb-4">
        {isNew ? 'Add Field' : `Edit Field: ${config.label}`}
      </h4>

      <Form onSubmit={handleSubmit}>
        <Card className="mb-3">
          <Card.Header>Field Info</Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Field Key</Form.Label>
                  <Form.Control
                    value={config.fieldKey}
                    onChange={(e) => handleChange('fieldKey', e.target.value)}
                    required
                    disabled={!isNew}
                    pattern="^[a-zA-Z0-9_-]+$"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Label</Form.Label>
                  <Form.Control
                    value={config.label}
                    onChange={(e) => handleChange('label', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Label (Arabic)</Form.Label>
                  <Form.Control
                    value={config.labelAr}
                    onChange={(e) => handleChange('labelAr', e.target.value)}
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Field Type</Form.Label>
                  <Form.Select
                    value={config.fieldType}
                    onChange={(e) => handleChange('fieldType', e.target.value)}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Placeholder</Form.Label>
                  <Form.Control
                    value={config.placeholder || ''}
                    onChange={(e) => handleChange('placeholder', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Default Value</Form.Label>
                  <Form.Control
                    value={config.defaultValue || ''}
                    onChange={(e) =>
                      handleChange('defaultValue', e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Order</Form.Label>
                  <Form.Control
                    type="number"
                    value={config.order}
                    onChange={(e) =>
                      handleChange('order', parseInt(e.target.value, 10))
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-3">
          <Card.Header>Validation</Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Check
                  type="checkbox"
                  label="Required"
                  checked={config.validation?.required || false}
                  onChange={(e) => setValidation('required', e.target.checked)}
                  className="mb-3"
                />
              </Col>
              <Col md={3}>
                <Form.Check
                  type="checkbox"
                  label="Unique"
                  checked={config.validation?.unique || false}
                  onChange={(e) => setValidation('unique', e.target.checked)}
                  className="mb-3"
                />
              </Col>
              <Col md={3}>
                <Form.Check
                  type="checkbox"
                  label="Disabled on Edit"
                  checked={config.validation?.disabledOnEdit || false}
                  onChange={(e) =>
                    setValidation('disabledOnEdit', e.target.checked)
                  }
                  className="mb-3"
                />
              </Col>
            </Row>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Min Length</Form.Label>
                  <Form.Control
                    type="number"
                    value={config.validation?.minLength ?? ''}
                    onChange={(e) =>
                      setValidation(
                        'minLength',
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Length</Form.Label>
                  <Form.Control
                    type="number"
                    value={config.validation?.maxLength ?? ''}
                    onChange={(e) =>
                      setValidation(
                        'maxLength',
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Min Value</Form.Label>
                  <Form.Control
                    type="number"
                    value={config.validation?.min ?? ''}
                    onChange={(e) =>
                      setValidation(
                        'min',
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Value</Form.Label>
                  <Form.Control
                    type="number"
                    value={config.validation?.max ?? ''}
                    onChange={(e) =>
                      setValidation(
                        'max',
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Regex Pattern</Form.Label>
                  <Form.Control
                    value={config.validation?.regex || ''}
                    onChange={(e) => setValidation('regex', e.target.value)}
                    placeholder="e.g. ^[A-Z]{2,5}$"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Regex Error Message</Form.Label>
                  <Form.Control
                    value={config.validation?.regexMessage || ''}
                    onChange={(e) =>
                      setValidation('regexMessage', e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {needsOptions && (
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Options</span>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleAddOption}
              >
                + Add Option
              </Button>
            </Card.Header>
            <Card.Body>
              {(config.options || []).map((opt, idx) => (
                <Row key={idx} className="mb-2">
                  <Col>
                    <Form.Control
                      placeholder="Value"
                      value={opt.value}
                      onChange={(e) =>
                        handleOptionChange(idx, 'value', e.target.value)
                      }
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      placeholder="Label"
                      value={opt.label}
                      onChange={(e) =>
                        handleOptionChange(idx, 'label', e.target.value)
                      }
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      placeholder="Label (Arabic)"
                      value={opt.labelAr || ''}
                      onChange={(e) =>
                        handleOptionChange(idx, 'labelAr', e.target.value)
                      }
                      dir="rtl"
                    />
                  </Col>
                  <Col xs="auto">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveOption(idx)}
                    >
                      ✕
                    </Button>
                  </Col>
                </Row>
              ))}
              {(config.options || []).length === 0 && (
                <p className="text-muted">No options added.</p>
              )}
            </Card.Body>
          </Card>
        )}

        {needsSlider && (
          <Card className="mb-3">
            <Card.Header>Slider Configuration</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Min</Form.Label>
                    <Form.Control
                      type="number"
                      value={config.sliderConfig?.min ?? 0}
                      onChange={(e) =>
                        setSliderConfig('min', parseFloat(e.target.value))
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Max</Form.Label>
                    <Form.Control
                      type="number"
                      value={config.sliderConfig?.max ?? 100}
                      onChange={(e) =>
                        setSliderConfig('max', parseFloat(e.target.value))
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Step</Form.Label>
                    <Form.Control
                      type="number"
                      value={config.sliderConfig?.step ?? 1}
                      onChange={(e) =>
                        setSliderConfig('step', parseFloat(e.target.value))
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {needsAutocomplete && (
          <Card className="mb-3">
            <Card.Header>Autocomplete Configuration</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Source Type</Form.Label>
                    <Form.Select
                      value={config.autocompleteConfig?.sourceType || 'Static'}
                      onChange={(e) =>
                        setAutocompleteConfig('sourceType', e.target.value)
                      }
                    >
                      <option value="Static">Static</option>
                      <option value="ExportCollection">Collection Reference</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                {(config.autocompleteConfig?.sourceType === 'ExportCollection' || config.autocompleteConfig?.sourceType === 'Collection') && (
                  <>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Collection Reference</Form.Label>
                        <Form.Control
                          value={config.autocompleteConfig?.collectionRef || ''}
                          onChange={(e) =>
                            setAutocompleteConfig(
                              'collectionRef',
                              e.target.value
                            )
                          }
                          placeholder="systemKey.pageKey.collectionName"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>Display Field</Form.Label>
                        <Form.Control
                          value={config.autocompleteConfig?.displayField || ''}
                          onChange={(e) =>
                            setAutocompleteConfig(
                              'displayField',
                              e.target.value
                            )
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>Value Field</Form.Label>
                        <Form.Control
                          value={config.autocompleteConfig?.valueField || ''}
                          onChange={(e) =>
                            setAutocompleteConfig('valueField', e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                  </>
                )}
              </Row>
            </Card.Body>
          </Card>
        )}

        <Card className="mb-3">
          <Card.Header>Field Permissions</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>View Users (comma-separated)</Form.Label>
                  <Form.Control
                    value={config.permission?.viewUsers?.join(', ') || ''}
                    onChange={(e) =>
                      handleChange('permission', {
                        ...config.permission,
                        viewUsers: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Leave empty for all users"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Edit Users (comma-separated)</Form.Label>
                  <Form.Control
                    value={config.permission?.editUsers?.join(', ') || ''}
                    onChange={(e) =>
                      handleChange('permission', {
                        ...config.permission,
                        editUsers: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Leave empty for all users"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">
            Save Field
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import DynamicField from './fields/DynamicField';

function validateField(field, value) {
  const v = field.validation;
  if (!v) return null;

  if (v.required && (value === undefined || value === null || value === '')) {
    return `${field.label} is required`;
  }
  if (v.minLength && typeof value === 'string' && value.length < v.minLength) {
    return `${field.label} must be at least ${v.minLength} characters`;
  }
  if (v.maxLength && typeof value === 'string' && value.length > v.maxLength) {
    return `${field.label} must not exceed ${v.maxLength} characters`;
  }
  if (v.min !== null && v.min !== undefined && Number(value) < v.min) {
    return `${field.label} must be at least ${v.min}`;
  }
  if (v.max !== null && v.max !== undefined && Number(value) > v.max) {
    return `${field.label} must not exceed ${v.max}`;
  }
  if (v.regex && typeof value === 'string' && value) {
    const re = new RegExp(v.regex);
    if (!re.test(value)) {
      return v.regexMessage || `${field.label} format is invalid`;
    }
  }
  return null;
}

export default function DynamicForm({
  formConfig,
  onSubmit,
  initialValues = {},
  isEdit = false,
  userId,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const visibleFields = useMemo(() => {
    if (!formConfig?.fields) return [];
    return formConfig.fields
      .filter((f) => {
        if (!f.permission || !f.permission.viewUsers?.length) return true;
        return f.permission.viewUsers.includes(userId);
      })
      .sort((a, b) => a.order - b.order);
  }, [formConfig, userId]);

  const handleChange = (fieldKey, value) => {
    setValues((prev) => ({ ...prev, [fieldKey]: value }));
    setErrors((prev) => ({ ...prev, [fieldKey]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError(null);

    const newErrors = {};
    visibleFields.forEach((field) => {
      const err = validateField(field, values[field.fieldKey]);
      if (err) newErrors[field.fieldKey] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit?.(values);
  };

  if (!formConfig) return null;

  return (
    <Form onSubmit={handleSubmit}>
      {submitError && <Alert variant="danger">{submitError}</Alert>}
      <h5 className="mb-3">{formConfig.title}</h5>
      <Row>
        {visibleFields.map((field) => {
          const canEdit =
            !field.permission?.editUsers?.length ||
            field.permission.editUsers.includes(userId);
          return (
            <Col md={6} key={field.fieldKey}>
              <DynamicField
                field={{
                  ...field,
                  validation: {
                    ...field.validation,
                    disabledOnEdit: canEdit
                      ? field.validation?.disabledOnEdit
                      : true,
                  },
                }}
                value={values[field.fieldKey]}
                onChange={handleChange}
                isEdit={isEdit}
                errors={errors}
              />
            </Col>
          );
        })}
      </Row>
      <Button type="submit" variant="primary">
        {isEdit ? 'Update' : 'Create'}
      </Button>
    </Form>
  );
}

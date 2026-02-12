import { Form } from 'react-bootstrap';

export default function DynamicField({ field, value, onChange, isEdit = false, errors = {} }) {
  const {
    fieldKey,
    label,
    fieldType,
    placeholder,
    options,
    autocompleteConfig,
    sliderConfig,
    validation,
  } = field;

  const isDisabled = isEdit && validation?.disabledOnEdit;
  const isRequired = validation?.required;
  const error = errors[fieldKey];

  const handleChange = (e) => {
    const val =
      fieldType === 'Checkbox'
        ? e.target.checked
        : fieldType === 'MultiSelect' || fieldType === 'MultiSelectAutocomplete'
          ? Array.from(e.target.selectedOptions, (o) => o.value)
          : e.target.value;
    onChange(fieldKey, val);
  };

  const commonProps = {
    id: fieldKey,
    disabled: isDisabled,
    isInvalid: !!error,
  };

  const renderField = () => {
    switch (fieldType) {
      case 'Text':
      case 'Password':
      case 'Number':
      case 'Date':
      case 'DateTime':
        return (
          <Form.Control
            type={
              fieldType === 'DateTime'
                ? 'datetime-local'
                : fieldType.toLowerCase()
            }
            placeholder={placeholder}
            value={value || ''}
            onChange={handleChange}
            {...commonProps}
          />
        );

      case 'TextArea':
        return (
          <Form.Control
            as="textarea"
            rows={3}
            placeholder={placeholder}
            value={value || ''}
            onChange={handleChange}
            {...commonProps}
          />
        );

      case 'Slider':
        return (
          <div>
            <Form.Range
              min={sliderConfig?.min || 0}
              max={sliderConfig?.max || 100}
              step={sliderConfig?.step || 1}
              value={value || sliderConfig?.min || 0}
              onChange={handleChange}
              {...commonProps}
            />
            <small className="text-muted">Value: {value || sliderConfig?.min || 0}</small>
          </div>
        );

      case 'Radio':
        return (
          <div>
            {(options || []).map((opt) => (
              <Form.Check
                key={opt.value}
                type="radio"
                name={fieldKey}
                label={opt.label}
                value={opt.value}
                checked={value === opt.value}
                onChange={handleChange}
                disabled={isDisabled}
              />
            ))}
          </div>
        );

      case 'Checkbox':
        return (
          <Form.Check
            type="checkbox"
            label={label}
            checked={!!value}
            onChange={handleChange}
            disabled={isDisabled}
          />
        );

      case 'MultiSelect':
        return (
          <Form.Select
            multiple
            value={value || []}
            onChange={handleChange}
            {...commonProps}
          >
            {(options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        );

      case 'Autocomplete':
      case 'MultiSelectAutocomplete': {
        const acOptions =
          autocompleteConfig?.sourceType === 'Static'
            ? autocompleteConfig?.staticOptions || []
            : options || [];
        const isMulti = fieldType === 'MultiSelectAutocomplete';
        return (
          <Form.Select
            multiple={isMulti}
            value={isMulti ? value || [] : value || ''}
            onChange={handleChange}
            {...commonProps}
          >
            {!isMulti && <option value="">Select...</option>}
            {acOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        );
      }

      default:
        return (
          <Form.Control
            type="text"
            placeholder={placeholder}
            value={value || ''}
            onChange={handleChange}
            {...commonProps}
          />
        );
    }
  };

  return (
    <Form.Group className="mb-3" controlId={fieldKey}>
      {fieldType !== 'Checkbox' && (
        <Form.Label>
          {label}
          {isRequired && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}
      {renderField()}
      {error && (
        <Form.Control.Feedback type="invalid" className="d-block">
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
}

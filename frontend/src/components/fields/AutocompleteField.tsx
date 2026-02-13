import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Form, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { dataEntryApi } from '../../api/systemConfigApi';
import type { AutocompleteConfigDto, FieldOptionDto } from '../../types';

interface AutocompleteFieldProps {
  fieldKey: string;
  value: any;
  onChange: (fieldKey: string, value: any) => void;
  autocompleteConfig?: AutocompleteConfigDto;
  staticOptions?: FieldOptionDto[];
  isMulti?: boolean;
  disabled?: boolean;
  isInvalid?: boolean;
  placeholder?: string;
}

interface OptionItem {
  value: string;
  label: string;
}

export default function AutocompleteField({
  fieldKey,
  value,
  onChange,
  autocompleteConfig,
  staticOptions,
  isMulti = false,
  disabled = false,
  isInvalid = false,
  placeholder = 'Type to search...',
}: AutocompleteFieldProps) {
  const [search, setSearch] = useState('');
  const [remoteOptions, setRemoteOptions] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(
    () => (autocompleteConfig?.sourceType === 'ExportCollection' || autocompleteConfig?.sourceType === 'Collection') && !!autocompleteConfig.collectionRef
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Derive static options without useEffect (synchronous)
  const staticItems = useMemo<OptionItem[]>(() => {
    if (autocompleteConfig?.sourceType === 'Static') {
      return (autocompleteConfig.staticOptions || staticOptions || []).map((o) => ({
        value: o.value,
        label: o.label,
      }));
    }
    return [];
  }, [autocompleteConfig, staticOptions]);

  const isExportCollection =
    (autocompleteConfig?.sourceType === 'ExportCollection' || autocompleteConfig?.sourceType === 'Collection') && !!autocompleteConfig.collectionRef;

  // Load collection data asynchronously when sourceType is ExportCollection or Collection
  useEffect(() => {
    if (!isExportCollection || !autocompleteConfig?.collectionRef) return;
    const parts = autocompleteConfig.collectionRef.split('.');
    if (parts.length < 3) return;

    let cancelled = false;
    const [systemKey, pageKey, ...rest] = parts;
    const collectionName = rest.join('.');

    dataEntryApi
      .getCollectionData(systemKey, pageKey, collectionName)
      .then((data) => {
        if (cancelled) return;
        const displayField = autocompleteConfig.displayField || 'name';
        const valueField = autocompleteConfig.valueField || 'id';
        setRemoteOptions(
          data.map((item) => ({
            value: String(item[valueField] ?? item.id ?? ''),
            label: String(item[displayField] ?? ''),
          }))
        );
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setRemoteOptions([]);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [isExportCollection, autocompleteConfig]);

  // Merge static + remote options
  const options = staticItems.length > 0 ? staticItems : remoteOptions;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [search, options]);

  const selectedValues: string[] = useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const selectedLabels = useMemo(() => {
    return selectedValues
      .map((v) => options.find((o) => o.value === v)?.label || v)
      .filter(Boolean);
  }, [selectedValues, options]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (isMulti) {
        const current = Array.isArray(value) ? value : value ? [value] : [];
        if (current.includes(optionValue)) {
          onChange(fieldKey, current.filter((v: string) => v !== optionValue));
        } else {
          onChange(fieldKey, [...current, optionValue]);
        }
      } else {
        onChange(fieldKey, optionValue);
        setSearch('');
        setShowDropdown(false);
      }
    },
    [isMulti, value, fieldKey, onChange]
  );

  const handleRemoveTag = (optionValue: string) => {
    if (isMulti) {
      const current = Array.isArray(value) ? value : [];
      onChange(fieldKey, current.filter((v: string) => v !== optionValue));
    } else {
      onChange(fieldKey, '');
    }
  };

  const displayValue = useMemo(() => {
    if (isMulti) return search;
    if (showDropdown) return search;
    if (value && !showDropdown) {
      return options.find((o) => o.value === value)?.label || value;
    }
    return '';
  }, [isMulti, showDropdown, search, value, options]);

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {/* Selected tags for multi-select */}
      {isMulti && selectedLabels.length > 0 && (
        <div className="mb-1 d-flex flex-wrap gap-1">
          {selectedValues.map((v, i) => (
            <Badge
              key={v}
              bg="primary"
              className="d-flex align-items-center"
              style={{ cursor: disabled ? 'default' : 'pointer' }}
            >
              {selectedLabels[i]}
              {!disabled && (
                <button
                  type="button"
                  className="btn-close btn-close-white ms-1"
                  style={{ fontSize: '0.5rem' }}
                  aria-label={`Remove ${selectedLabels[i]}`}
                  onClick={() => handleRemoveTag(v)}
                />
              )}
            </Badge>
          ))}
        </div>
      )}

      <Form.Control
        type="text"
        placeholder={placeholder}
        value={displayValue}
        disabled={disabled}
        isInvalid={isInvalid}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        autoComplete="off"
      />

      {!isMulti && value && !showDropdown && (
        <button
          type="button"
          className="btn-close position-absolute"
          style={{ right: 10, top: 10, fontSize: '0.6rem', zIndex: 2 }}
          aria-label="Clear selection"
          onClick={() => {
            if (!disabled) handleRemoveTag(value);
          }}
        />
      )}

      {showDropdown && !disabled && (
        <ListGroup
          style={{
            position: 'absolute',
            zIndex: 1000,
            width: '100%',
            maxHeight: 200,
            overflowY: 'auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {loading && (
            <ListGroup.Item className="text-center">
              <Spinner animation="border" size="sm" /> Loading...
            </ListGroup.Item>
          )}
          {!loading && filteredOptions.length === 0 && (
            <ListGroup.Item className="text-muted">No options found</ListGroup.Item>
          )}
          {!loading &&
            filteredOptions.map((opt) => {
              const isSelected = selectedValues.includes(opt.value);
              return (
                <ListGroup.Item
                  key={opt.value}
                  action
                  active={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  style={{ cursor: 'pointer' }}
                >
                  {opt.label}
                </ListGroup.Item>
              );
            })}
        </ListGroup>
      )}
    </div>
  );
}

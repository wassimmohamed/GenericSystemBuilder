import { useState, useMemo } from 'react';
import { Table, Form, Button, Pagination, Badge } from 'react-bootstrap';
import type { ListConfigDto, FormConfigDto, ListColumnConfigDto, ListColumnFieldDto } from '../types';

interface DynamicListProps {
  listConfig?: ListConfigDto;
  formConfig?: FormConfigDto;
  data?: Record<string, any>[];
  onEdit?: (row: Record<string, any>) => void;
  onDelete?: (row: Record<string, any>) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function DynamicList({
  listConfig,
  formConfig,
  data = [],
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}: DynamicListProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(listConfig?.defaultSortField || '');
  const [sortDir, setSortDir] = useState(listConfig?.defaultSortDirection || 'asc');

  const pageSize = listConfig?.pageSize || 10;

  const fieldMap = useMemo(() => {
    const map: Record<string, any> = {};
    formConfig?.fields?.forEach((f) => {
      map[f.fieldKey] = f;
    });
    return map;
  }, [formConfig]);

  // Build columns: prefer rich columns config, fall back to displayFields
  const columns: ListColumnConfigDto[] = useMemo(() => {
    if (listConfig?.columns && listConfig.columns.length > 0) {
      return listConfig.columns;
    }
    // Fall back: each displayField becomes a single-field column
    return (listConfig?.displayFields || []).map((key) => ({
      key,
      header: fieldMap[key]?.label || key,
      fields: [{ fieldKey: key, renderAs: 'text' }],
    }));
  }, [listConfig, fieldMap]);

  // Collect all field keys referenced by columns for search
  const allFieldKeys = useMemo(() => {
    const keys: string[] = [];
    columns.forEach((col) =>
      col.fields.forEach((f) => {
        if (!keys.includes(f.fieldKey)) keys.push(f.fieldKey);
      })
    );
    return keys;
  }, [columns]);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (listConfig?.enableSearch && search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((row) =>
        allFieldKeys.some((key) =>
          String(row[key] || '')
            .toLowerCase()
            .includes(lowerSearch)
        )
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        const va = a[sortField] || '';
        const vb = b[sortField] || '';
        const cmp = String(va).localeCompare(String(vb));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, search, sortField, sortDir, allFieldKeys, listConfig]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const pageData = listConfig?.enablePagination
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const renderCellField = (row: Record<string, any>, colField: ListColumnFieldDto) => {
    const value = row[colField.fieldKey];
    if (value === undefined || value === null || value === '') return null;

    switch (colField.renderAs) {
      case 'badge':
        return (
          <Badge bg={colField.badgeVariant || 'secondary'} className="me-1">
            {String(value)}
          </Badge>
        );
      default:
        return <span>{String(value)}</span>;
    }
  };

  const renderCell = (row: Record<string, any>, col: ListColumnConfigDto) => {
    if (col.fields.length === 1) {
      return renderCellField(row, col.fields[0]);
    }
    return (
      <div className="d-flex flex-column gap-1">
        {col.fields.map((f) => {
          const rendered = renderCellField(row, f);
          return rendered ? <div key={f.fieldKey}>{rendered}</div> : null;
        })}
      </div>
    );
  };

  return (
    <div>
      {listConfig?.enableSearch && (
        <Form.Control
          type="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="mb-3"
        />
      )}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {columns.map((col) => {
              // Sort by the first field in the column; skip if no fields configured
              const sortKey = col.fields.length > 0 ? col.fields[0].fieldKey : '';
              return sortKey ? (
                <th
                  key={col.key}
                  role="button"
                  onClick={() => handleSort(sortKey)}
                  className="user-select-none"
                >
                  {col.header}
                  {sortField === sortKey && (sortDir === 'asc' ? ' ▲' : ' ▼')}
                </th>
              ) : (
                <th key={col.key}>{col.header}</th>
              );
            })}
            {(canEdit || canDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {pageData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (canEdit || canDelete ? 1 : 0)}
                className="text-center text-muted"
              >
                No data available
              </td>
            </tr>
          ) : (
            pageData.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map((col) => (
                  <td key={col.key}>{renderCell(row, col)}</td>
                ))}
                {(canEdit || canDelete) && (
                  <td>
                    {canEdit && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => onEdit?.(row)}
                      >
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onDelete?.(row)}
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {listConfig?.enablePagination && totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          />
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Pagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          />
        </Pagination>
      )}
    </div>
  );
}

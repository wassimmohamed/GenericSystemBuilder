import { useState, useMemo } from 'react';
import { Table, Form, Button, Pagination } from 'react-bootstrap';
import type { ListConfigDto, FormConfigDto } from '../types';

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

  const displayFields = useMemo(
    () => listConfig?.displayFields || [],
    [listConfig]
  );

  const filteredData = useMemo(() => {
    let result = [...data];

    if (listConfig?.enableSearch && search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((row) =>
        displayFields.some((key) =>
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
  }, [data, search, sortField, sortDir, displayFields, listConfig]);

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
            {displayFields.map((key) => (
              <th
                key={key}
                role="button"
                onClick={() => handleSort(key)}
                className="user-select-none"
              >
                {fieldMap[key]?.label || key}
                {sortField === key && (sortDir === 'asc' ? ' ▲' : ' ▼')}
              </th>
            ))}
            {(canEdit || canDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {pageData.length === 0 ? (
            <tr>
              <td
                colSpan={displayFields.length + (canEdit || canDelete ? 1 : 0)}
                className="text-center text-muted"
              >
                No data available
              </td>
            </tr>
          ) : (
            pageData.map((row, idx) => (
              <tr key={row.id || idx}>
                {displayFields.map((key) => (
                  <td key={key}>{String(row[key] ?? '')}</td>
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

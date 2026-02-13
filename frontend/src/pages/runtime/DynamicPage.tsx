import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Tab, Tabs, Spinner, Alert, Button, Modal } from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchSystemByKey } from '../../store/systemConfigSlice';
import DynamicForm from '../../components/DynamicForm';
import DynamicList from '../../components/DynamicList';
import { dataEntryApi } from '../../api/systemConfigApi';
import type { DataEntryResponseDto } from '../../types';

export default function DynamicPage() {
  const { systemKey } = useParams();
  const dispatch = useAppDispatch();
  const { currentSystem, loading, error } = useAppSelector(
    (state) => state.systemConfig
  );
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);
  const [activePageKey, setActivePageKey] = useState<string>('');

  // Per-page data entries keyed by pageKey
  const [entriesMap, setEntriesMap] = useState<Record<string, DataEntryResponseDto[]>>({});
  const [dataLoading, setDataLoading] = useState(false);

  // Simulated current user ID
  const userId = 'admin';

  useEffect(() => {
    if (systemKey) {
      dispatch(fetchSystemByKey(systemKey));
    }
  }, [dispatch, systemKey]);

  const pages = currentSystem?.configuration?.pages || [];

  // Set default active page when system loads
  useEffect(() => {
    const systemPages = currentSystem?.configuration?.pages;
    if (systemPages && systemPages.length > 0 && !activePageKey) {
      setActivePageKey(systemPages[0].pageKey);
    }
  }, [currentSystem, activePageKey]);

  // Load data entries when active page changes
  const loadEntries = useCallback(async (pageKey: string) => {
    if (!systemKey || !pageKey) return;
    setDataLoading(true);
    try {
      const entries = await dataEntryApi.getAll(systemKey, pageKey);
      setEntriesMap((prev) => ({ ...prev, [pageKey]: entries }));
    } catch {
      // Silently handle — list will show empty
    } finally {
      setDataLoading(false);
    }
  }, [systemKey]);

  useEffect(() => {
    if (activePageKey && systemKey) {
      loadEntries(activePageKey);
    }
  }, [activePageKey, systemKey, loadEntries]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!currentSystem) {
    return <Alert variant="info">System not found.</Alert>;
  }

  const { configuration } = currentSystem;
  const activePage = pages.find((p) => p.pageKey === activePageKey);

  const handleFormSubmit = async (values: Record<string, any>) => {
    if (!systemKey || !activePageKey) return;
    try {
      if (editingItem?.id) {
        await dataEntryApi.update(systemKey, activePageKey, editingItem.id, {
          data: values,
          updatedBy: userId,
        });
      } else {
        await dataEntryApi.create(systemKey, activePageKey, {
          data: values,
          createdBy: userId,
        });
      }
      setShowForm(false);
      setEditingItem(null);
      loadEntries(activePageKey);
    } catch (err) {
      console.error('Failed to save entry:', err);
    }
  };

  const handleEdit = (row: Record<string, any>) => {
    setEditingItem(row);
    setShowForm(true);
  };

  const handleDelete = async (row: Record<string, any>) => {
    if (!systemKey || !activePageKey || !row.id) return;
    try {
      await dataEntryApi.delete(systemKey, activePageKey, row.id);
      loadEntries(activePageKey);
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  // Flatten entry data for list display: merge entry.data fields with entry.id
  const listData = (entriesMap[activePageKey] || []).map((entry) => ({
    id: entry.id,
    ...entry.data,
  }));

  return (
    <div>
      <h2>
        {configuration.icon && (
          <span className="me-2">{configuration.icon}</span>
        )}
        {configuration.title}
      </h2>
      <p className="text-muted">{configuration.description}</p>

      {pages.length === 0 ? (
        <Alert variant="info">No pages configured for this system.</Alert>
      ) : (
        <>
          <Tabs
            activeKey={activePageKey}
            onSelect={(key) => {
              if (key) setActivePageKey(key);
            }}
            className="mb-3"
          >
            {pages.map((page) => (
              <Tab key={page.pageKey} eventKey={page.pageKey} title={page.title}>
                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <h4>{page.title}</h4>
                  {page.form && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setEditingItem(null);
                        setShowForm(true);
                      }}
                    >
                      + Add New
                    </Button>
                  )}
                </div>

                {dataLoading ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : (
                  page.list && (
                    <DynamicList
                      listConfig={page.list}
                      formConfig={page.form}
                      data={page.pageKey === activePageKey ? listData : []}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      canEdit={true}
                      canDelete={true}
                    />
                  )
                )}
              </Tab>
            ))}
          </Tabs>

          {/* Single modal outside the loop — only renders once */}
          <Modal
            show={showForm}
            onHide={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {editingItem ? 'Edit' : 'Add New'} {activePage?.form?.title}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {activePage?.form && (
                <DynamicForm
                  formConfig={activePage.form}
                  onSubmit={handleFormSubmit}
                  initialValues={editingItem ?? {}}
                  isEdit={!!editingItem}
                  userId={userId}
                />
              )}
            </Modal.Body>
          </Modal>
        </>
      )}
    </div>
  );
}

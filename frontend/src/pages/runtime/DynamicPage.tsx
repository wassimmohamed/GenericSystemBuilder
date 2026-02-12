import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tab, Tabs, Spinner, Alert, Button, Modal } from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchSystemByKey } from '../../store/systemConfigSlice';
import DynamicForm from '../../components/DynamicForm';
import DynamicList from '../../components/DynamicList';

export default function DynamicPage() {
  const { systemKey } = useParams();
  const dispatch = useAppDispatch();
  const { currentSystem, loading, error } = useAppSelector(
    (state) => state.systemConfig
  );
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);

  // Simulated current user ID
  const userId = 'admin';

  useEffect(() => {
    dispatch(fetchSystemByKey(systemKey));
  }, [dispatch, systemKey]);

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
  const pages = configuration?.pages || [];

  const handleFormSubmit = (values: Record<string, any>) => {
    // In a real app, this would save data to the backend
    console.log('Form submitted:', values);
    setShowForm(false);
    setEditingItem(null);
  };

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
        <Tabs defaultActiveKey={pages[0]?.pageKey} className="mb-3">
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

              {page.list && (
                <DynamicList
                  listConfig={page.list}
                  formConfig={page.form}
                  data={[]}
                  onEdit={(row) => {
                    setEditingItem(row);
                    setShowForm(true);
                  }}
                  canEdit={true}
                  canDelete={true}
                />
              )}

              <Modal
                show={showForm}
                onHide={() => setShowForm(false)}
                size="lg"
              >
                <Modal.Header closeButton>
                  <Modal.Title>
                    {editingItem ? 'Edit' : 'Add New'} {page.form?.title}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {page.form && (
                    <DynamicForm
                      formConfig={page.form}
                      onSubmit={handleFormSubmit}
                      initialValues={editingItem || {}}
                      isEdit={!!editingItem}
                      userId={userId}
                    />
                  )}
                </Modal.Body>
              </Modal>
            </Tab>
          ))}
        </Tabs>
      )}
    </div>
  );
}

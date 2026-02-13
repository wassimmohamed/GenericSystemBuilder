import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import type { SystemConfigurationSummaryDto } from '../../types';

interface SidebarProps {
  systems?: SystemConfigurationSummaryDto[];
}

export default function Sidebar({ systems = [] }: SidebarProps) {
  const location = useLocation();

  return (
    <div className="bg-light border-end p-3" style={{ minWidth: 220, minHeight: 'calc(100vh - 62px)' }}>
      <h6 className="text-muted text-uppercase mb-3">Systems</h6>
      <Nav className="flex-column">
        {systems.map((sys) => (
          <Nav.Link
            key={sys.systemKey}
            as={Link}
            to={`/systems/${sys.systemKey}`}
            active={location.pathname.includes(`/systems/${sys.systemKey}`)}
            className="rounded"
          >
            {sys.icon && <span className="me-2">{sys.icon}</span>}
            {sys.title}
          </Nav.Link>
        ))}
        {systems.length === 0 && (
          <p className="text-muted small">No systems configured yet.</p>
        )}
      </Nav>
    </div>
  );
}

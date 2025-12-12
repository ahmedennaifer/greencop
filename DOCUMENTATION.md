# GreenCop Documentation Guide

## Quick Start

### View Documentation Locally

```bash
# Install dependencies
pip install mkdocs mkdocs-material mkdocs-glightbox

# Serve documentation
mkdocs serve

# Open browser to:
# http://127.0.0.1:8000
```

### Build for Production

```bash
mkdocs build
# Static site generated in site/
```

## What's Documented

✅ **Getting Started** (4 pages)
- Introduction to GreenCop
- Quick start guide
- Complete installation instructions
- System architecture with Go gateway & mDNS

✅ **Features** (5 pages)
- Dashboard overview
- Real-time sensor monitoring
- Alert system
- Server room management
- Data analytics

✅ **User Guide** (6 pages)
- Account registration
- Managing rooms
- Managing sensors
- Viewing data
- Configuring alert thresholds
- Interpreting charts

✅ **API Reference** (9 pages)
- API overview & authentication
- Authentication endpoints
- Customers API
- Server Rooms API
- Sensors API
- Data API
- Alerts API
- **Gateway API (Go service)**
- Error codes reference

✅ **Hardware** (4 pages)
- ESP32 setup guide
- Sensor configuration
- Troubleshooting
- Technical specifications

✅ **Development** (6 pages)
- Local development setup
- Frontend development (React)
- Backend development (FastAPI)
- **Go gateway development**
- Database migrations
- Testing
- Terraform infrastructure

✅ **Advanced** (4 pages)
- Data pipeline architecture
- Cloud Functions
- BigQuery queries
- Security implementation

✅ **Future Features** (3 pages)
- ML anomaly detection
- Notifications (email/SMS)
- AI assistant

## Key Documentation Highlights

### Mini Distributed System
Comprehensive documentation of:
- Go gateway service architecture
- mDNS auto-discovery protocol
- ESP32 auto-registration
- Zero-configuration sensor deployment

### Gateway API
Complete API reference for local Go gateway:
- `/api/v1/register` - Node registration
- `/api/v1/message` - Sensor data publishing
- `/api/v1/heartbeat` - Health monitoring
- `/api/v1/nodes` - List registered sensors

### mDNS Auto-Discovery
Detailed explanation of:
- How ESP32 finds gateway via `greencop-gateway.local`
- mDNS broadcasting configuration
- Network troubleshooting
- Fallback strategies

## Documentation Features

- **Material Theme**: Modern, responsive design
- **Search**: Full-text search across all pages
- **Code Highlighting**: Syntax highlighting for all languages
- **Dark Mode**: Toggle between light/dark themes
- **Navigation**: Tabs and sections for easy browsing
- **Mermaid Diagrams**: Architecture and flow diagrams
- **Examples**: cURL, JavaScript, Python code examples

## File Structure

```
docs/
├── index.md                          # Home page
├── getting-started/
│   ├── introduction.md
│   ├── quick-start.md
│   ├── installation.md
│   ├── architecture.md
│   └── architecture-update.md        # Go gateway & mDNS
├── features/
│   ├── dashboard.md
│   ├── sensor-monitoring.md
│   ├── alerts.md
│   ├── server-rooms.md
│   └── data-analytics.md
├── user-guide/
│   ├── registration.md
│   ├── managing-rooms.md
│   ├── managing-sensors.md
│   ├── viewing-data.md
│   ├── configuring-alerts.md
│   └── interpreting-charts.md
├── api-reference/
│   ├── overview.md
│   ├── authentication.md
│   ├── customers.md
│   ├── server-rooms.md
│   ├── sensors.md
│   ├── data.md
│   ├── alerts.md
│   ├── gateway.md                    # Go gateway API
│   └── error-codes.md
├── hardware/
│   ├── esp32-setup.md
│   ├── sensor-configuration.md
│   ├── troubleshooting.md
│   └── specifications.md
├── development/
│   ├── local-setup.md
│   ├── frontend-development.md
│   ├── backend-development.md
│   ├── database-migrations.md
│   ├── testing.md
│   └── terraform.md
├── advanced/
│   ├── data-pipeline.md
│   ├── cloud-functions.md
│   ├── bigquery-queries.md
│   └── security.md
└── future-features/
    ├── ml-anomaly-detection.md
    ├── notifications.md
    └── assistant.md
```

## Total: 43 Comprehensive Documentation Files

Perfect for university project demonstration and real-world deployment!

# GreenCop Documentation

Comprehensive documentation for the GreenCop IoT monitoring system.

## Viewing the Documentation

### Install MkDocs

```bash
pip install mkdocs mkdocs-material mkdocs-glightbox
```

### Serve Locally

```bash
# From project root
mkdocs serve
```

Then open http://127.0.0.1:8000

### Build Static Site

```bash
mkdocs build
# Output in site/ directory
```

## Documentation Structure

- **Getting Started**: Introduction, installation, architecture
- **Features**: Dashboard, sensors, alerts, rooms, analytics
- **User Guide**: Step-by-step usage instructions
- **API Reference**: Complete API documentation
- **Hardware**: ESP32 setup and configuration
- **Development**: Local setup, frontend/backend development
- **Advanced**: Data pipeline, Cloud Functions, security
- **Future Features**: Planned enhancements

## Key Highlights

### Distributed System
- Go gateway service with mDNS auto-discovery
- ESP32 sensors auto-register via `greencop-gateway.local`
- Event-driven architecture with Pub/Sub

### Complete API Coverage
- All 20+ endpoints documented with examples
- cURL, JavaScript, and Python examples
- Request/response schemas
- Error codes and solutions

### Hardware Guide
- ESP32 setup from scratch
- MicroPython firmware installation
- WiFi and mDNS configuration
- LED indicator troubleshooting

## Documentation Count

43 markdown files covering every aspect of GreenCop!

## Contributing

To add or update documentation:
1. Edit markdown files in `docs/`
2. Test locally with `mkdocs serve`
3. Commit changes
4. Rebuild with `mkdocs build`

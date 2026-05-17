# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |
| < v1.0  | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within GradeFlow, please send an email to the security team instead of using the issue tracker.

## Design Philosophy

- **No Credential Scraping:** The system does not store plaintext passwords for unofficial ERP integrations. All integration relies on strict consent-based access.
- **Responsible ERP Interoperability:** We don't bypass security layers for university ERPs.
- **Data Privacy:** Users control their own data.

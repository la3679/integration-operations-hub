# Security Policy

## Supported versions

This repository is currently a portfolio and demonstration project. Security fixes apply to the latest commit on `main`.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability.

Use GitHub's private vulnerability-reporting feature when available, or contact the repository owner through the contact method listed on the GitHub profile. Include:

- A concise description of the issue.
- Affected component and version or commit.
- Reproduction steps or proof of concept.
- Expected impact.
- Any suggested mitigation.

Do not include real employee, customer, authentication, or production data.

## Demonstration credentials

`integration-demo-token` and the default PostgreSQL credentials are intentionally public local-development values. They are not secrets and must never be used in a deployed environment.

## Production warning

Before deployment, replace demonstration authentication, use managed secrets, require TLS, restrict networks, use least-privilege identities, enable dependency/container scanning, persist audit events, and complete a security review.


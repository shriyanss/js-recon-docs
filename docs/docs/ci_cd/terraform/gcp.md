---
sidebar_position: 2
---

import Link from "@docusaurus/Link";

# GCP

Provision a GCP Cloud Build trigger that runs JS Recon against any URL. Upload results to a GCS bucket automatically.

<br />

<Link
    className="button button--primary button--lg"
    to="https://registry.terraform.io/modules/shriyanss/js-recon/gcp"
>
    View on Terraform Registry →
</Link>

<br />
<br />

## Quick start

```hcl
module "js_recon" {
  source  = "shriyanss/js-recon/gcp"
  version = "~> 1.0"

  project = "my-gcp-project"
  url     = "https://example.com"
}
```

After `terraform apply`, trigger a scan:

```bash
gcloud builds triggers run js-recon \
  --project=my-gcp-project \
  --region=us-central1
```

---

## Scanning a localhost app

Override substitutions at invocation time to scan an app that starts inside the build:

```bash
gcloud builds triggers run js-recon \
  --project=my-gcp-project \
  --region=us-central1 \
  --substitutions=_JSR_URL=http://localhost:3000,_JSR_START_CMD="npm start"
```

The build waits up to 120 seconds for the URL to respond before scanning.

---

## Inputs

| Name                       | Required | Default            | Description                                                              |
| -------------------------- | -------- | ------------------ | ------------------------------------------------------------------------ |
| `project`                  | Yes      | —                  | GCP project ID                                                           |
| `url`                      | Yes      | —                  | Target URL to scan                                                       |
| `region`                   | No       | `us-central1`      | GCP region for Cloud Build trigger and Cloud Scheduler                   |
| `js_recon_version`         | No       | `latest`           | JS Recon version (`latest`, `alpha`, `1.3.1-beta.1`, …)                  |
| `break_on_map_files`       | No       | `true`             | Fail if `.map` source map files are detected                             |
| `break_on_vulnerabilities` | No       | `true`             | Fail if findings at or above the threshold are detected                  |
| `vulnerability_severity`   | No       | `high`             | Minimum severity to fail on: `low`, `medium`, or `high`                  |
| `output_dir`               | No       | `js-recon-output`  | Directory to save output files inside the build                          |
| `trigger_name`             | No       | `js-recon`         | Name prefix for all GCP resources                                        |
| `create_gcs_bucket`        | No       | `true`             | Whether the module creates a GCS bucket for artifacts                    |
| `gcs_bucket_name`          | No       | _(auto-generated)_ | Explicit GCS bucket name                                                 |
| `gcs_artifact_prefix`      | No       | `js-recon-output`  | GCS object prefix for uploaded artifacts                                 |
| `schedule`                 | No       | `""`               | Cloud Scheduler cron expression (e.g. `0 8 * * *`). Empty = no schedule. |
| `build_timeout`            | No       | `30`               | Maximum build duration in minutes                                        |
| `labels`                   | No       | `{}`               | Labels applied to all GCP resources                                      |

---

## Outputs

| Name                      | Description                              |
| ------------------------- | ---------------------------------------- |
| `cloudbuild_trigger_id`   | ID of the Cloud Build trigger            |
| `cloudbuild_trigger_name` | Name of the Cloud Build trigger          |
| `gcs_bucket_name`         | Name of the GCS artifact bucket          |
| `gcs_bucket_url`          | `gs://` URL of the artifact bucket       |
| `service_account_email`   | Email of the Cloud Build service account |

---

## Output files

JS Recon writes the following files inside the output directory and uploads them to GCS:

| File                  | Description                               |
| --------------------- | ----------------------------------------- |
| `analyze.json`        | All vulnerability findings                |
| `mapped.json`         | Parsed bundle structure                   |
| `mapped-openapi.json` | Extracted HTTP endpoints (OpenAPI format) |
| `endpoints.json`      | Client-side routes                        |
| `strings.json`        | Extracted strings, URLs, and secrets      |
| `report.html`         | Full HTML report                          |
| `js-recon.db`         | SQLite database of all findings           |

Artifacts are uploaded to `gs://<bucket>/<gcs_artifact_prefix>/` after every scan.

---

## Break conditions

### Source maps

```hcl
module "js_recon" {
  source  = "shriyanss/js-recon/gcp"
  project = "my-gcp-project"
  url     = "https://example.com"

  break_on_map_files = true # default
}
```

Set `break_on_map_files = false` to continue the scan even when source map files are found.

### Vulnerabilities

```hcl
module "js_recon" {
  source  = "shriyanss/js-recon/gcp"
  project = "my-gcp-project"
  url     = "https://example.com"

  break_on_vulnerabilities = true
  vulnerability_severity   = "medium"
}
```

---

## Scheduled scans

```hcl
module "js_recon" {
  source  = "shriyanss/js-recon/gcp"
  project = "my-gcp-project"
  url     = "https://example.com"

  schedule = "0 8 * * *"
}
```

Standard Unix cron expressions are supported. Requires the Cloud Scheduler API (`cloudscheduler.googleapis.com`) to be enabled in your project.

---

## Triggering a scan manually

```bash
# Run with default substitutions (as configured in Terraform)
gcloud builds triggers run js-recon \
  --project=my-gcp-project \
  --region=us-central1

# Override the target URL at run time
gcloud builds triggers run js-recon \
  --project=my-gcp-project \
  --region=us-central1 \
  --substitutions=_JSR_URL=https://other.example.com
```

---

## Pinning to a specific JS Recon version

```hcl
module "js_recon" {
  source  = "shriyanss/js-recon/gcp"
  project = "my-gcp-project"
  url     = "https://example.com"

  js_recon_version = "1.3.1-beta.1"
}
```

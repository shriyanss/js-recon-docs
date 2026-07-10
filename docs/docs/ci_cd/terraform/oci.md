---
sidebar_position: 6
---

import Link from "@docusaurus/Link";

# Terraform — Oracle Cloud

Provision an OCI Container Instance that runs JS Recon against any URL. Upload results to OCI Object Storage automatically.

<br />

<Link
    className="button button--primary button--lg"
    to="https://registry.terraform.io/modules/shriyanss/js-recon/oci"
>
    View on Terraform Registry →
</Link>

<br />
<br />

## Quick start

```hcl
module "js_recon" {
  source  = "shriyanss/js-recon/oci"
  version = "~> 1.0"

  compartment_id   = var.compartment_id
  region           = "us-ashburn-1"
  bucket_namespace = var.bucket_namespace
  url              = "https://example.com"
}
```

Configure OCI credentials and apply:

```bash
export OCI_CLI_AUTH=api_key
terraform apply
```

---

## Inputs

| Name                       | Required | Default            | Description                                                        |
| -------------------------- | -------- | ------------------ | ------------------------------------------------------------------ |
| `compartment_id`           | Yes      | —                  | OCID of the OCI compartment                                        |
| `region`                   | Yes      | —                  | OCI region (e.g. `us-ashburn-1`, `eu-frankfurt-1`)                 |
| `url`                      | Yes      | —                  | Target URL to scan                                                 |
| `js_recon_version`         | No       | `latest`           | JS Recon version (`latest`, `alpha`, `1.3.1-beta.1`, …)            |
| `break_on_map_files`       | No       | `true`             | Fail if `.map` source map files are detected                       |
| `break_on_vulnerabilities` | No       | `true`             | Fail if findings at or above the threshold are detected            |
| `vulnerability_severity`   | No       | `high`             | Minimum severity to fail on: `low`, `medium`, or `high`            |
| `output_dir`               | No       | `js-recon-output`  | Directory to save output files inside the container                |
| `display_name`             | No       | `js-recon`         | Display name prefix for all OCI resources                          |
| `availability_domain`      | No       | `AD-1`             | Availability domain suffix (e.g. `AD-1`)                           |
| `container_cpu`            | No       | `2`                | OCPUs for the Container Instance                                   |
| `container_memory_gb`      | No       | `4`                | Memory in GB for the Container Instance                            |
| `create_bucket`            | No       | `true`             | Whether the module creates an Object Storage bucket for artifacts  |
| `bucket_name`              | No       | _(auto-generated)_ | Object Storage bucket name                                         |
| `bucket_namespace`         | No       | `""`               | OCI Object Storage tenancy namespace (required when `create_bucket = true`) |
| `bucket_artifact_prefix`   | No       | `js-recon-output`  | Object key prefix for uploaded artifacts                           |
| `build_timeout`            | No       | `1800`             | Maximum Container Instance run duration in seconds                 |
| `freeform_tags`            | No       | `{}`               | Freeform tags applied to all OCI resources                         |

---

## Outputs

| Name                       | Description                                        |
| -------------------------- | -------------------------------------------------- |
| `container_instance_id`    | OCID of the Container Instance                     |
| `container_instance_name`  | Display name of the Container Instance             |
| `bucket_name`              | Name of the Object Storage bucket                  |
| `bucket_namespace`         | Object Storage namespace                           |
| `subnet_id`                | OCID of the subnet                                 |
| `vcn_id`                   | OCID of the VCN                                    |

---

## Output files

JS Recon writes the following files and uploads them to OCI Object Storage via instance principal authentication:

| File                  | Description                               |
| --------------------- | ----------------------------------------- |
| `analyze.json`        | All vulnerability findings                |
| `mapped.json`         | Parsed bundle structure                   |
| `mapped-openapi.json` | Extracted HTTP endpoints (OpenAPI format) |
| `endpoints.json`      | Client-side routes                        |
| `strings.json`        | Extracted strings, URLs, and secrets      |
| `report.html`         | Full HTML report                          |
| `js-recon.db`         | SQLite database of all findings           |

---

## Break conditions

### Source maps

```hcl
module "js_recon" {
  source = "shriyanss/js-recon/oci"
  # required inputs...

  break_on_map_files = true # default
}
```

### Vulnerabilities

```hcl
module "js_recon" {
  source = "shriyanss/js-recon/oci"
  # required inputs...

  break_on_vulnerabilities = true
  vulnerability_severity   = "medium"
}
```

---

## Scheduled scans

OCI Scheduler is not yet available as a Terraform resource. To schedule recurring scans using the OCI CLI:

```bash
oci resource-scheduler schedule create \
  --compartment-id <compartment_ocid> \
  --display-name js-recon-schedule \
  --recurrence-type CRON \
  --recurrence-details "0 8 * * *" \
  --resources '[{"id":"<container_instance_ocid>","metadata":{}}]' \
  --action START
```

---

## Triggering a scan manually

Restart the Container Instance to run another scan:

```bash
oci container-instances container-instance restart \
  --container-instance-id <container_instance_ocid>
```

---

## Pinning to a specific JS Recon version

```hcl
module "js_recon" {
  source = "shriyanss/js-recon/oci"
  # required inputs...

  js_recon_version = "1.3.1"
}
```

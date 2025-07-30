---
sidebar_position: 2
---

# Creating new rules

To create a new rule, you have to first create a new YAML file (`.yaml` or `.yml` extension).

## Basic structure

A rule file has the following basic structure:

```yaml
id: <id>
name: <human-readable-name>
author: <author>
description: <description>
severity: <info | low | medium | high>
type: request
tech: <tech>

steps:
    - <step>
```

All the mentioned fields are required. For example, a rule file could look like this:

```yaml
id: rule-1
name: Rule 1
author: shriyanss
severity: info
type: request
tech: next

steps:
    - <step>
```

## Steps

Each step follows a unified structure, which must be followed. There are different types of steps, such as matching the header and the URL.

The steps are parsed by an engine, which are named as per the type of step. The following are the engined that are available (you can navigate to a particular engine to know about their rule format):

-

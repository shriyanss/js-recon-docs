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
type: <request | ast>
tech:
    - <tech>

steps:
    - <step>
```

All the mentioned fields are required. For example, a rule file could look like this:

```yaml
id: rule-1
name: Rule 1
author: shriyanss
severity: info
type: ast
tech:
    - next

steps:
    - <step>
```

## Steps

Each step follows a unified structure, which must be followed. There are different types of steps, such as matching the header and the URL.

The steps are parsed by an engine, which is named as per the type of step. The following are the engines that are available (you can navigate to a particular engine to know about their rule format):

- [Request Engine](./engines/request-engine.md)
- [AST Engine](./engines/ast-engine.md)

## Multi-step rules and how matches are combined

A rule with several steps fires only when **every** step matches in the same target unit — a single chunk for AST rules, a single OpenAPI operation for request rules. Within a step, the engine stops counting once at least one match is found; multiple matches do not break the rule.

To express a stronger relationship between steps you can use two optional fields:

- `requires: [previousStepName, ...]` — declares a hard dependency: the step is skipped (and the rule cannot fire) unless every required step has already matched.
- `inScopeOf: previousStepName` (on an AST `esquery` step) — restricts the query to the AST subtree of the previous step's match instead of the whole chunk. This is the right tool when you want to require both a source and a sink to live inside the same function.

A typical taint-style AST rule therefore looks like:

```yaml
steps:
    - name: find_source
      esquery:
          type: esquery
          query: <selector for the URL parameter / fetch response / event.data>
    - name: find_sink
      requires:
          - find_source
      esquery:
          type: esquery
          query: <selector for innerHTML / dangerouslySetInnerHTML / fetch URL>
```

If you need stricter scoping than the chunk, change `find_sink`'s step to use `inScopeOf: find_source` — see the [AST engine `inScopeOf` reference](./engines/ast-engine.md#inscopeof--scoping-an-esquery-to-a-previous-match).

---
sidebar_position: 2
---

# AST Engine

The AST engine is responsible for parsing the steps of a rule with type `ast`. Following is an example of what the headers of a rule would look like:

```
id: <id>
name: <human_readable_name>
author: <author>
description: <description>
severity: <info | low | medium | high>
type: ast
tech:
    - <tech>

steps:
    - name: <name_of_the_step>
      message: <message>
      requires:
          - <previous_step_name>
      ...
```

## AST Step

An AST step is used to match the specific parts of an AST ([Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree)) in a JS file.

### ESQuery

ESQuery is a query language for JavaScript ASTs. It is used to match the specific parts in a JavaScript file.

For comparison, consider the following HTML tree:

```html
<html>
    <body>
        <div>
            <form></form>
        </div>
    </body>
</html>
```

If you had to get the `<form>` element inside a `<div>`, which is then nested inside the `<body>` element with `<html>` as parent, you would use the following XPath query:

```
/html/body/div/form
```

ESQuery works in a similar way. Let's say want to match the following JS snippet:

```js
window.addEventListener("message", e);
```

If you know what the above snippet does, you would know that it is one of the first thing that you would do when searching for post-message vulnerabilities. To match it, you would use the following ESQuery query:

```
CallExpression[callee.object.name="window"][callee.property.name="addEventListener"][arguments.0.value="message"][arguments.1]
```

Now that you are familiar with what an ESQuery is, let's see how to use it in a rule file:

```yaml
- name: <name>
  message: <message>
  esquery:
      type: esquery
      query: <query>
```

The return type for this step is `Node`.

For example, a rule to detect post-message listeners would look like this:

<details>
<summary>Example: Full rule file for checking if the "Authorization" header is present in the request</summary>

```yaml
id: detect_postMessage
name: Detect postMessage event listeners
author: shriyanss
description: Detect postMessage event listeners
severity: info
type: ast
tech:
    - next

steps:
    - name: check_postMessage
      message: postMessage event listener detected
      esquery:
          type: esquery
          query: CallExpression[callee.object.name="window"][callee.property.name="addEventListener"][arguments.0.value="message"][arguments.1]
```

</details>

Unfortunately, there is no official documentation for ESQuery. However, you can use [ASTExplorer](https://astexplorer.net) to test build your ESQuery queries.

<details>
<summary>Some of the common ESQuery examples are:</summary>

-   `Identifier[name="fetch"]`

```js
fetch;
```

-   `CallExpression[callee.name="fetch"]`

```js
fetch();
```

-   `MemberExpression[property.name="innerHTML"]`

```js
something.innerHTML;
```

-   `VariableDeclarator[id.name="token"]`

```js
let token = "value";
```

-   `AssignmentExpression[left.property.name="innerHTML"]`

```js
something.innerHTML = "value";
```

-   `ImportDeclaration[source.value="axios"]`

```js
import axios from "axios";
```

-   `CallExpression[callee.name="setTimeout"][arguments.length=2]`

```js
setTimeout(() => {}, 1000);
```

-   `NewExpression[callee.name="XMLHttpRequest"]`

```js
new XMLHttpRequest();
```

</details>

### Post Message Function Resolve

You can use this to resolve a function that is called when the postMessage event is triggered. For this, you would first need a valid ESQuery query to match the postMessage event listener.

To use this step, you can use the following:

```yaml
- name: <name>
  message: <message>
  postMessageFunctionResolve:
      name: <postMessage_step_name>
```

The return type for this step is `Node`.

For example, a rule to resolve the code for the function that is called when the postMessage event is triggered would look like this:

<details>
<summary>Example: Full rule file to get the code for the function that is called when the postMessage event is triggered</summary>

```yaml
id: detect_postMessage_function
name: postMessage event listeners function code
author: shriyanss
description: Detect postMessage event listeners function code
severity: info
type: ast
tech:
    - next

steps:
    - name: check_postMessage
      message: postMessage event listener detected
      esquery:
          type: esquery
          query: CallExpression[callee.object.name="window"][callee.property.name="addEventListener"][arguments.0.value="message"][arguments.1]
    # now, check if the second argument is a function and it has call to innerHtml
    - name: resolve_event_handler_function
      message: Code for postmessage event handler
      requires:
          - check_postMessage
      postMessageFuncResolve:
          name: check_postMessage
```

</details>

### Check Assignment Exist

You can use this to find if a variable is assigned to something. For this, you would need a step whose return type is `Node`.

To use this step, you can use the following:

```yaml
- name: <name>
  message: <message>
  checkAssignmentExist:
      name: <node_step_name>
      type: <var_name_to_check_assignment_for>
      memberExpression: <boolean>
```

For example, to check if a innerHTML is being assigned a value in a node which is the function code for a postMessage event listener, you can use the following:

<details>
<summary>Example: Full rule file to check if a innerHTML is being assigned a value in a node which is the function code for a postMessage event listener</summary>

```yaml
id: detect_postMessage_innerHtml_sink
name: postMessage event listeners with innerHTML
author: shriyanss
description: Detect postMessage event listeners with innerHTML sink
severity: medium
type: ast
tech:
    - next

steps:
    - name: check_postMessage
      message: postMessage event listener detected
      esquery:
          type: esquery
          query: CallExpression[callee.object.name="window"][callee.property.name="addEventListener"][arguments.0.value="message"][arguments.1]
    # now, check if the second argument is a function and it has call to innerHtml
    - name: resolve_event_handler_function
      message: Code for postmessage event handler
      requires:
          - check_postMessage
      postMessageFuncResolve:
          name: check_postMessage
    - name: check_innerHtml
      message: Check if innerHTML is being assigned something
      requires:
          - resolve_event_handler_function
      checkAssignmentExist:
          name: resolve_event_handler_function
          type: innerHTML
          memberExpression: true
```

</details>

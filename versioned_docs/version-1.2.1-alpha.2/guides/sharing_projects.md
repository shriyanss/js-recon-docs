---
sidebar_position: 3
---

# Sharing Projects

JS Recon generates various output files/directories based on which modules are run.

However, most of the modules, directly or indirectly, rely on the main source code of the application.

## Share the lazyload output directory

This means that by just sharing the `output` directory (directory created by [`lazyload`](../docs/modules/lazyload.md) module), the recipient will be able to re-generate all the files again.

## Share the compressed working directory

In case that the files are different from what the tool has initially generate, just sharing the lazyload output folder is not enough.

To preserve those changes, the sender should compress the working directory (directory in which the `js-recon` command is run, and not the `output` directory) and share it with the recipient.

The recipient can uncompress the folder, and run the `js-recon` command in the same directory.

This method can be also used in shared folders on a network when multiple pentesters are collaborating on a project. This can be done using various methods, such as SFTP and SMB.

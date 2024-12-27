# process-interface

Process interface with class: ProcessManager, Process and ProcessError.

## Installation

```sh
npm i -s @allnulled/process-interface
```

## Importation

In node.js:

```js
require("@allnulled/process-interface");
```

In html:

```html
<script src="node_modules/@allnulled/process-interface/process-interface.js"></script>
```

## Usage

Este es el test que debería ser cross-env por sobrecarga de global `ProcessInterface`:

```js
const { ProcessManager, ProcessError } = new ProcessInterface();

const processManager = new ProcessManager();

// Crear procesos y subprocesos
const process1 = processManager.createProcess({ name: "MainProcess" });
const process1sub1 = process1.createSubprocess({ name: "SubProcess1" });
const process1sub2 = process1.createSubprocess({ name: "SubProcess2" });

console.log(process1sub1.rootProcess.pid); // PID del proceso principal

// Cerrar procesos
process1sub1.close(); // Cierra SubProcess1
console.log(process1.subprocesses); // SubProcess1 eliminado de la lista de subprocesses

process1.close(); // Cierra MainProcess y todos sus subprocesos restantes

try {
  process1sub2.close(); // Error: el proceso ya está cerrado
} catch (error) {
  console.error(error.message); // Output esperado
}
```
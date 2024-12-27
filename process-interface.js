(function (factory) {
  const mod = factory();
  if (typeof window !== 'undefined') {
    window['ProcessInterface'] = mod;
  }
  if (typeof global !== 'undefined') {
    global['ProcessInterface'] = mod;
  }
  if (typeof module !== 'undefined') {
    module.exports = mod;
  }
})(function () {

  return function () {

    const ProcessError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "ProcessError";
      }
    };

    const ProcessManager = class {
      static alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

      static _generateId(len = 30) {
        let id = "";
        while (id.length < len) {
          id += this.alphabet[Math.floor(Math.random() * this.alphabet.length)];
        }
        return `PID:${id}`;
      }

      constructor() {
        this.processes = {};
      }

      createProcess(base = {}, parentProcess = null) {
        const process = new Process(this, parentProcess, base);
        const pid = this._registerProcess(process);
        return process;
      }

      _registerProcess(process) {
        if (!(process instanceof Process)) {
          throw new ProcessError("Argument «process» must be an instance of «Process» in «_registerProcess»");
        }
        const pid = ProcessManager._generateId();
        this.processes[pid] = process;
        process.pid = pid;
        return pid;
      }

      _unregisterProcess(pid) {
        if (this.processes[pid]) {
          delete this.processes[pid];
        } else {
          throw new ProcessError(`Cannot unregister non-existent process with PID: ${pid}`);
        }
      }
    };

    const Process = class {
      constructor(processManager, parentProcess = null, base = {}) {
        Object.assign(this, base);
        this.processManager = processManager;
        this.parentProcess = parentProcess;
        this.pid = null; // Set when the process is registered
        this.state = "initialized"; // Possible states: initialized, running, paused, stopped, closed
        this.subprocesses = {};
      }

      createSubprocess(base = {}) {
        if (this.state === "closed") {
          throw new ProcessError(`Cannot create subprocess. Process ${this.pid} is already closed`);
        }
        const subprocess = this.processManager.createProcess(base, this);
        this.subprocesses[subprocess.pid] = subprocess;
        return subprocess;
      }

      close() {
        if (this.state === "closed") {
          throw new ProcessError(`Process ${this.pid} is already closed`);
        }
        this.state = "closed";
        console.log(`Process ${this.pid} closed.`);

        // Close all subprocesses
        for (const subPid in this.subprocesses) {
          this.subprocesses[subPid].close();
        }

        // Unregister from parent if it exists
        if (this.parentProcess) {
          delete this.parentProcess.subprocesses[this.pid];
        }

        // Unregister from manager
        this.processManager._unregisterProcess(this.pid);
      }

      get rootProcess() {
        let process = this;
        while (process.parentProcess) {
          process = process.parentProcess;
        }
        return process;
      }
    };

    Object.assign(this, {
      ProcessManager,
      Process,
      ProcessError,
    });

    return this;

  };
  
});

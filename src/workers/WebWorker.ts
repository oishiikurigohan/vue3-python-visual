declare global {
  interface DedicatedWorkerGlobalScope {
    pyodide: PyodideInterface
  }
}
declare let self: DedicatedWorkerGlobalScope

import { loadPyodide, type PyodideInterface } from 'pyodide'

const initScripts = {
  matplotlib: `
    import os
    os.environ['MPLBACKEND'] = 'AGG'

    import matplotlib.pyplot
    import base64
    from io import BytesIO
    
    def ensure_matplotlib_patch():
    
        def show():
            buf = BytesIO()
            matplotlib.pyplot.savefig(buf, format='png')
            buf.seek(0)
            img = base64.b64encode(buf.read()).decode('utf-8')
            matplotlib.pyplot.clf()
            return f'<img src="data:image/png;base64,{img}" style="max-width: 100%; max-height: 100%; height: auto">'
    
        matplotlib.pyplot.show = show
    
    ensure_matplotlib_patch()
  `
}

const loadPyodideAndPackages = async () => {
  self.pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full',
    packages: ['pandas', 'matplotlib']
  })
  await self.pyodide.runPythonAsync(initScripts['matplotlib'])
  self.pyodide.setStdin({ error: true })
  console.log('--- pyodide loaded..', self.pyodide)
}

export type RequestMessage = {
  script: string
  context: { [key: string]: any }
}

self.addEventListener('message', async (event: MessageEvent<RequestMessage>) => {
  await loadPyodideAndPackages()
  for (const key of Object.keys(event.data.context)) {
    ;(self as any)[key] = event.data.context[key]
  }
  await self.pyodide.loadPackagesFromImports(event.data.script)
  const result = await self.pyodide.runPythonAsync(event.data.script)
  self.postMessage(result)
})

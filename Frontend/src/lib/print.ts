export const openPrintWindow = (url: string, title = 'Print Preview') => {
  if (typeof window === 'undefined') return
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { margin: 0; display: flex; align-items: center; justify-content: center; background: white; }
          img { max-width: 100%; max-height: 95vh; object-fit: contain; }
        </style>
      </head>
      <body>
        <img src="${url}" alt="Print asset" />
        <script>window.onload = () => window.print();</script>
      </body>
    </html>
  `)
  win.document.close()
}

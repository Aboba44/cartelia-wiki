$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://127.0.0.1:8137/')
$listener.Start()
Write-Output "Serving $root at http://127.0.0.1:8137/"
$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.js'   = 'text/javascript; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
    '.woff2' = 'font/woff2'
}
while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    try {
        $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.Substring(1))
        if ($rel -eq '') { $rel = 'index.html' }
        $path = Join-Path $root $rel
        if (Test-Path -LiteralPath $path -PathType Leaf) {
            $bytes = [IO.File]::ReadAllBytes($path)
            $ext = [IO.Path]::GetExtension($path).ToLowerInvariant()
            if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
            $ctx.Response.ContentLength64 = $bytes.Length
            $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $ctx.Response.StatusCode = 404
        }
    } catch {
        $ctx.Response.StatusCode = 500
    } finally {
        $ctx.Response.Close()
    }
}

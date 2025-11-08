// sw.js

// Import Babel Standalone. This will be fetched when the SW installs.
self.importScripts('https://unpkg.com/@babel/standalone@7.24.7/babel.min.js');

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle requests for local .ts and .tsx files
    if (url.origin === self.location.origin && (url.pathname.endsWith('.ts') || url.pathname.endsWith('.tsx'))) {
        event.respondWith(transpileAndServe(request));
    }
});

async function transpileAndServe(request) {
    try {
        // Fetch the original file content
        const fileResponse = await fetch(request);

        // If the network request fails, pass the error through
        if (!fileResponse.ok) {
            return fileResponse;
        }

        const fileContent = await fileResponse.text();

        // Transpile using Babel
        const transpiledCode = self.Babel.transform(fileContent, {
            presets: ['react', 'typescript'],
            filename: request.url // Important for sourcemaps and error messages
        }).code;

        // Create a new response with the transpiled code and correct MIME type
        return new Response(transpiledCode, {
            headers: {
                'Content-Type': 'application/javascript; charset=utf-8'
            }
        });
    } catch (e) {
        console.error('Babel transpilation failed:', e);
        // If transpilation fails, return an error response
        return new Response(`Babel transpilation failed for ${request.url}:\n\n${e.message}`, {
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

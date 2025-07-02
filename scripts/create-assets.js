const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a simple SVG favicon
const faviconSvg = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#0ea5e9"/>
  <path d="M16 6C12.7 6 10 8.7 10 12C10 15.3 12.7 18 16 18C19.3 18 22 15.3 22 12C22 8.7 19.3 6 16 6ZM16 8.5C17.9 8.5 19.5 10.1 19.5 12C19.5 13.9 17.9 15.5 16 15.5C14.1 15.5 12.5 13.9 12.5 12C12.5 10.1 14.1 8.5 16 8.5Z" fill="white"/>
  <path d="M16 20C11.6 20 8 23.6 8 28H24C24 23.6 20.4 20 16 20Z" fill="white"/>
</svg>
`;

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Write favicon
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

// Create a simple ICO file (placeholder)
const simpleIco = Buffer.from('AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAABMLAAATCwAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==', 'base64');
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), simpleIco);

// Create apple-touch-icon
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), simpleIco);

console.log('✅ Static assets created successfully!');

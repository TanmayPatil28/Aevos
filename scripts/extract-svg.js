const potrace = require('potrace');
const fs = require('fs');

potrace.trace('public/brand/logo-light.png', { threshold: 120 }, function(err, svg) {
  if (err) {
    console.error('Error tracing logo-light.png:', err);
    return;
  }
  fs.writeFileSync('public/brand/logo-extracted.svg', svg);
  console.log('Successfully extracted SVG.');
});

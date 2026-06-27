import React from 'react';
import { renderToString } from 'react-dom/server';
import { WwdcBanner } from '../components/ui/wwdc-banner';

const html = renderToString(<WwdcBanner />);
console.log(html);

import { DSCountdown } from './countdown.js';

document.querySelectorAll('.countdown-holder').forEach(holder => {
    const type = holder.dataset.layoutType;
    
    DSCountdown({
        target: holder,
        enddate: '2026-05-17',
        animated: type === 'slide', // Only animate the slide version
        class: `layout-${type}`
    });
});
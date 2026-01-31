/**
 * Factory for a single digit slot
 * BEM: ds-countdown__digit
 */
function DSCountdownItemValueDigit({ parentEl, animated }) {
  let currentDigit = null;
  const container = document.createElement('span');
  container.className = 'ds-countdown__digit';
  
  let strip, currentSlot, nextSlot;

  if (animated) {
    strip = document.createElement('span');
    strip.className = 'ds-countdown__digit-strip';
    
    currentSlot = document.createElement('span');
    currentSlot.className = 'ds-countdown__digit-strip-item ds-countdown__digit-strip-item--current';
    
    nextSlot = document.createElement('span');
    nextSlot.className = 'ds-countdown__digit-strip-item ds-countdown__digit-strip-item--next';
    
    strip.append(currentSlot, nextSlot);
    container.appendChild(strip);
  } else {
    // Static mode uses a single slot centered in the fixed-width container
    currentSlot = document.createElement('span');
    currentSlot.className = 'ds-countdown__digit-static';
    container.appendChild(currentSlot);
  }

  parentEl.appendChild(container);

  return {
    update: function(newDigit) {
      if (newDigit === currentDigit) return;

      if (!animated || currentDigit === null) {
        currentSlot.textContent = newDigit;
      } else {
        nextSlot.textContent = newDigit;
        gsap.to(strip, {
          yPercent: -50,
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => {
            currentSlot.textContent = newDigit;
            gsap.set(strip, { yPercent: 0 });
          }
        });
      }
      currentDigit = newDigit;
    }
  };
}

/**
 * Factory for the Value component
 */
function DSCountdownItemValue({ parentEl, leadingZero, animated }) {
  const container = document.createElement('span');
  container.className = 'ds-countdown__value';
  parentEl.appendChild(container);

  let digits = [];

  // Always create digit containers if leadingZero is true to ensure layout stability
  if (leadingZero) {
    digits = [
        DSCountdownItemValueDigit({ parentEl: container, animated }), 
        DSCountdownItemValueDigit({ parentEl: container, animated })
    ];
  }

  return {
    update: function(newValue) {
      const displayValue = leadingZero 
        ? String(newValue).padStart(2, '0') 
        : String(newValue);
      
      if (leadingZero) {
        displayValue.split('').forEach((char, i) => {
          if (digits[i]) digits[i].update(char);
        });
      } else {
        if (container.textContent !== displayValue) {
          container.textContent = displayValue;
        }
      }
    }
  };
}

/**
 * Factory for individual countdown units
 */
function DSCountdownItem({ unit, parentEl, showLabel, leadingZero, animated }) {
  const itemEl = document.createElement('div');
  itemEl.className = `ds-countdown__item ds-countdown__item--${unit}`;

  const valueController = DSCountdownItemValue({ 
    parentEl: itemEl, 
    leadingZero, 
    animated 
  });

  if (showLabel) {
    const labelEl = document.createElement('span');
    labelEl.className = 'ds-countdown__label';
    labelEl.textContent = unit;
    itemEl.appendChild(labelEl);
  }

  parentEl.appendChild(itemEl);
  return { update: (val) => valueController.update(val) };
}

/**
 * Main Countdown Factory
 */
function DSCountdown({
  startdate = false,
  enddate,
  target = false,
  label = true,
  leadingZero = true,
  animated = false,
  class: className = false,
  months = true,
  days = true,
  hours = true,
  minutes = true,
  seconds = true
}) {
  if (!enddate) return null;
  const targetEl = typeof target === 'string' ? document.querySelector(target) : target;
  if (!targetEl) return null;

  targetEl.innerHTML = ''; 
  const container = document.createElement('div');
  container.className = 'ds-countdown';
  if (className) container.classList.add(...className.split(' ').filter(Boolean));
  targetEl.appendChild(container);

  const activeItems = {};
  const config = { months, days, hours, minutes, seconds };
  
  Object.entries(config).forEach(([unit, active]) => {
    if (active) {
      activeItems[unit] = DSCountdownItem({ unit, parentEl: container, showLabel: label, leadingZero, animated });
    }
  });

  let rafId = null;
  function tick() {
    const now = startdate ? new Date(startdate).getTime() : new Date().getTime();
    const distance = new Date(enddate).getTime() - now;

    if (distance <= 0) {
      container.innerHTML = '<div class="ds-countdown__expired">Expired</div>';
      return;
    }

    const values = {
      months: Math.floor(distance / (1000 * 60 * 60 * 24 * 30.44)),
      days: Math.floor((distance % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    };

    Object.keys(activeItems).forEach(u => activeItems[u].update(values[u]));
    if (!startdate) rafId = requestAnimationFrame(tick);
  }

  tick();
  return { stop: () => cancelAnimationFrame(rafId) };
}
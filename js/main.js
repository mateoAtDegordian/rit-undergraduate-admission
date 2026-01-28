document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initModal();
  initLazyLoad();
  initAnimate();
  initMarquee();
});

function initNavigation() {
  const nav = document.querySelector('nav');
  const hamburger = nav?.querySelector('.navigation__Hamburger');
  const links = nav?.querySelector('.navigation__Links');

  if (!nav || !hamburger || !links) {
    return;
  }

  const openClass = 'navigation__MobileList';

  const setMenuState = (isOpen) => {
    links.classList.toggle(openClass, isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  const closeMenu = () => setMenuState(false);

  const toggleMenu = () => {
    const willOpen = !links.classList.contains(openClass);
    setMenuState(willOpen);
  };

  hamburger.addEventListener('click', (event) => {
    event.preventDefault();
    toggleMenu();
  });

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (links.classList.contains(openClass)) {
        closeMenu();
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && links.classList.contains(openClass)) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && links.classList.contains(openClass)) {
      closeMenu();
    }
  });

  setMenuState(false);
}

function initModal() {
  const modal = document.querySelector('.videoPopUp');
  const closeButton = modal?.querySelector('.videoPopUp__Cancel');
  const iframe = modal?.querySelector('.videoPopUp__Player');
  const trigger = document.querySelector('.apply__VideoContainer');

  if (!modal || !closeButton || !iframe || !trigger) {
    return;
  }

  const defaultSrc = iframe.getAttribute('data-src') || '';
  trigger.setAttribute('aria-expanded', 'false');

  const setIframeSource = (shouldLoad) => {
    if (!shouldLoad) {
      iframe.setAttribute('src', '');
      return;
    }

    if (defaultSrc && iframe.getAttribute('src') !== defaultSrc) {
      iframe.setAttribute('src', defaultSrc);
    }
  };

  const closeModal = () => {
    modal.classList.remove('isActive');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('isModalOpen');
    trigger.setAttribute('aria-expanded', 'false');
    setIframeSource(false);
  };

  const openModal = () => {
    modal.classList.add('isActive');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('isModalOpen');
    trigger.setAttribute('aria-expanded', 'true');
    setIframeSource(true);
  };

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openModal();
  });

  closeButton.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('isActive')) {
      closeModal();
    }
  });
}

function initLazyLoad() {
  const selector = '[data-src], [data-srcset], [data-poster]';
  const candidates = document.querySelectorAll(selector);

  if (!candidates.length) {
    return;
  }

  const transfer = (node, attribute) => {
    const value = node.getAttribute(`data-${attribute}`);
    if (!value) {
      return;
    }
    node.setAttribute(attribute, value);
    node.removeAttribute(`data-${attribute}`);
  };

  const loadNode = (node) => {
    if (!node) {
      return;
    }

    if (node.tagName === 'PICTURE') {
      node.querySelectorAll('source').forEach(loadNode);
      const image = node.querySelector('img');
      if (image) {
        loadNode(image);
      }
      node.removeAttribute('data-not-lazy');
      return;
    }

    transfer(node, 'poster');
    transfer(node, 'src');
    transfer(node, 'srcset');

    if (node.dataset.notLazy !== undefined) {
      node.removeAttribute('data-not-lazy');
    }

    if (node.tagName === 'IMG') {
      const handleLoad = () => {
        node.classList.remove('isLoading');
        node.removeEventListener('load', handleLoad);
        node.removeEventListener('error', handleLoad);
      };

      if (!node.complete) {
        node.classList.add('isLoading');
        node.addEventListener('load', handleLoad);
        node.addEventListener('error', handleLoad);
      }
    }
  };

  const shouldBypassObserver = () => {
    const connection = navigator.connection;
    return Boolean(connection && (connection.saveData || /2g/.test(connection.effectiveType || '')));
  };

  if (!('IntersectionObserver' in window) || shouldBypassObserver()) {
    candidates.forEach(loadNode);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadNode(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px 0px' });

  candidates.forEach((node) => observer.observe(node));
}

function initAnimate() {
  const animatedElements = document.querySelectorAll('.animate');

  if (!animatedElements.length || !('IntersectionObserver' in window)) {
    return;
  }

  animatedElements.forEach((element) => {
    if (!element.classList.contains('isAnimated')) {
      element.classList.add('isAnimated');
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('isAnimated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  animatedElements.forEach((element) => observer.observe(element));
}

function initMarquee() {
  const marqueeRoot = document.querySelector('.home__Marquee');

  if (!marqueeRoot) {
    return;
  }

  const marqueeTexts = marqueeRoot.querySelectorAll('.home__MarqueeText');

  if (!marqueeTexts.length) {
    return;
  }

  const baseDuration = 5000;
  let resizeTimeout = null;

  const configureMarquee = () => {
    const sampleInner = marqueeRoot.querySelector('.home__MarqueeInnerText');
    if (!sampleInner) {
      return;
    }

    const innerWidth = sampleInner.clientWidth || 1;
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const loopCount = Math.max(1, Math.ceil(viewportWidth / innerWidth));

    marqueeTexts.forEach((text) => {
      const wrappers = Array.from(text.querySelectorAll('.home__MarqueeInnerText'));
      if (!wrappers.length) {
        return;
      }

      const baseWrapper = wrappers[0];
      wrappers.slice(1).forEach((wrapper) => wrapper.remove());

      for (let index = 1; index < loopCount; index += 1) {
        text.appendChild(baseWrapper.cloneNode(true));
      }

      text.style.animationPlayState = 'running';
      text.style.animationDuration = `${baseDuration * loopCount}ms`;
      text.style.animationDirection = text.dataset.direction === 'reverse' ? 'reverse' : 'normal';
    });
  };

  const handleResize = () => {
    if (resizeTimeout) {
      window.clearTimeout(resizeTimeout);
    }
    resizeTimeout = window.setTimeout(configureMarquee, 300);
  };

  configureMarquee();
  window.addEventListener('resize', handleResize);
}

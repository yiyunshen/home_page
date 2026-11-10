// All interactions run locally, without third-party scripts or tracking.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const footer = document.querySelector('.footer > div');
  const motionToggle = document.createElement('button');
  motionToggle.type = 'button';
  motionToggle.className = 'motion-toggle';
  let pauseMotion = reduceMotion.matches;
  const updateMotion = () => {
    document.documentElement.classList.toggle('motion-paused', pauseMotion);
    motionToggle.textContent = pauseMotion ? 'Animation: off' : 'Animation: on';
    motionToggle.setAttribute('aria-pressed', String(!pauseMotion));
  };
  motionToggle.addEventListener('click', () => { pauseMotion = !pauseMotion; updateMotion(); });
  footer.append(motionToggle);
  reduceMotion.addEventListener('change', event => { pauseMotion = event.matches; updateMotion(); });
  updateMotion();

  const bubbleMessages = {
    Outgoing: 'People, conversations, and new connections — yes, please.',
    Communicative: 'Good ideas get better when we talk them through.',
    Curious: 'There’s always another story, question, or perspective to explore.',
    Creative: 'A little imagination, from a Figma canvas to a camera frame.',
    Collaborative: 'Different perspectives make the work more interesting.'
  };
  const bubbleNote = document.querySelector('.bubble-note');
  document.querySelector('.bubble-hint').hidden = false;
  document.querySelectorAll('.personality li').forEach(item => {
    const label = item.textContent;
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = label;
    button.setAttribute('aria-pressed', 'false');
    item.replaceChildren(button);
    button.addEventListener('click', () => {
      document.querySelectorAll('.personality button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      bubbleNote.textContent = bubbleMessages[label];
      item.classList.remove('popping');
      void item.offsetWidth;
      item.classList.add('popping');
    });
    button.addEventListener('animationend', () => item.classList.remove('popping'));
  });

  const cards = [...document.querySelectorAll('.project-card')];
  const categories = ['social design', 'social design', 'social design', 'strategy', 'strategy', 'design'];
  cards.forEach((card, i) => { card.dataset.category = categories[i]; });
  document.querySelector('.project-filters').hidden = false;
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      cards.forEach(card => { card.hidden = filter !== 'all' && !card.dataset.category.split(' ').includes(filter); });
      const count = cards.filter(card => !card.hidden).length;
      document.querySelector('#project-status').textContent = `${count} projects shown`;
    });
  });

  const dialog = document.querySelector('.preview-dialog');
  let previousFocus;
  if (typeof dialog.showModal === 'function') {
    document.querySelectorAll('.project-card, .photo-gallery figure').forEach(container => {
      const image = container.querySelector('img');
      const source = container.querySelector('a');
      const title = container.querySelector('h3, figcaption').textContent;
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'quick-look'; button.textContent = 'Quick look ↗';
      button.setAttribute('aria-label', `Preview ${title}`);
      button.setAttribute('aria-haspopup', 'dialog');
      const target = container.querySelector('.project-copy') || container;
      target.append(button);
      button.addEventListener('click', () => {
        previousFocus = button;
        dialog.querySelector('#preview-title').textContent = title;
        const preview = dialog.querySelector('.preview-image');
        preview.src = image.src; preview.alt = image.alt;
        dialog.querySelector('.preview-caption').textContent = image.alt;
        dialog.querySelector('.preview-source').href = source.href;
        dialog.showModal();
        dialog.querySelector('.preview-close').focus();
      });
    });
    dialog.querySelector('.preview-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => previousFocus?.focus());
  }

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.05 });
    document.querySelectorAll('.education, .info-tile, .interest-grid article').forEach(element => {
      element.classList.add('reveal-ready'); revealObserver.observe(element);
    });
  }
  const progress = document.querySelector('.reading-progress');
  let scheduled = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
    scheduled = false;
  };
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();

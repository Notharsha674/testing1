// Lightweight interactivity for the demo page
(() => {
  const pointsEl = document.getElementById('points');
  const themeBtn = document.getElementById('themeToggle');
  const surpriseBtn = document.getElementById('surpriseBtn');
  const progressEl = document.getElementById('progress');
  const badgeEl = document.getElementById('badge');
  const resetBtn = document.getElementById('resetQuiz');

  let points = 0;
  const totalQuestions = document.querySelectorAll('.question').length;
  let answered = 0;

  function setPoints(v){
    points = v;
    pointsEl.textContent = points;
  }

  // Theme toggle
  themeBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    const pressed = themeBtn.getAttribute('aria-pressed') === 'true';
    themeBtn.setAttribute('aria-pressed', (!pressed).toString());
  });

  // Quiz logic
  document.querySelectorAll('.question').forEach((q, i) => {
    const choices = q.querySelectorAll('.choice');
    // define correct answers (simple map for demo)
    const correct = [1, 1, 2]; // indexes of correct button per question (0-based)
    choices.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        // ignore if already answered
        if (q.dataset.answered === 'true') return;
        q.dataset.answered = 'true';
        if (idx === correct[i]) {
          btn.classList.add('correct');
          setPoints(points + 10);
        } else {
          btn.classList.add('wrong');
          setPoints(points + 0);
          // show correct one
          choices[correct[i]].classList.add('correct');
        }
        answered++;
        updateProgress();
        checkBadge();
      });
    });
  });

  function updateProgress(){
    const pct = Math.round((answered / totalQuestions) * 100);
    progressEl.style.width = pct + '%';
    progressEl.parentElement.setAttribute('aria-valuenow', pct);
  }

  function checkBadge(){
    if (answered === totalQuestions){
      badgeEl.textContent = 'Quiz Master!';
      badgeEl.setAttribute('aria-hidden','false');
      // small bonus
      setPoints(points + 20);
    }
  }

  resetBtn.addEventListener('click', () => {
    document.querySelectorAll('.question').forEach(q => {
      q.dataset.answered = 'false';
      q.querySelectorAll('.choice').forEach(c => c.classList.remove('correct','wrong'));
    });
    answered = 0;
    setPoints(0);
    progressEl.style.width = '0%';
    badgeEl.textContent = '';
    badgeEl.setAttribute('aria-hidden','true');
  });

  // Drag & drop cards
  const cardList = document.getElementById('cardList');
  let dragEl = null;
  cardList.addEventListener('dragstart', e => {
    if (e.target.classList.contains('card')) {
      dragEl = e.target;
      e.target.classList.add('dragging');
    }
  });
  cardList.addEventListener('dragend', e => {
    if (e.target.classList.contains('card')) {
      e.target.classList.remove('dragging');
      dragEl = null;
    }
  });
  cardList.addEventListener('dragover', e => {
    e.preventDefault();
    const afterEl = getDragAfterElement(cardList, e.clientY);
    if (afterEl == null) {
      cardList.appendChild(dragEl);
    } else {
      cardList.insertBefore(dragEl, afterEl);
    }
  });
  cardList.addEventListener('drop', () => {
    // give a point for every drop
    setPoints(points + 1);
    popSound();
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  // Surprise (confetti + sound)
  surpriseBtn.addEventListener('click', () => {
    setPoints(points + 5);
    makeConfetti(30);
    popSound();
  });

  // Keyboard shortcut: S => surprise
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 's' && !e.metaKey && !e.ctrlKey) {
      surpriseBtn.classList.add('active');
      surpriseBtn.click();
      setTimeout(()=>surpriseBtn.classList.remove('active'), 200);
    }
  });

  // Confetti: create colored elements that fall
  function makeConfetti(count = 20){
    const root = document.getElementById('confetti-root');
    const colors = ['#ef4444','#f97316','#f59e0b','#10b981','#06b6d4','#7c3aed'];
    for (let i=0;i<count;i++){
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.position = 'absolute';
      el.style.left = (Math.random()*100) + '%';
      el.style.top = '-10px';
      el.style.width = (6 + Math.random()*8) + 'px';
      el.style.height = (8 + Math.random()*12) + 'px';
      el.style.background = colors[Math.floor(Math.random()*colors.length)];
      el.style.opacity = String(0.8 + Math.random()*0.2);
      el.style.transform = `rotate(${Math.random()*360}deg)`;
      el.style.borderRadius = '2px';
      el.style.pointerEvents = 'none';
      el.style.transition = 'transform 3s linear, top 3s ease-in, left 3s ease-in';
      root.appendChild(el);
      // trigger falling
      requestAnimationFrame(() => {
        el.style.top = (60 + Math.random()*40) + 'vh';
        el.style.left = (Math.random()*100) + '%';
        el.style.transform = `rotate(${Math.random()*720}deg) translateY(30px)`;
      });
      // remove after animation
      setTimeout(()=> el.remove(), 3500);
    }
  }

  // Minimal beep using WebAudio
  function popSound(){
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.02;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      setTimeout(()=>{ o.stop(); ctx.close(); }, 220);
    } catch (err) {
      // ignore if audio not available
    }
  }

  // Initialize defaults
  setPoints(0);
  progressEl.style.width = '0%';
})();

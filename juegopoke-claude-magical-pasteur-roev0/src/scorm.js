// SCORM 1.2 wrapper — graceful fallback when no LMS API present (standalone mode)
const SCORMManager = (function () {
  let api = null;
  let initialized = false;

  function findAPI(win) {
    let attempts = 0;
    while (win.API == null && win.parent != null && win.parent !== win) {
      attempts++;
      if (attempts > 7) return null;
      win = win.parent;
    }
    return win.API || null;
  }

  function getAPI() {
    if (window.API) return window.API;
    if (window.parent && window.parent.API) return window.parent.API;
    return findAPI(window);
  }

  return {
    isAvailable: false,

    init() {
      api = getAPI();
      if (!api) {
        console.warn('[SCORM] No LMS API found — running in standalone mode.');
        this.isAvailable = false;
        return false;
      }
      const result = api.LMSInitialize('');
      if (result === 'true' || result === true) {
        initialized = true;
        this.isAvailable = true;
        console.log('[SCORM] LMSInitialize OK');
        return true;
      }
      console.warn('[SCORM] LMSInitialize failed.');
      return false;
    },

    getValue(key) {
      if (!initialized) return '';
      return api.LMSGetValue(key);
    },

    setValue(key, value) {
      if (!initialized) return false;
      return api.LMSSetValue(key, String(value));
    },

    commit() {
      if (!initialized) return false;
      return api.LMSCommit('');
    },

    // Save progress to suspend_data (JSON stringified)
    saveProgress(stateObj) {
      if (!initialized) return;
      this.setValue('cmi.core.lesson_status', 'incomplete');
      this.setValue('cmi.suspend_data', JSON.stringify(stateObj));
      this.commit();
    },

    // Load progress from suspend_data
    loadProgress() {
      if (!initialized) return null;
      const raw = this.getValue('cmi.suspend_data');
      if (!raw || raw === '') return null;
      try { return JSON.parse(raw); } catch (e) { return null; }
    },

    // Call on game complete — score 0-100
    finish(score) {
      if (!initialized) {
        console.log(`[SCORM Standalone] Final score: ${score}/100`);
        return;
      }
      this.setValue('cmi.core.score.raw', String(score));
      this.setValue('cmi.core.score.min', '0');
      this.setValue('cmi.core.score.max', '100');
      this.setValue('cmi.core.lesson_status', score >= 80 ? 'passed' : 'failed');
      this.setValue('cmi.suspend_data', '');
      this.commit();
      api.LMSFinish('');
    }
  };
})();

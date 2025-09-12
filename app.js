
(function () {
    const singleTab = document.getElementById('singleTab');
    const multiTab = document.getElementById('multiTab');
    const singleSection = document.getElementById('singleSection');
    const multiSection = document.getElementById('multiSection');
    const apiKeyInput = document.getElementById('apiKey');
    const toggleVisBtn = document.getElementById('toggleVis');
    const checkBtn = document.getElementById('checkBtn');
    const resultEl = document.getElementById('result');
    const apiKeysTextarea = document.getElementById('apiKeys');
    const checkManyBtn = document.getElementById('checkManyBtn');
    const multiResultEl = document.getElementById('multiResult');

    function setResult(message, cls) {
        resultEl.className = 'result ' + (cls || '');
        resultEl.style.opacity = '0';
        resultEl.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            resultEl.textContent = message;
            resultEl.style.opacity = '1';
            resultEl.style.transform = 'translateY(0)';
        }, 150);
    }

    function setMultiResult(message, cls) {
        multiResultEl.className = 'result ' + (cls || '');
        multiResultEl.style.opacity = '0';
        multiResultEl.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            multiResultEl.textContent = message;
            multiResultEl.style.opacity = '1';
            multiResultEl.style.transform = 'translateY(0)';
        }, 150);
    }

    function sanitizeKey(raw) {
        return (raw || '').trim();
    }

    function setMode(isSingle) {
        singleSection.hidden = !isSingle;
        multiSection.hidden = isSingle;
        singleTab.classList.toggle('active', isSingle);
        singleTab.setAttribute('aria-selected', String(isSingle));
        multiTab.classList.toggle('active', !isSingle);
        multiTab.setAttribute('aria-selected', String(!isSingle));
    }

    if (singleTab && multiTab) {
        singleTab.addEventListener('click', function () { setMode(true); });
        multiTab.addEventListener('click', function () { setMode(false); });
    }

    toggleVisBtn.addEventListener('click', function () {
        const isPassword = apiKeyInput.type === 'password';
        apiKeyInput.type = isPassword ? 'text' : 'password';
        if (isPassword) {
            // now visible → show eye-off (stroke-based)
            toggleVisBtn.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\
<path d="M3 3l18 18"/>\
<path d="M10.73 5.08A10.5 10.5 0 0 1 21 12c-1.84 3.76-5.14 6-9 6-1.23 0-2.4-.24-3.46-.68"/>\
<path d="M6.53 6.53A10.6 10.6 0 0 0 3 12c1.84 3.76 5.14 6 9 6 1.64 0 3.18-.38 4.5-1.05"/>\
<path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88"/>\
</svg>';
        } else {
            // now hidden → show open eye (filled)
            toggleVisBtn.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path d="M12 5c-5.5 0-9.5 4.5-10.5 6 .99 1.5 5 6 10.5 6s9.51-4.5 10.5-6C21.5 9.5 17.5 5 12 5Zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2.5A1.5 1.5 0 1 0 12 9a1.5 1.5 0 0 0 0 3.5Z"/></svg>';
        }
    });

    checkBtn.addEventListener('click', async function () {
        const key = sanitizeKey(apiKeyInput.value);
        if (!key) {
            setResult('Please paste an API key first.', 'bad');
            apiKeyInput.focus();
            // Add shake animation to input
            apiKeyInput.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                apiKeyInput.style.animation = '';
            }, 500);
            return;
        }

        checkBtn.disabled = true;
        checkBtn.style.transform = 'scale(0.98)';
        checkBtn.style.opacity = '0.8';
        
        // Add loading animation
        const originalText = checkBtn.textContent;
        checkBtn.textContent = 'Checking...';
        
        setResult('Checking key…', 'muted');

        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1/models?key=' + encodeURIComponent(key), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.status === 200) {
                setResult('✅ Valid & working API key', 'ok');
                // Add success animation
                checkBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                setTimeout(() => {
                    checkBtn.style.background = '';
                }, 2000);
            } else if (response.status === 401) {
                setResult('❌ Invalid API key', 'bad');
                // Add error animation
                checkBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                setTimeout(() => {
                    checkBtn.style.background = '';
                }, 2000);
            } else {
                setResult('⚠️ Key might be valid but restricted (status: ' + response.status + ')', 'warn');
            }
        } catch (error) {
            setResult('⚠️ Network or CORS error. Details: ' + (error && error.message ? error.message : String(error)), 'warn');
        } finally {
            checkBtn.disabled = false;
            checkBtn.textContent = originalText;
            checkBtn.style.transform = '';
            checkBtn.style.opacity = '';
        }
    });

    apiKeyInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            checkBtn.click();
        }
    });

    function maskKey(key) {
        const k = sanitizeKey(key);
        if (k.length <= 10) return k.replace(/.(?=.{4})/g, '•');
        return k.slice(0, 6) + '…' + k.slice(-4);
    }

    async function checkOneKeyRaw(key) {
        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1/models?key=' + encodeURIComponent(key), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            return { status: response.status };
        } catch (error) {
            return { error: error && error.message ? error.message : String(error) };
        }
    }

    checkManyBtn.addEventListener('click', async function () {
        const lines = (apiKeysTextarea.value || '')
            .split(/\r?\n|,/) // support newline or comma separated
            .map(s => s.trim())
            .filter(Boolean);

        if (lines.length === 0) {
            setMultiResult('Please enter at least one API key.', 'bad');
            apiKeysTextarea.focus();
            // Add shake animation to textarea
            apiKeysTextarea.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                apiKeysTextarea.style.animation = '';
            }, 500);
            return;
        }

        checkManyBtn.disabled = true;
        checkManyBtn.style.transform = 'scale(0.98)';
        checkManyBtn.style.opacity = '0.8';
        
        // Add loading animation
        const originalText = checkManyBtn.textContent;
        checkManyBtn.textContent = 'Checking...';
        
        setMultiResult('Checking ' + lines.length + ' key' + (lines.length > 1 ? 's' : '') + '…', 'muted');

        const checks = await Promise.allSettled(lines.map(k => checkOneKeyRaw(k)));

        const messages = checks.map((res, idx) => {
            const label = maskKey(lines[idx]);
            if (res.status !== 'fulfilled') {
                return '• ' + label + ' → ⚠️ Error (' + (res.reason && res.reason.message ? res.reason.message : 'unknown') + ')';
            }
            const data = res.value;
            if (data && typeof data.status === 'number') {
                if (data.status === 200) return '• ' + label + ' → ✅ Valid (200)';
                if (data.status === 401) return '• ' + label + ' → ❌ Invalid (401)';
                return '• ' + label + ' → ⚠️ Maybe restricted (' + data.status + ')';
            }
            return '• ' + label + ' → ⚠️ Network/CORS error';
        });

        // Count results for animation
        const validCount = messages.filter(m => m.includes('✅')).length;
        const invalidCount = messages.filter(m => m.includes('❌')).length;
        
        setMultiResult(messages.join('\n'));
        
        // Add result-based animation
        if (validCount > 0 && invalidCount === 0) {
            checkManyBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        } else if (validCount === 0 && invalidCount > 0) {
            checkManyBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        } else if (validCount > 0 && invalidCount > 0) {
            checkManyBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        }
        
        setTimeout(() => {
            checkManyBtn.style.background = '';
        }, 2000);
        
        checkManyBtn.disabled = false;
        checkManyBtn.textContent = originalText;
        checkManyBtn.style.transform = '';
        checkManyBtn.style.opacity = '';
    });
})();

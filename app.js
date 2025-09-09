
(function () {
    const apiKeyInput = document.getElementById('apiKey');
    const toggleVisBtn = document.getElementById('toggleVis');
    const checkBtn = document.getElementById('checkBtn');
    const resultEl = document.getElementById('result');
    const apiKeysTextarea = document.getElementById('apiKeys');
    const checkManyBtn = document.getElementById('checkManyBtn');
    const multiResultEl = document.getElementById('multiResult');

    function setResult(message, cls) {
        resultEl.className = 'result ' + (cls || '');
        resultEl.textContent = message;
    }

    function setMultiResult(message, cls) {
        multiResultEl.className = 'result ' + (cls || '');
        multiResultEl.textContent = message;
    }

    function sanitizeKey(raw) {
        return (raw || '').trim();
    }

    toggleVisBtn.addEventListener('click', function () {
        const isPassword = apiKeyInput.type === 'password';
        apiKeyInput.type = isPassword ? 'text' : 'password';
        toggleVisBtn.textContent = isPassword ? '🙈' : '👁️';
    });

    checkBtn.addEventListener('click', async function () {
        const key = sanitizeKey(apiKeyInput.value);
        if (!key) {
            setResult('Please paste an API key first.', 'bad');
            apiKeyInput.focus();
            return;
        }

        checkBtn.disabled = true;
        setResult('Checking key…', 'muted');

        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + key,
                    'Accept': 'application/json'
                }
            });

            if (response.status === 200) {
                setResult('✅ Valid & working API key', 'ok');
            } else if (response.status === 401) {
                setResult('❌ Invalid API key', 'bad');
            } else {
                setResult('⚠️ Key might be valid but restricted (status: ' + response.status + ')', 'warn');
            }
        } catch (error) {
            setResult('⚠️ Network or CORS error. Details: ' + (error && error.message ? error.message : String(error)), 'warn');
        } finally {
            checkBtn.disabled = false;
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
            const response = await fetch('https://generativelanguage.googleapis.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + key,
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
            return;
        }

        checkManyBtn.disabled = true;
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

        setMultiResult(messages.join('\n'));
        checkManyBtn.disabled = false;
    });
})();
